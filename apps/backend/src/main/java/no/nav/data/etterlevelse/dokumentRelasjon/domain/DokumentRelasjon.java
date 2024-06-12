package no.nav.data.etterlevelse.dokumentRelasjon.domain;

import com.fasterxml.jackson.databind.JsonNode;
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
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.etterlevelse.dokumentRelasjon.dto.DokumentRelasjonRequest;
import no.nav.data.etterlevelse.dokumentRelasjon.dto.DokumentRelasjonResponse;
import org.hibernate.annotations.Type;

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

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA")
    private JsonNode data;

    public DokumentRelasjon merge(DokumentRelasjonRequest request){
        relationType = request.getRelationType();
        from = request.getFrom();
        to = request.getTo();
        data = request.getData();
        return this;
    };

    public DokumentRelasjonResponse toResponse() {
        return DokumentRelasjonResponse.builder()
                .id(id)
                .relationType(relationType)
                .from(from)
                .to(to)
                .data(data)
                .build();
    };
}
