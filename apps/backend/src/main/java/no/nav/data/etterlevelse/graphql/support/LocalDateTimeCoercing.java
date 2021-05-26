package no.nav.data.etterlevelse.graphql.support;

import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.GraphQLScalarType;

import java.time.DateTimeException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.function.Function;

import static graphql.scalars.util.Kit.typeName;

/**
 * based on {@link graphql.scalars.datetime.DateTimeScalar}
 */
public class LocalDateTimeCoercing implements Coercing<LocalDateTime, String> {

    public static final DateTimeFormatter ISO_LOCAL_DATE_TIME = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public String serialize(Object input) throws CoercingSerializeException {
        LocalDateTime localDateTime;
        if (input instanceof LocalDateTime ldt) {
            localDateTime = ldt;
        } else if (input instanceof String s) {
            localDateTime = parseLocalDateTime(s, CoercingSerializeException::new);
        } else {
            throw new CoercingSerializeException("Expected something we can convert to 'java.time.LocalDateTime' but was '" + typeName(input) + "'.");
        }
        try {
            return ISO_LOCAL_DATE_TIME.format(localDateTime);
        } catch (DateTimeException e) {
            throw new CoercingSerializeException("Unable to turn TemporalAccessor into LocalDateTime becauseof : '" + e.getMessage() + "'.");
        }
    }

    @Override
    public LocalDateTime parseValue(Object input) throws CoercingParseValueException {
        LocalDateTime localDateTime;
        if (input instanceof LocalDateTime ldt) {
            localDateTime = ldt;
        } else if (input instanceof String s) {
            localDateTime = parseLocalDateTime(s, CoercingParseValueException::new);
        } else {
            throw new CoercingParseValueException("Expected a 'String' but was '" + typeName(input) + "'.");
        }
        return localDateTime;
    }

    @Override
    public LocalDateTime parseLiteral(Object input) throws CoercingParseLiteralException {
        if (!(input instanceof StringValue)) {
            throw new CoercingParseLiteralException("Expected AST type 'StringValue' but was '" + typeName(input) + "'.");
        }
        return parseLocalDateTime(((StringValue) input).getValue(), CoercingParseLiteralException::new);
    }

    private LocalDateTime parseLocalDateTime(String s, Function<String, RuntimeException> exceptionMaker) {
        try {
            return LocalDateTime.parse(s, ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e) {
            throw exceptionMaker.apply("Invalid ISO-8601 value : '" + s + "'. because of : '" + e.getMessage() + "'");
        }
    }

    public static GraphQLScalarType createScalar() {
        return GraphQLScalarType.newScalar()
                .name("DateTime")
                .description("An ISO-8601 compliant DateTime Scalar")
                .coercing(new LocalDateTimeCoercing())
                .build();
    }
}
