package no.nav.data.etterlevelse.krav.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding.Rolle;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding.TilbakemeldingsType;
import no.nav.data.etterlevelse.krav.domain.TilbakemeldingStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "kravNummer", "kravVersjon", "tittel", "type", "melder", "meldinger"})
public class TilbakemeldingResponse {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;
    private Integer kravNummer;
    private Integer kravVersjon;
    private String tittel;
    private TilbakemeldingsType type;
    private String melderIdent;
    private List<MeldingResponse> meldinger;
    private TilbakemeldingStatus status;
    private boolean endretKrav;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeldingResponse {

        private int meldingNr;
        private String fraIdent;
        private Rolle rolle;
        private LocalDateTime tid;
        private String innhold;

        private LocalDateTime endretTid;
        private String endretAvIdent;

    }
}
