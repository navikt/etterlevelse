package no.nav.data.pvk.pvkdokument.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.pvk.pvkdokument.domain.OpplysningtypeData;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "etterlevelseDokumentId", "status"})
public class PvkDokumentResponse {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private String etterlevelseDokumentId;
    private PvkDokumentStatus status;

    private List<String> ytterligereEgenskaper;
    private boolean skalUtforePvk;
    private String pvkVurderingsBegrunnelse;
    private boolean stemmerOpplysningstypene;
    private List<OpplysningtypeData> opplysningtypeData;
    private String tilgangsBeskrivelseForOpplysningstyper;
    private String lagringsBeskrivelseForOpplysningstyper;

    private boolean stemmerPersonkategorier;
    private boolean harInvolvertRepresentant;
    private String representantInvolveringsBeskrivelse;

    private boolean stemmerDatabehandlere;
    private boolean harDatabehandlerRepresentantInvolvering;
    private String dataBehandlerRepresentantInvolveringBeskrivelse;

}
