package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.KravTilstandHistorikk;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseDokumentasjonGodkjenningsRequest {
    private EtterlevelseDokumentasjonRequest etterlevelseDokumentasjonRequest;
    private List<KravTilstandHistorikk> kravTilstandHistorikk;
    private boolean onlyActiveKrav;
}
