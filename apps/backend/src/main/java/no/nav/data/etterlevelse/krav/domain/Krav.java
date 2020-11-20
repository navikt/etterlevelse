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
    private String kortNavn;
    private String beskrivelse;
    private String hensikt;
    private String utdypendeBeskrivelse;
    private String utdypendeDokumentasjon;
    private List<String> relevanteImplementasjoner;
    private List<String> begreper;
    private List<String> kontaktPersoner;
    private List<String> relevanteRettskilder;
    private List<String> tagg;
    private List<String> klassifiseringer;
    private Periode periode;

    private String avdeling;
    private String seksjon;

    private Relevans relevansFor;
    private KravStatus status;

    public enum Relevans {
        SAKSBEHANDLING,
        INNSYN
    }

    public enum KravStatus {
        UNDER_REDIGERING,
        FERDIG
    }

}
