package no.nav.data.common.utils;

import no.nav.data.common.exceptions.TechnicalException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectReader;
import tools.jackson.databind.cfg.DateTimeFeature;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.module.SimpleModule;

import java.time.LocalDateTime;

public final class JsonUtils {

    private JsonUtils() {
    }

    private static final JsonMapper objectMapper = createObjectMapper();

    public static JsonMapper createObjectMapper() {
        // Jackson 3 auto-registers java.time support; keep dates as ISO strings and ignore unknown properties.
        return JsonMapper.builder()
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .disable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
    }

    // For HTTP responses only: emit LocalDateTime as UTC with a 'Z' offset so clients render local time correctly.
    public static JsonMapper createRestObjectMapper() {
        SimpleModule module = new SimpleModule();
        module.addSerializer(LocalDateTime.class, new UtcLocalDateTimeJackson3Serializer());
        return createObjectMapper().rebuild()
                .addModule(module)
                .build();
    }

    public static ObjectReader getObjectReader() {
        return objectMapper.reader();
    }

    public static JsonNode toJsonNode(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("invalid json ", e);
        }
    }

    public static <T> T toObject(String jsonPayload, Class<T> type) {
        try {
            return objectMapper.readValue(jsonPayload, type);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("invalid json ", e);
        }
    }

    public static String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("cannot convert to json", e);
        }
    }

    public static <T> T readValue(String jsonString, TypeReference<T> type) {
        try {
            return objectMapper.readValue(jsonString, type);
        } catch (Exception e) {
            throw new TechnicalException("json error", e);
        }
    }

    public static <T> T toObject(JsonNode jsonNode, Class<T> clazz) {
        try {
            return objectMapper.treeToValue(jsonNode, clazz);
        } catch (RuntimeException e) {
            throw new TechnicalException("cannot create object from json", e);
        }
    }

    public static JsonNode toJsonNode(Object object) {
        return objectMapper.valueToTree(object);
    }

}
