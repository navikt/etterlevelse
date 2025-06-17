package no.nav.data.integration.p360.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.integration.p360.dto.P360DocumentCreateRequest;
import org.hibernate.annotations.Type;

import java.util.UUID;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "P360_ARCHIVE_DOCUMENT")
public class P360ArchiveDocument extends Auditable {

    @Id
    @Column(name = "ID")
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private P360DocumentCreateRequest data = new P360DocumentCreateRequest();
}
