package no.nav.data.etterlevelse.graphql;

import graphql.scalars.ExtendedScalars;
import no.nav.data.etterlevelse.graphql.support.LocalDateTimeCoercing;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;



@Configuration
public class GraphQlConfig {
    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
                .scalar(ExtendedScalars.Date)
                .scalar(LocalDateTimeCoercing.createScalar())
                .scalar(ExtendedScalars.NonNegativeInt);
    }
}
