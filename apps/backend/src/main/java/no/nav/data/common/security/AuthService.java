package no.nav.data.common.security;

import io.prometheus.client.Gauge;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.UnauthorizedException;
import no.nav.data.common.security.domain.Auth;
import no.nav.data.common.security.domain.AuthRepository;
import no.nav.data.common.utils.Constants;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.utils.StringUtils;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.apache.commons.lang3.StringUtils.isBlank;

@Slf4j
@Service
@Transactional
public class AuthService {

    private static final Gauge uniqueUsers = MetricUtils.gauge()
            .labels("hour").labels("day").labels("week").labels("twoweek")
            .labelNames("period")
            .name("auth_users_active").help("Users active")
            .register();

    private final AuthRepository authRepository;
    private final Encryptor encryptor;

    public AuthService(AuthRepository authRepository, Encryptor refreshTokenEncryptor) {
        this.authRepository = authRepository;
        this.encryptor = refreshTokenEncryptor;
    }

    public Auth getAuth(String sessionId, String sessionKey) {
        var sessUuid = StringUtils.toUUID(sessionId);
        Auth auth = authRepository.findById(sessUuid)
                .orElseThrow(() -> new NotFoundException("couldn't find session"))
                .addSecret(encryptor, sessionKey);
        if (isBlank(auth.getEncryptedRefreshToken())) {
            throw new UnauthorizedException("session is terminated");
        }
        if (auth.getLastActive().isBefore(LocalDateTime.now().minusMinutes(1))) {
            auth.setLastActive(LocalDateTime.now());
        }
        return auth;
    }

    public String createAuth(String userId, String refreshToken) {
        var enc = encryptor.encrypt(refreshToken);
        var auth = authRepository.save(Auth.builder()
                .generateId()
                .userId(userId)
                .encryptedRefreshToken(enc.cipher())
                .initiated(LocalDateTime.now())
                .lastActive(LocalDateTime.now())
                .build())
                .addSecret(encryptor, enc.salt());
        return auth.session();
    }

    public void endSession(UUID id) {
        Auth auth = authRepository.findById(id).orElseThrow();
        auth.setEncryptedRefreshToken("");
    }

    @Scheduled(initialDelayString = "PT1M", fixedRateString = "PT10M")
    public void cleanOldAuth() {
        List<Auth> auths = authRepository.findByLastActiveBefore(LocalDateTime.now().minus(Constants.SESSION_LENGTH.plusHours(1)));
        for (Auth auth : auths) {
            authRepository.delete(auth);
            log.debug("Deleting old auth for user {}", auth.getUserId());
        }
    }

    @Scheduled(initialDelayString = "PT1M", fixedRateString = "PT1M")
    public void gatherMetrics() {
        uniqueUsers.labels("hour").set(countActiveLast(Duration.ofHours(1)));
        uniqueUsers.labels("day").set(countActiveLast(Duration.ofDays(1)));
        uniqueUsers.labels("week").set(countActiveLast(Duration.ofDays(7)));
        uniqueUsers.labels("twoweek").set(countActiveLast(Duration.ofDays(14)));
    }

    private long countActiveLast(Duration duration) {
        return authRepository.countDistinctUserIdByLastActiveAfter(LocalDateTime.now().minus(duration));
    }
}
