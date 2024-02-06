package no.nav.data.common.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import no.nav.data.common.exceptions.TechnicalException;
import org.springframework.core.ParameterizedTypeReference;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public final class JsonUtils {

    public static final ParameterizedTypeReference<List<String>> STRING_LIST = new ParameterizedTypeReference<>() {
    };
    public static final ParameterizedTypeReference<List<String>> INT_LIST = new ParameterizedTypeReference<>() {
    };

    private JsonUtils() {
    }

    private static final ObjectMapper objectMapper = createObjectMapper();
    private static final TypeReference<Map<String, Object>> MAP_TYPE_REFERENCE = new TypeReference<>() {
    };

    public static ObjectMapper createObjectMapper() {
        var om = new ObjectMapper();
        om.registerModule(new JavaTimeModule());
        om.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        om.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        return om;
    }

    public static ObjectMapper getObjectMapper() {
        return objectMapper;
    }

    public static JsonNode toJsonNode(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("invalid json ", e);
        }
    }

    public static Map<String, Object> toMap(Object object) {
        return objectMapper.convertValue(object, MAP_TYPE_REFERENCE);
    }

    public static <T> T toObject(String jsonPayload, Class<T> type) {
        try {
            return objectMapper.readValue(jsonPayload, type);
        } catch (IOException e) {
            throw new IllegalArgumentException("invalid json ", e);
        }
    }

    public static String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
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
        } catch (JsonProcessingException e) {
            throw new TechnicalException("cannot create object from json", e);
        }
    }

    public static JsonNode toJsonNode(Object object) {
        return objectMapper.valueToTree(object);
    }

    @SuppressWarnings("unchecked")
    public static <T> T cloneObject(T object) {
        return (T) toObject(toJsonNode(object), object.getClass());
    }
}
