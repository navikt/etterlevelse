package no.nav.data.common.jpa;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.hypersistence.utils.hibernate.type.util.JsonSerializer;
import no.nav.data.common.utils.JsonUtils;

/**
 * Jackson-based JsonSerializer used by hypersistence-utils for deep-copying JSON entity attributes
 * during Hibernate dirty checking.
 * <p>
 * Newer hypersistence-utils versions default to a serializer that requires the mapped JSON types to
 * implement {@link java.io.Serializable}, otherwise it throws {@code NonSerializableObjectException}.
 * All JSON-mapped attributes in this project are concrete classes (the various {@code *Data} types,
 * {@code JsonNode}, {@code String}, {@code P360DocumentCreateRequest}), so a faithful deep copy can be
 * produced by round-tripping through the shared Jackson {@link ObjectMapper}. This mirrors the previous
 * (Hibernate 6.3 line) behaviour without forcing every data class to be {@code Serializable}.
 */
public class JacksonJsonSerializer implements JsonSerializer {

    private static final ObjectMapper objectMapper = JsonUtils.createObjectMapper();

    @Override
    @SuppressWarnings("unchecked")
    public <T> T clone(T value) {
        if (value == null) {
            return null;
        }
        if (value instanceof JsonNode jsonNode) {
            return (T) jsonNode.deepCopy();
        }
        // Immutable value types can be returned as-is
        if (value instanceof String || value instanceof Number || value instanceof Boolean) {
            return value;
        }
        try {
            return (T) objectMapper.readValue(objectMapper.writeValueAsBytes(value), value.getClass());
        } catch (Exception e) {
            throw new IllegalStateException("Could not deep-copy JSON attribute of type " + value.getClass(), e);
        }
    }
}

