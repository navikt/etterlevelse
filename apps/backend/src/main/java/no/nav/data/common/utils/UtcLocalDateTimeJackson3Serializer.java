package no.nav.data.common.utils;

import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonGenerator;
import tools.jackson.databind.SerializationContext;
import tools.jackson.databind.ser.std.StdSerializer;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * Serializes {@link LocalDateTime} for HTTP responses. Timestamps are stored as UTC {@code LocalDateTime};
 * emit them with a 'Z' offset so clients parse them as UTC.
 */
public class UtcLocalDateTimeJackson3Serializer extends StdSerializer<LocalDateTime> {

    public UtcLocalDateTimeJackson3Serializer() {
        super(LocalDateTime.class);
    }

    @Override
    public void serialize(LocalDateTime value, JsonGenerator gen, SerializationContext ctxt) throws JacksonException {
        gen.writeString(value.atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
    }
}

