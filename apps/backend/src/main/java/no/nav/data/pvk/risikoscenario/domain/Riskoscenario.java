package no.nav.data.pvk.risikoscenario.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;
import no.nav.data.common.auditing.domain.Auditable;
import org.hibernate.annotations.Type;

import java.util.UUID;

@Entity
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Riskoscenario extends Auditable {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    private String pvkDokumentId;

    @Type(value = JsonBinaryType.class)
    @Builder.Default
    private RiskoscenarioData riskoscenarioData = new RiskoscenarioData();

}
