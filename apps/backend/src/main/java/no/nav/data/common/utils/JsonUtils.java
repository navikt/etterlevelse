package no.nav.data.common.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import no.nav.data.common.exceptions.TechnicalException;

import java.io.IOException;

public final class JsonUtils {

    private JsonUtils() {
    }

    private static final ObjectMapper objectMapper = createObjectMapper();

    public static ObjectMapper createObjectMapper() {
        ObjectMapper om = new ObjectMapper();
        om.registerModule(new JavaTimeModule());
        om.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        om.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        return om;
    }

    public static ObjectReader getObjectReader() {
        return objectMapper.reader();
    }
    
    public static JsonNode toJsonNode(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("invalid json ", e);
        }
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

}
