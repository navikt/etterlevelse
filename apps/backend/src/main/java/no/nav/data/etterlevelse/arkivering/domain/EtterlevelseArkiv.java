package no.nav.data.etterlevelse.arkivering.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivRequest;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivResponse;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseArkiv extends DomainObject {

    private String etterlevelseDokumentasjonId;
    private String behandlingId;
    private EtterlevelseArkivStatus status;
    private LocalDateTime arkiveringDato;
    private String arkivertAv;
    private LocalDateTime tilArkiveringDato;
    private LocalDateTime arkiveringAvbruttDato;
    private String webSakNummer;
    private boolean onlyActiveKrav;

    // Updates all fields from the request except id, version and changestamp
    public EtterlevelseArkiv merge(EtterlevelseArkivRequest request) {
        etterlevelseDokumentasjonId = request.getEtterlevelseDokumentasjonId();
        behandlingId = request.getBehandlingId();
        arkiveringDato = request.getArkiveringDato();
        arkivertAv = request.getArkivertAv();
        tilArkiveringDato = request.getTilArkiveringDato();
        arkiveringAvbruttDato = request.getArkiveringAvbruttDato();
        webSakNummer = request.getWebSakNummer();
        status = request.getStatus();
        onlyActiveKrav = request.isOnlyActiveKrav();

        return this;
    }

    public EtterlevelseArkivResponse toResponse() {
        return EtterlevelseArkivResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .behandlingId(behandlingId)
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjonId)
                .arkiveringDato(arkiveringDato)
                .arkivertAv(arkivertAv)
                .tilArkiveringDato(tilArkiveringDato)
                .arkiveringAvbruttDato(arkiveringAvbruttDato)
                .webSakNummer(webSakNummer)
                .status(status.name())
                .onlyActiveKrav(onlyActiveKrav)
                .build();
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), behandlingId + "-" + webSakNummer, "");
    }
}
