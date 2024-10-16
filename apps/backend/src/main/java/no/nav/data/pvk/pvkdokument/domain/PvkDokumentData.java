package no.nav.data.pvk.pvkdokument.domain;

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
public class PvkDokumentData {

    private List<YtterligereEgenskaper> ytterligereEgenskaper;
    private Boolean skalUtforePvk;
    private String PvkVurderingsBegrunnelse;

    private Boolean stemmerOpplysningstypene;
    private List<OpplysningtypeData> opplysningtypeData;
    private String tilgangsBeskrivelseForOpplysningstyper;
    private String lagringsBeskrivelseForOpplysningstyper;

    private Boolean stemmerPersonkategorier;
    private Boolean harInvolvertRepresentant;
    private String representantInvolveringsBeskrivelse;

    private Boolean stemmerDatabehandlere;
    private Boolean harDatabehandlerRepresentantInvolvering;
    private String dataBehandlerRepresentantInvolveringBeskrivelse;

}
