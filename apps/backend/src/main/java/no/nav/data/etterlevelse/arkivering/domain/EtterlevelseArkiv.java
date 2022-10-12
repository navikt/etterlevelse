package no.nav.data.etterlevelse.arkivering.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivRequest;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivResponse;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseArkiv implements DomainObject {
    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;

    private String behandlingId;
    private EtterlevelseArkivStatus status;
    private LocalDateTime arkiveringDato;
    private LocalDateTime tilArkiveringDato;
    private String webSakNummer;


    public EtterlevelseArkiv convert(EtterlevelseArkivRequest request) {
        behandlingId = request.getBehandlingId();
        arkiveringDato = request.getArkiveringDato();
        tilArkiveringDato = request.getTilArkiveringDato();
        webSakNummer = request.getWebSakNummer();
        status = request.getStatus();

        return this;
    }

    public EtterlevelseArkivResponse toResponse() {
        return EtterlevelseArkivResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .behandlingId(behandlingId)
                .arkiveringDato(arkiveringDato)
                .tilArkiveringDato(tilArkiveringDato)
                .webSakNummer(webSakNummer)
                .status(status.name())
                .build();
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), behandlingId + "-" + webSakNummer);
    }
}
