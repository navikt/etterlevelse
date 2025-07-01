package no.nav.data.pvk.pvkdokument.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
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
@Table(name = "PVK_DOKUMENT")
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

}
