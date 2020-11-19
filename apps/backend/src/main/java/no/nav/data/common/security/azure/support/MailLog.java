package no.nav.data.common.security.azure.support;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.dto.MailLogResponse;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MailLog implements DomainObject {

    private UUID id;
    private ChangeStamp changeStamp;

    private String to;
    private String subject;
    private String body;

    public MailLogResponse convertToResponse() {
        return MailLogResponse.builder()
                .id(id)
                .time(changeStamp.getCreatedDate())
                .to(to)
                .subject(subject)
                .body(body)
                .build();
    }
}
