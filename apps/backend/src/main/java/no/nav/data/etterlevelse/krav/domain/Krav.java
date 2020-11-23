package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.common.domain.Periode;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Krav implements DomainObject {

    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;

    private Integer kravNr;
    private Integer kravVersjon;
    private String navn;
    private String beskrivelse;
    private String hensikt;
    private String utdypendeBeskrivelse;
    private List<String> dokumentasjon;
    private List<String> implementasjoner;
    private List<String> begreper;
    private List<String> kontaktPersoner;
    private List<String> rettskilder;
    private List<String> tagger;
    private Periode periode;

    private String avdeling;
    private String underavdeling;

    // Kodeverk
    private String relevansFor;
    private KravStatus status;

    public enum KravStatus {
        UNDER_REDIGERING,
        FERDIG
    }

}
