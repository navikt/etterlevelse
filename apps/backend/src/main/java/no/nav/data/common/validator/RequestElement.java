package no.nav.data.common.validator;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.StringUtils;

import java.util.UUID;

/**
 * @param <T> Type of id, must be String or UUID. Remove this typing when all requests have id that is UUID.
 */
public interface RequestElement<T> extends Validated {

    T getId();

    @JsonIgnore
    default String getRequestType() {
        return StringUtils.substringBeforeLast(getClass().getSimpleName(), "Request");
    }

    @JsonIgnore
    Boolean getUpdate();

    @JsonIgnore
    default boolean isUpdate() {
        return getUpdate();
    }

    @JsonIgnore
    void setUpdate(Boolean update);

    @JsonIgnore
    default UUID getIdAsUUID() {
        T id = getId();
        if (id == null) {
            return null;
        }
        if (id instanceof UUID uuid) {
            return uuid;
        }
        if (id instanceof String sid) {
            try {
                return UUID.fromString(sid);
            } catch (IllegalArgumentException ignored) {
                return null;
            }
        }
        throw new IllegalStateException("Id of Request must be of type UUID or String: " + this.getClass().getSimpleName()); 
    }

}
