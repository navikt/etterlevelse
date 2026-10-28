package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class NomOrganisering {

    private String nomAvdelingId;
    private String avdelingNavn;
    private List<NomSeksjon> seksjoner;

    private List<NomEnhet> enheter;
    private List<NomEnhet> linjer;
    private List<NomEnhet> linjeEnheter;
    private List<NomEnhet> linjeFylker;
    private List<NomEnhet> fylkeKontorer;
}
