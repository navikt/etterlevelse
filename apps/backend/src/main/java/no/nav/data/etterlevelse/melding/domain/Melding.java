package no.nav.data.etterlevelse.melding.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.melding.dto.MeldingRequest;
import no.nav.data.etterlevelse.melding.dto.MeldingResponse;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Melding implements DomainObject {
    private UUID id;
    private ChangeStamp changeStamp;
    private String melding;
    private MeldingType meldingType;
    private MeldingStatus meldingStatus;
    private Integer version;

    public Melding convert(MeldingRequest request) {
        melding = request.getMelding();
        meldingType = request.getMeldingType();
        meldingStatus = request.getMeldingStatus();
        return this;
    }

    public MeldingResponse toResponse(){
        return MeldingResponse.builder()
                .id(id)
                .version(version)
                .changeStamp(convertChangeStampResponse())
                .meldingType(meldingType)
                .meldingStatus(meldingStatus)
                .melding(melding)
                .build();
    }
}
