package no.nav.data.pvk.risikoscenario.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.UUID;

@Entity
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "RISIKOSCENARIO")
public class Risikoscenario extends Auditable {

    @Id
    @Builder.Default
    @Column(name = "ID")
    private UUID id = UUID.randomUUID();

    @Column(name = "PVK_DOKUMENT_ID", nullable = false)
    private String pvkDokumentId;

    @ManyToMany(mappedBy = "risikoscenarioer", fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Tiltak> tiltak;
    
    @Type(value = JsonBinaryType.class)
    @Builder.Default
    @Column(name = "DATA", nullable = false)
    private RisikoscenarioData risikoscenarioData = new RisikoscenarioData();

}
