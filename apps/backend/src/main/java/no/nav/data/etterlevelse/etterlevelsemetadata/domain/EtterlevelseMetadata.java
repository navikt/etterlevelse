package no.nav.data.etterlevelse.etterlevelsemetadata.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.common.domain.KravId;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseMetadata extends DomainObject implements KravId {

    private Integer kravVersjon;
    private Integer kravNummer;
    private String behandlingId;
    private String etterlevelseDokumentasjonId;
    private List<String> tildeltMed;
    private String notater;

}
