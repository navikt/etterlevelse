package no.nav.data.pvk.tiltak.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioData;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioRequest;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakData;

import java.time.LocalDate;
import java.util.UUID;


import static no.nav.data.common.utils.StreamUtils.copyOf;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class TiltakRequest implements RequestElement {

    private String id;
    private String pvkDokumentId;
    private String navn;
    private String beskrivelse;
    private String ansvarlig;
    private LocalDate frist;

    private Boolean update;

    @Override
    public void format() {
        setId(trimToNull(id));
        setPvkDokumentId(trimToNull(pvkDokumentId));
        setNavn(trimToNull(navn));
        setBeskrivelse(trimToNull(beskrivelse));
        setAnsvarlig(trimToNull(ansvarlig));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(TiltakRequest.Fields.id, id);
        validator.checkUUID(TiltakRequest.Fields.pvkDokumentId, pvkDokumentId);
        validator.checkId(this);
    }

    public Tiltak convertToTiltak() {
        var tiltakData = TiltakData.builder()
                .navn(navn)
                .beskrivelse(beskrivelse)
                .ansvarlig(ansvarlig)
                .frist(frist)
                .build();

        return Tiltak.builder()
                .id(id != null && !id.isEmpty() ? UUID.fromString(id) : null)
                .pvkDokumentId(pvkDokumentId)
                .tiltakData(tiltakData)
                .build();
    }

    public void mergeInto(Tiltak tiltakToMerge) {
        tiltakToMerge.setPvkDokumentId(pvkDokumentId);
        tiltakToMerge.getTiltakData().setNavn(navn);
        tiltakToMerge.getTiltakData().setBeskrivelse(beskrivelse);
        tiltakToMerge.getTiltakData().setAnsvarlig(ansvarlig);
        tiltakToMerge.getTiltakData().setFrist(frist);
    }
}
