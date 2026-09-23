package no.nav.data.pvk.behandlingensArtOgOmfang.domain;

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
@Table(name = BehandlingensArtOgOmfang.TABLENAME)
public class BehandlingensArtOgOmfang extends Auditable {

    @Id
    @Builder.Default
    @Column(name = "ID")
    private UUID id = UUID.randomUUID();

    @Column(name = "ETTERLEVELSE_DOKUMENTASJON_ID", nullable = false)
    private UUID etterlevelseDokumentasjonId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private BehandlingensArtOgOmfangData behandlingensArtOgOmfangData = new BehandlingensArtOgOmfangData();

    public static final String TABLENAME = "BEHANDLINGENS_ART_OG_OMFANG";
}
