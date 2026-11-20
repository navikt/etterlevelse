package no.nav.data.common.validator;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.StringUtils;

import java.util.UUID;

public interface RequestElement extends Validated {

    UUID getId();

    /**
     * Versjonen klienten sist leste (optimistisk låsing). Påkrevd ved oppdatering, ignoreres ved opprettelse.
     */
    Integer getVersion();


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

}
