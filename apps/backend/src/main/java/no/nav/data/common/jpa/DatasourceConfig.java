package no.nav.data.common.jpa;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import static java.util.concurrent.TimeUnit.MINUTES;

@Slf4j
@Configuration
public class DatasourceConfig {


    @Bean
    public HikariDataSource dataSource(DataSourceProperties properties) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(properties.getUrl());
        config.setMinimumIdle(1);
        config.setMaximumPoolSize(2);
        config.setIdleTimeout(MINUTES.toMillis(5));
        config.setMaxLifetime(MINUTES.toMillis(9));
        config.setUsername(properties.getUsername());
        config.setPassword(properties.getPassword());
        log.info("Creating datasource user={} url={}", config.getUsername(), config.getJdbcUrl());
        return new HikariDataSource(config);
    }

}
