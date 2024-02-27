package no.nav.data.common.security.azure.support;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.auditing.dto.MailLogResponse;
import no.nav.data.common.storage.domain.DomainObject;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class MailLog extends DomainObject {

    private String to;
    private String subject;
    private String body;

    @JsonIgnore // Ikke i bruk for denne klassen
    @Getter(value = AccessLevel.NONE)
    @Setter(value = AccessLevel.NONE)
    protected Integer version;

    public MailLogResponse toResponse() {
        return MailLogResponse.builder()
                .id(id)
                .time(changeStamp.getCreatedDate())
                .to(to)
                .subject(subject)
                .body(body)
                .build();
    }
    
}
