package no.nav.data.pvk.risikoscenario.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.Auditable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = Risikoscenario.TABLENAME)
public class Risikoscenario extends Auditable {

    @Id
    @Builder.Default
    @Column(name = "ID")
    private UUID id = UUID.randomUUID();

    @Column(name = "PVK_DOKUMENT_ID", nullable = false)
    private UUID pvkDokumentId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "DATA", nullable = false)
    private RisikoscenarioData risikoscenarioData = new RisikoscenarioData();

    public static final String TABLENAME = "RISIKOSCENARIO";
}
