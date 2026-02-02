package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.KravTilstandHistorikk;

import java.util.List;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseDokumentasjonGodkjenningsRequest {
    private EtterlevelseDokumentasjonRequest etterlevelseDokumentasjonRequest;
    private List<KravTilstandHistorikk> kravTilstandHistorikkList;
}
