package no.nav.data.etterlevelse.melding.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.melding.dto.MeldingRequest;
import no.nav.data.etterlevelse.melding.dto.MeldingResponse;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Melding extends DomainObject {

    private String melding;
    private String secondaryTittel;
    private String secondaryMelding;
    private MeldingType meldingType;
    private MeldingStatus meldingStatus;
    private AlertType alertType;

    // Updates all fields from the request except id, version and changestamp
    public Melding merge(MeldingRequest request) {
        melding = request.getMelding();
        secondaryTittel = request.getSecondaryTittel();
        secondaryMelding = request.getSecondaryMelding();
        meldingType = request.getMeldingType();
        meldingStatus = request.getMeldingStatus();
        alertType = request.getAlertType();
        return this;
    }

    public MeldingResponse toResponse(){
        return MeldingResponse.builder()
                .id(id)
                .version(version)
                .changeStamp(convertChangeStampResponse())
                .meldingType(meldingType)
                .meldingStatus(meldingStatus)
                .alertType(alertType)
                .melding(melding)
                .secondaryTittel(secondaryTittel)
                .secondaryMelding(secondaryMelding)
                .build();
    }
}
