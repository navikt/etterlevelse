package no.nav.data.common.storage.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import no.nav.data.common.rest.ChangeStampResponse;

import java.time.LocalDateTime;
import java.util.UUID;

// TODO: Dette må gjøres om til abstract class. Se https://trello.com/c/mbKtuSCW/322-domainobject-interface-%E2%86%92-abstract-class
public interface DomainObject {

    UUID getId();

    void setId(UUID id);

    @JsonIgnore
    default Integer getVersion() {
        return -1;
    }

    @JsonIgnore
    default void setVersion(Integer version) {
    }

    @JsonIgnore
    ChangeStamp getChangeStamp();

    @JsonIgnore
    void setChangeStamp(ChangeStamp changeStamp);

    default String type() {
        return TypeRegistration.typeOf(getClass());
    }

    default ChangeStampResponse convertChangeStampResponse() {
        if (getChangeStamp() == null) {
            return null;
        }
        return ChangeStampResponse.builder()
                .createdDate(getChangeStamp().getCreatedDate() == null ? LocalDateTime.now() : getChangeStamp().getCreatedDate() )
                .lastModifiedBy(getChangeStamp().getLastModifiedBy())
                .lastModifiedDate(getChangeStamp().getLastModifiedDate() == null ? LocalDateTime.now() : getChangeStamp().getLastModifiedDate())
                .build();
    }

}
