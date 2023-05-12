package no.nav.data.etterlevelse.codelist.domain;

import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import org.hibernate.annotations.Type;

import java.io.Serializable;

@Entity
@Table(name = "CODELIST")
@Data
@Builder
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@IdClass(Codelist.IdClass.class)
public class Codelist extends Auditable {

    @Id
    @Column(name = "LIST_NAME")
    @Enumerated(EnumType.STRING)
    private ListName list;

    @Id
    @Column(name = "CODE")
    private String code;

    @Column(name = "SHORT_NAME")
    private String shortName;

    @Column(name = "DESCRIPTION")
    private String description;

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA")
    private JsonNode data;

    public CodelistResponse toResponse() {
        return CodelistResponse.builder()
                .list(list)
                .code(code)
                .shortName(shortName)
                .description(description)
                .data(data)
                .build();
    }

    @Data
    static class IdClass implements Serializable {

        private ListName list;
        private String code;

    }

}
