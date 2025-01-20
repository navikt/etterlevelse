package no.nav.data.pvk.tiltak.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import org.hibernate.annotations.Type;

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
    
    @Type(value = JsonBinaryType.class)
    @Builder.Default
    @Column(name = "DATA", nullable = false)
    private TiltakData tiltakData = new TiltakData();
    
}
