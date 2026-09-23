package no.nav.data.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.prometheus.client.CollectorRegistry;
import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.jdbctemplate.JdbcTemplateLockProvider;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.utils.UtcLocalDateTimeJackson3Serializer;
import no.nav.data.common.web.TraceHeaderRequestInterceptor;
import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.boot.restclient.RestTemplateCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.cfg.DateTimeFeature;
import tools.jackson.databind.module.SimpleModule;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class CommonConfig {

    @Primary
    @Bean
    public ObjectMapper objectMapper() {
        // ObjectMapper oppfører seg ikke-deterministisk hvis flere tråder bruker den samtidig, og der minst en av dem konfigurerer den.
        // Dessuten kan forskjellige klienter konfigurere den på hver sin måte, noe som vil sabotere for andre.
        // OM er kostbare å konstruere, men her skal vi ikke returnere en delt OM. 
        return JsonUtils.createRestObjectMapper();
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .additionalInterceptors(TraceHeaderRequestInterceptor.fullInterceptor())
                .build();
    }

    @Bean
    @Profile("!test & !local")
    public RestTemplate externalRestTemplate(RestTemplateBuilder builder) {
        return builder
                .additionalInterceptors(TraceHeaderRequestInterceptor.correlationInterceptor())
                .build();
    }

    /**
     * Customize Spring Boot's auto-configured Jackson 3 {@code JsonMapper} (used by the default
     * {@code JacksonJsonHttpMessageConverter}) to match the previous REST serialization behavior:
     * ignore unknown properties, write dates as ISO strings, and emit {@link LocalDateTime} as UTC with a 'Z' offset.
     * <p>
     * Customizing the default converter (instead of registering a custom Jackson converter bean) keeps the standard
     * converter ordering, so {@code byte[]} responses such as the springdoc OpenAPI document served at
     * {@code /swagger-docs} are written as raw bytes rather than Base64-encoded JSON strings.
     */
    @Bean
    public JsonMapperBuilderCustomizer restJsonMapperBuilderCustomizer() {
        SimpleModule utcLocalDateTimeModule = new SimpleModule();
        utcLocalDateTimeModule.addSerializer(LocalDateTime.class, new UtcLocalDateTimeJackson3Serializer());
        return builder -> builder
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .disable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS)
                .addModule(utcLocalDateTimeModule);
    }

    /**
     * In Spring Boot 4 a Jackson converter can be ordered ahead of the {@link StringHttpMessageConverter} on the
     * {@link RestTemplate}, which makes it try to parse JSON into String.class (e.g. when tests read the raw body).
     * Ensure String reads are handled by {@link StringHttpMessageConverter} by moving it to the front of the list.
     */
    @Bean
    public RestTemplateCustomizer stringConverterFirstRestTemplateCustomizer() {
        return restTemplate -> {
            List<HttpMessageConverter<?>> converters = restTemplate.getMessageConverters();
            List<HttpMessageConverter<?>> stringConverters = converters.stream()
                    .filter(StringHttpMessageConverter.class::isInstance)
                    .toList();
            if (!stringConverters.isEmpty()) {
                converters.removeAll(stringConverters);
                converters.addAll(0, stringConverters);
            }
        };
    }

    /**
     * Make sure spring uses the defaultRegistry
     */
    @Bean
    public CollectorRegistry collectorRegistry() {
        return CollectorRegistry.defaultRegistry;
    }

    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(JdbcTemplateLockProvider.Configuration.builder()
                .withJdbcTemplate(new JdbcTemplate(dataSource))
                .usingDbTime()
                .build());
    }

}
