package no.nav.data.common.storage.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import no.nav.data.common.rest.ChangeStampResponse;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.UUID;
import java.util.stream.Stream;

public interface DomainObject {

    UUID getId();

    void setId(UUID id);

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
                .lastModifiedBy(getChangeStamp().getLastModifiedBy())
                .lastModifiedDate(getChangeStamp().getLastModifiedDate() == null ? LocalDateTime.now() : getChangeStamp().getLastModifiedDate())
                .build();
    }

     static <T extends DomainObject> T max(T obj1, T obj2) {
         return Stream.of(obj1, obj2).max(Comparator.comparing(o -> o.getChangeStamp().getCreatedDate())).orElse(null);
    }
}
