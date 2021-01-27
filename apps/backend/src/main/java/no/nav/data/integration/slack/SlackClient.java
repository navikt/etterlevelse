package no.nav.data.integration.slack;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.web.TraceHeaderRequestInterceptor;
import no.nav.data.integration.slack.dto.SlackDtos.Channel;
import no.nav.data.integration.slack.dto.SlackDtos.CreateConversationRequest;
import no.nav.data.integration.slack.dto.SlackDtos.CreateConversationResponse;
import no.nav.data.integration.slack.dto.SlackDtos.ListChannelResponse;
import no.nav.data.integration.slack.dto.SlackDtos.PostMessageRequest;
import no.nav.data.integration.slack.dto.SlackDtos.PostMessageRequest.Block;
import no.nav.data.integration.slack.dto.SlackDtos.PostMessageResponse;
import no.nav.data.integration.slack.dto.SlackDtos.Response;
import no.nav.data.integration.slack.dto.SlackDtos.UserResponse;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

import static java.util.Objects.requireNonNull;
import static no.nav.data.common.utils.StreamUtils.toMap;

@Slf4j
@Service
public class SlackClient {

    private static final String LOOKUP_BY_EMAIL = "/users.lookupByEmail?email={email}";
    private static final String OPEN_CONVERSATION = "/conversations.open";
    private static final String POST_MESSAGE = "/chat.postMessage";
    private static final String LIST_CONVERSATIONS = "/conversations.list";

    private static final int MAX_BLOCKS_PER_MESSAGE = 50;
    private static final int MAX_CHARS_PER_BLOCK = 3000;
    public static final String SINGLETON = "SINGLETON";

    private final TeamcatResourceClient resourceClient;
    private final RestTemplate restTemplate;
    private final LoadingCache<String, String> userIdCache;
    private final LoadingCache<String, String> conversationCache;
    private final LoadingCache<String, Map<String, Channel>> channelCache;
    private final ConcurrentMap<String, Channel> channels = new ConcurrentHashMap<>();

    public SlackClient(TeamcatResourceClient resourceClient, RestTemplateBuilder restTemplateBuilder, SlackProperties properties) {
        this.resourceClient = resourceClient;
        restTemplate = restTemplateBuilder
                .additionalInterceptors(TraceHeaderRequestInterceptor.correlationInterceptor())
                .rootUri(properties.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getToken())
                .build();

        this.userIdCache = MetricUtils.register("slackUserIdCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(60))
                        .maximumSize(1000).build(this::doGetUserId));
        this.conversationCache = MetricUtils.register("slackConversationCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(60))
                        .maximumSize(1000).build(this::doOpenConversation));
        this.channelCache = MetricUtils.register("slackChannelCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(30))
                        .maximumSize(1).build(k -> toMap(getChannels(), Channel::getId)));
    }

    public List<Channel> searchChannel(String name) {
        return getChannelCached().values().stream()
                .filter(channel -> StringUtils.containsIgnoreCase(channel.getName(), name))
                .collect(Collectors.toList());
    }

    public Channel getChannel(String channelId) {
        return getChannelCached().get(channelId);
    }

    public String getUserIdByIdent(String ident) {
        var email = resourceClient.getResource(ident).orElseThrow().getEmail();
        return getUserIdByEmail(email);
    }

    public String getUserIdByEmail(String email) {
        return userIdCache.get(email);
    }

    public String openConversation(String channelId) {
        return conversationCache.get(channelId);
    }

    private Map<String, Channel> getChannelCached() {
        return requireNonNull(channelCache.get(SINGLETON));
    }

    private List<Channel> getChannels() {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        var all = new ArrayList<Channel>();
        ListChannelResponse list;
        String cursor = null;
        do {
            // Operation does not support json requests
            MultiValueMap<String, String> reqForm = new LinkedMultiValueMap<>();
            if (cursor != null) {
                reqForm.add("cursor", cursor);
            }
            reqForm.add("limit", "1000");
            reqForm.add("exclude_archived", "true");

            var response = restTemplate.postForEntity(LIST_CONVERSATIONS, new HttpEntity<>(reqForm, headers), ListChannelResponse.class);
            list = checkResponse(response);
            cursor = list.getResponseMetadata().getNextCursor();
            all.addAll(list.getChannels());
        } while (!StringUtils.isBlank(cursor));
        return all;
    }

    private String doGetUserId(String email) {
        try {
            var response = restTemplate.getForEntity(LOOKUP_BY_EMAIL, UserResponse.class, email);
            UserResponse user = checkResponse(response);
            return user.getUser().getId();
        } catch (Exception e) {
            if (e.getMessage().contains("users_not_found")) {
                log.debug("Couldn't find user for email {}", email);
                return null;
            }
            throw new TechnicalException("Failed to get userId for " + email, e);
        }
    }

    public void sendMessageToUser(String email, List<Block> blocks) {
        try {
            var userId = getUserIdByEmail(email);
            if (userId == null) {
                throw new NotFoundException("Couldn't find slack user for email" + email);
            }
            var channel = openConversation(userId);
            List<List<Block>> partitions = ListUtils.partition(splitLongBlocks(blocks), MAX_BLOCKS_PER_MESSAGE);
            partitions.forEach(partition -> doSendMessageToChannel(channel, partition));
        } catch (Exception e) {
            throw new TechnicalException("Failed to send message to " + email + " " + JsonUtils.toJson(blocks), e);
        }
    }

    public void sendMessageToChannel(String channel, List<Block> blocks) {
        try {
            List<List<Block>> partitions = ListUtils.partition(splitLongBlocks(blocks), MAX_BLOCKS_PER_MESSAGE);
            partitions.forEach(partition -> doSendMessageToChannel(channel, partition));
        } catch (Exception e) {
            throw new TechnicalException("Failed to send message to " + channel + " " + JsonUtils.toJson(blocks), e);
        }
    }

    private void doSendMessageToChannel(String channel, List<Block> blockKit) {
        var request = new PostMessageRequest(channel, blockKit);
        var response = restTemplate.postForEntity(POST_MESSAGE, request, PostMessageResponse.class);
        try {
            checkResponse(response);
        } catch (Exception e) {
            throw new TechnicalException("Failed to send message to channel " + channel, e);
        }
    }

    private String doOpenConversation(String userId) {
        try {
            var response = restTemplate.postForEntity(OPEN_CONVERSATION, new CreateConversationRequest(userId), CreateConversationResponse.class);
            CreateConversationResponse create = checkResponse(response);
            return create.getChannel().getId();
        } catch (Exception e) {
            throw new TechnicalException("Failed to get channel for " + userId, e);
        }
    }

    @SuppressWarnings("unchecked")
    private <T> T checkResponse(ResponseEntity<? extends Response> response) {
        Assert.notNull(response.getBody(), "empty body");
        Assert.isTrue(response.getBody().isOk(), "Not ok error: " + response.getBody().getError());
        return (T) response.getBody();
    }

    private List<Block> splitLongBlocks(List<Block> blocks) {
        var newBlocks = new ArrayList<Block>();
        for (Block block : blocks) {
            if (block.getText() == null || block.getText().getText().length() <= MAX_CHARS_PER_BLOCK) {
                newBlocks.add(block);
            } else {
                var text = block.getText().getText();
                var lines = StringUtils.splitPreserveAllTokens(text, StringUtils.LF);
                var sb = new StringBuilder(StringUtils.LF);
                for (String line : lines) {
                    if (sb.length() + line.length() >= MAX_CHARS_PER_BLOCK) {
                        newBlocks.add(block.withText(sb.toString()));
                        sb = new StringBuilder(StringUtils.LF);
                    }
                    sb.append(line).append(StringUtils.LF);
                }
                newBlocks.add(block.withText(sb.toString()));
            }
        }
        return newBlocks;
    }
}
