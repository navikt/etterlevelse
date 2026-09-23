package no.nav.data.pvk.pvotilbakemelding.domain;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = PvoTilbakemelding.TABLENAME)
public class PvoTilbakemelding extends Auditable {

    @Id
    @Builder.Default
    @Column(name = "ID")
    private UUID id = UUID.randomUUID();

    @Column(name = "PVK_DOKUMENT_ID", nullable = false, updatable = false)
    private UUID pvkDokumentId;

    @Builder.Default
    @Column(name = "STATUS", nullable = false)
    @Enumerated(EnumType.STRING)
    private PvoTilbakemeldingStatus status = PvoTilbakemeldingStatus.UNDERARBEID;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private PvoTilbakemeldingData pvoTilbakemeldingData = new PvoTilbakemeldingData();

    public static final String TABLENAME = "PVO_TILBAKEMELDING";
}

