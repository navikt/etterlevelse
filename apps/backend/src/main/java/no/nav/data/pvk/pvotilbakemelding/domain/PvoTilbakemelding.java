package no.nav.data.pvk.pvotilbakemelding.domain;


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
@Table(name = "PVO_TILBAKEMELDING")
public class PvoTilbakemelding extends Auditable {

    @Id
    @Builder.Default
    @Column(name = "ID")
    private UUID id = UUID.randomUUID();

    @Column(name = "PVK_DOKUMENT_ID", nullable = false)
    private String pvkDokumentId;

    @Builder.Default
    @Column(name = "STATUS")
    private PvoTilbakemeldingStatus status = PvoTilbakemeldingStatus.UNDERARBEID;

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private PvoTilbakemeldingData pvkDokumentData = new PvoTilbakemeldingData();
}

