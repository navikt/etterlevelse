package no.nav.data.common.auditing.domain;

import com.fasterxml.jackson.annotation.JsonFilter;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.auditing.AuditVersionListener;

@SuperBuilder
@MappedSuperclass
@JsonFilter("relationFilter")
@EntityListeners({AuditVersionListener.class})
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public abstract class Auditable extends ChangeStamped {
}
