package no.nav.data.integration.ardoq.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArdoqExportEtterlevelseDokumentField {

    @JsonProperty("etterlevelses_dokument_id")
    private String etterlevelseDokumentId;

    @JsonProperty("etterlevelsesdokument_nummer")
    private String etterlevelseDokumentNummer;

    @JsonProperty("dokumentnavn")
    private String etterlevelseDokumentNavn;

    @JsonProperty("antall_krav")
    private String antallKrav;

    @JsonProperty("krav_ikke_startet")
    private String kravIkkeStartet;

    @JsonProperty("krav_under_arbeid")
    private String kravUnderArbeid;

    @JsonProperty("krav_ferdig")
    private String kravFerdig;

    @JsonProperty("link_til_etterlevelsesdokument")
    private String linkTilEtterlevelsesDokument;

    @JsonIgnore
    private List<String> teams;
}
