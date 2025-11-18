package no.nav.data.pvk.pvkdokument.domain;

import lombok.*;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class PvkDokumentData {

    @Builder.Default
    private Integer antallInnsendingTilPvo = 0;
    private List<String> ytterligereEgenskaper;
    private Boolean skalUtforePvk;
    private String pvkVurderingsBegrunnelse;

    private Boolean stemmerPersonkategorier;
    private String personkategoriAntallBeskrivelse;
    private String tilgangsBeskrivelsePersonopplysningene;
    private String lagringsBeskrivelsePersonopplysningene;

    private Boolean harInvolvertRepresentant;
    private String representantInvolveringsBeskrivelse;

    private Boolean harDatabehandlerRepresentantInvolvering;
    private String dataBehandlerRepresentantInvolveringBeskrivelse;

    private String merknadTilRisikoeier;
    private String merknadFraRisikoeier;

    private List<MeldingTilPvo> meldingerTilPvo;

    private LocalDateTime godkjentAvRisikoeierDato;
    private String godkjentAvRisikoeier;

    public List<CodelistResponse> ytterligereEgenskaperAsCodes() {
        return CodelistService.getCodelistResponseList(ListName.YTTERLIGERE_EGENSKAPER, ytterligereEgenskaper);
    }


}
