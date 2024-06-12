package no.nav.data.etterlevelse.dokumentRelasjon.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.etterlevelse.dokumentRelasjon.dto.DokumentRelasjonRequest;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@FieldNameConstants
@Table(name = "DOCUMENT_RELATION")
public class DokumentRelasjon extends Auditable {

    @Id
    @Column(name = "ID")
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Enumerated(EnumType.STRING)
    @Column(name = "RELATION_TYPE", nullable = false)
    private RelationType relationType;

    @Column(name = "FROM", nullable = false)
    private String from;

    @Column(name = "TO", nullable = false)
    private String to;

    public DokumentRelasjon merge(DokumentRelasjonRequest request){
        relationType = request.getRelationType();
        from = request.getFrom();
        to = request.getTo();
        return this;
    };
}
