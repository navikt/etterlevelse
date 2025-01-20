package no.nav.data.pvk.tiltak.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.UUID;

@Entity
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "TILTAK")
public class Tiltak extends Auditable {
    
    @Id
    @Builder.Default
    @Column(name = "ID")
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PVK_DOKUMENT_ID", nullable = false)
    private PvkDokument pvkDokument;
    
    @ManyToMany(cascade = {}, fetch = FetchType.LAZY) // Merk: Cascade på merge og persist på andre siden av relasjonen
    @JoinTable(name = "risikoscenario_tiltak", joinColumns = @JoinColumn(name = "tiltak"), inverseJoinColumns = @JoinColumn(name = "risikoscenario"))
    private List<Risikoscenario> risikoscenarioer;

    @Type(value = JsonBinaryType.class)
    @Builder.Default
    @Column(name = "DATA", nullable = false)
    private TiltakData tiltakData = new TiltakData();
    
    /*
     * FIXME
     * 1) Hvordan kommer requests?
     * 2) Hvordan lagres tiltak, risscen og relasjonen?
     */

}
