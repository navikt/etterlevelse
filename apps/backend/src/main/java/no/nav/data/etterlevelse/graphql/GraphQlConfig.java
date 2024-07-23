package no.nav.data.etterlevelse.graphql;

import graphql.scalars.ExtendedScalars;
import graphql.schema.GraphQLScalarType;
import no.nav.data.etterlevelse.graphql.support.LocalDateTimeCoercing;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;



@Configuration
public class GraphQlConfig {

    private GraphQLScalarType date() {
        return ExtendedScalars.Date;
    }

    private GraphQLScalarType dateTime() {
        return LocalDateTimeCoercing.createScalar();
    }

    private GraphQLScalarType nonNegativeInt() {
        return ExtendedScalars.NonNegativeInt;
    }

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
                .scalar(date())
                .scalar(dateTime())
                .scalar(nonNegativeInt());
    }



}
