package no.nav.data.pvk.pvkdokument.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;

import java.util.List;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class PvkDokumentData {

    private String behandlingensLivslopBeskrivelse;
    private List<String> ytterligereEgenskaper;
    private boolean skalUtforePvk;
    private String pvkVurderingsBegrunnelse;

    private boolean stemmerPersonkategorier;
    private String personkategoriAntallBeskrivelse;
    private String tilgangsBeskrivelsePersonopplysningene;
    private String lagringsBeskrivelsePersonopplysningene;

    private boolean harInvolvertRepresentant;
    private String representantInvolveringsBeskrivelse;

    private boolean stemmerDatabehandlere;
    private boolean harDatabehandlerRepresentantInvolvering;
    private String dataBehandlerRepresentantInvolveringBeskrivelse;

    public List<CodelistResponse> ytterligereEgenskaperAsCodes() {
        return CodelistService.getCodelistResponseList(ListName.YTTERLIGERE_EGENSKAPER, ytterligereEgenskaper);
    }


}
