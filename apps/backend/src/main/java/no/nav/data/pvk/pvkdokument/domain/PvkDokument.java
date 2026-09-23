package no.nav.data.pvk.pvkdokument.domain;

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
import org.hibernate.annotations.Type;

import java.util.UUID;


@Entity
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = PvkDokument.TABLENAME)
public class PvkDokument extends Auditable {

    @Id
    @Builder.Default
    @Column(name = "ID")
    private UUID id = UUID.randomUUID();

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

    public static final String TABLENAME = "PVK_DOKUMENT";
}
