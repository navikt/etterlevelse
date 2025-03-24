package no.nav.data.etterlevelse.etterlevelse.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "behandlingId", "etterlevelseDokumentasjonId", "kravNummer", "kravVersjon", "etterleves", "begrunnelse", "dokumentasjon", "fristForFerdigstillelse", "status", "behandling", "suksesskriterieBegrunnelser"})
public class EtterlevelseResponse {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private String behandlingId;
    private UUID etterlevelseDokumentasjonId;
    private Integer kravNummer;
    private Integer kravVersjon;

    private boolean etterleves;
    private String statusBegrunnelse;
    private List<String> dokumentasjon;
    private LocalDate fristForFerdigstillelse;
    private EtterlevelseStatus status;
    private List<SuksesskriterieBegrunnelseResponse> suksesskriterieBegrunnelser;

    private EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon;
    
    public static EtterlevelseResponse buildFrom(Etterlevelse etterlevelse) {
        if (etterlevelse == null) {
            return null;
        }
        return EtterlevelseResponse.builder()
                .id(etterlevelse.getId())
                .changeStamp(ChangeStampResponse.buildFrom(etterlevelse))
                .version(etterlevelse.getVersion())

                .behandlingId(etterlevelse.getBehandlingId())
                .etterlevelseDokumentasjonId(etterlevelse.getEtterlevelseDokumentasjonId())
                .kravNummer(etterlevelse.getKravNummer())
                .kravVersjon(etterlevelse.getKravVersjon())

                .etterleves(etterlevelse.isEtterleves())
                .statusBegrunnelse(etterlevelse.getStatusBegrunnelse())
                .dokumentasjon(copyOf(etterlevelse.getDokumentasjon()))
                .fristForFerdigstillelse(etterlevelse.getFristForFerdigstillelse())
                .status(etterlevelse.getStatus())
                .suksesskriterieBegrunnelser(StreamUtils.convert(etterlevelse.getSuksesskriterieBegrunnelser(), SuksesskriterieBegrunnelseResponse::buildFrom))
                .build();
    }

}
