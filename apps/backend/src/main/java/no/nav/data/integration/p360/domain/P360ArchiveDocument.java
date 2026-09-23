package no.nav.data.integration.p360.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.integration.p360.dto.P360DocumentCreateRequest;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private P360DocumentCreateRequest data = new P360DocumentCreateRequest();
}
