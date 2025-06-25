package no.nav.data.etterlevelse.etterlevelsemetadata.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.etterlevelse.common.domain.KravId;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.UUID;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ETTERLEVELSE_METADATA")
public class EtterlevelseMetadata extends Auditable implements KravId {

    @Id
    @Column(name = "ID")
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(name = "KRAV_NUMMER", nullable = false)
    private Integer kravNummer;

    @Column(name = "KRAV_VERSJON", nullable = false)
    @Builder.Default
    private Integer kravVersjon = 1;

    @Column(name = "etterlevelse_dokumentasjon", nullable = false)
    private UUID etterlevelseDokumentasjonId;
    
    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private EtterlevelseMetadataData data = new EtterlevelseMetadataData();

    // The rest is just boilerplate to delegate some getters and setters to data
    
    public void setTildeltMed(List<String> tildeltMed) {
        data.setTildeltMed(tildeltMed);
    }

    public void setNotater(String notater) {
        data.setNotater(notater);
    }

    public List<String> getTildeltMed() {
        return data.getTildeltMed();
    }

    public String getNotater() {
        return data.getNotater();
    }

}
