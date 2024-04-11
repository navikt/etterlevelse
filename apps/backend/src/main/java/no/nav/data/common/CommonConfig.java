package no.nav.data.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.prometheus.client.CollectorRegistry;
import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.jdbctemplate.JdbcTemplateLockProvider;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.web.TraceHeaderRequestInterceptor;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestTemplate;

import javax.sql.DataSource;

@Configuration
public class CommonConfig {

    private static ObjectMapper omForHttpMessageConverter = JsonUtils.createObjectMapper();
    
    @Primary
    @Bean
    public ObjectMapper objectMapper() {
        // ObjectMapper oppfører seg ikke-deterministisk hvis flere tråder bruker den samtidig, og der minst en av dem konfigurerer den.
        // Dessuten kan forskjellige klienter konfigurere den på hver sin måte, noe som vil sabotere for andre.
        // OM er kostbare å konstruere, men her skal vi ikke returnere en delt OM. 
        return JsonUtils.createObjectMapper();
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

    @Bean
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();
        jsonConverter.setObjectMapper(omForHttpMessageConverter);
        return jsonConverter;
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
