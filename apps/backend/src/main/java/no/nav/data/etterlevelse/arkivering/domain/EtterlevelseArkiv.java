package no.nav.data.etterlevelse.arkivering.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivRequest;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivResponse;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieBegrunnelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;

import java.time.LocalDateTime;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseArkiv implements DomainObject {
    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;

    private String behandlingId;
    private boolean tilArkivering;
    private LocalDateTime arkiveringDato;
    private String webSakNummer;

    public EtterlevelseArkiv convert(EtterlevelseArkivRequest request) {
        behandlingId = request.getBehandlingId();
        tilArkivering = request.isTilArkivering();
        arkiveringDato = request.getArkiveringDato();
        webSakNummer = request.getWebSakNummer();


        return this;
    }

    public EtterlevelseArkivResponse toResponse() {
        return EtterlevelseArkivResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .behandlingId(behandlingId)
                .tilArkivering(tilArkivering)
                .arkiveringDato(arkiveringDato)
                .webSakNummer(webSakNummer)
                .build();
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), behandlingId + "-" + webSakNummer);
    }
}
