package no.nav.data.common.mail;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.With;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.security.azure.support.MailLog;
import no.nav.data.common.storage.domain.DomainObject;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@With
@AllArgsConstructor
@NoArgsConstructor
public class MailTask extends DomainObject {

    private String to;
    private String subject;
    private String body;
    
    @JsonIgnore // Ikke i bruk for denne klassen
    @Getter(value = AccessLevel.NONE)
    @Setter(value = AccessLevel.NONE)
    protected Integer version;

    public MailLog toMailLog() {
        return MailLog.builder().to(to).subject(subject).body(body).build();
    }
    
}
