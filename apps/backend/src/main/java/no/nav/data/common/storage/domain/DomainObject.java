package no.nav.data.common.storage.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.rest.ChangeStampResponse;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class DomainObject {

    protected UUID id;
    protected Integer version;
    protected ChangeStamp changeStamp;

    public String type() {
        return TypeRegistration.typeOf(getClass());
    }

    public ChangeStampResponse convertChangeStampResponse() {
        if (changeStamp == null) {
            return null;
        }
        return ChangeStampResponse.builder()
                .createdDate(changeStamp.getCreatedDate() == null ? LocalDateTime.now() : changeStamp.getCreatedDate())
                .lastModifiedBy(changeStamp.getLastModifiedBy())
                .lastModifiedDate(changeStamp.getLastModifiedDate() == null ? LocalDateTime.now() : changeStamp.getLastModifiedDate())
                .build();
    }

}
