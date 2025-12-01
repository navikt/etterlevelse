package no.nav.data.pvk.behandlingensArtOgOmfang.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
@Table(name = "BEHANDLINGENS_ART_OG_OMFANG")
public class BehandlingensArtOgOmfang extends Auditable {

    @Id
    @Builder.Default
    @Column(name = "ID")
    private UUID id = UUID.randomUUID();

    @Column(name = "ETTERLEVELSE_DOKUMENTASJON_ID", nullable = false)
    private UUID etterlevelseDokumensjonId;

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private BehandlingensArtOgOmfangData behandlingensArtOgOmfangData = new BehandlingensArtOgOmfangData();
}
