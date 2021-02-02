package no.nav.data.common.mail;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.With;
import no.nav.data.common.security.azure.support.MailLog;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.util.UUID;

@Data
@Builder
@With
@AllArgsConstructor
@NoArgsConstructor
public class MailTask implements DomainObject {

    private UUID id;

    private String to;
    private String subject;
    private String body;

    private ChangeStamp changeStamp;

    public MailLog toMailLog() {
        return MailLog.builder().to(to).subject(subject).body(body).build();
    }
}
