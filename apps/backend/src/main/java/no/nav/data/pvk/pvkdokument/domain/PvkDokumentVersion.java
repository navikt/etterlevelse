package no.nav.data.pvk.pvkdokument.domain;

import java.util.UUID;

import org.hibernate.annotations.Type;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
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

@Entity
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "PVK_DOKUMENT_VERSION")
public class PvkDokumentVersion extends Auditable {

    @Id
    @Builder.Default
    @Column(name = "ID")
    private UUID id = UUID.randomUUID();

    @Column(name = "PVK_DOKUMENT_ID", nullable = false)
    private UUID pvkDokumentId;

    @Column(name = "ETTERLEVELSE_DOKUMENTASJON_ID", nullable = false)
    private UUID etterlevelseDokumentId;

    @Builder.Default
    @Column(name = "STATUS", nullable = false)
    @Enumerated(EnumType.STRING)
    private PvkDokumentStatus status = PvkDokumentStatus.UNDERARBEID;

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private PvkDokumentData pvkDokumentData = new PvkDokumentData();

    @Column(name = "CONTENT_VERSION", nullable = false)
    @Builder.Default
    private Integer contentVersion = 1;
}
