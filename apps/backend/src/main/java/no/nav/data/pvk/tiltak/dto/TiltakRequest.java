package no.nav.data.pvk.tiltak.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakData;

import java.time.LocalDate;
import java.util.UUID;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class TiltakRequest implements RequestElement {

    private UUID id;
    private String pvkDokumentId;
    private String navn;
    private String beskrivelse;
    private String ansvarlig;
    private LocalDate frist;
    private String ansvarligTeam;
    private Boolean iverksatt;
    private LocalDate iverksattDato;
    
    private Boolean update;

    @Override
    public void format() {
        setPvkDokumentId(trimToNull(pvkDokumentId));
        setNavn(trimToNull(navn));
        setBeskrivelse(trimToNull(beskrivelse));
        setAnsvarlig(trimToNull(ansvarlig));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(TiltakRequest.Fields.pvkDokumentId, pvkDokumentId);
        validator.checkId(this);
    }

    public Tiltak convertToTiltak() {
        return Tiltak.builder()
                .id(id)
                .pvkDokumentId(UUID.fromString(pvkDokumentId))
                .tiltakData(TiltakData.builder()
                        .navn(navn)
                        .beskrivelse(beskrivelse)
                        .ansvarlig(ansvarlig)
                        .ansvarligTeam(ansvarligTeam)
                        .frist(frist)
                        .iverksatt(iverksatt)
                        .iverksattDato(iverksattDato)
                        .build())
                .build();
    }

    public void mergeInto(Tiltak tiltakToMerge) {
        tiltakToMerge.setPvkDokumentId(UUID.fromString(pvkDokumentId));
        tiltakToMerge.getTiltakData().setNavn(navn);
        tiltakToMerge.getTiltakData().setBeskrivelse(beskrivelse);
        tiltakToMerge.getTiltakData().setAnsvarlig(ansvarlig);
        tiltakToMerge.getTiltakData().setAnsvarligTeam(ansvarligTeam);
        tiltakToMerge.getTiltakData().setFrist(frist);
        tiltakToMerge.getTiltakData().setIverksatt(iverksatt);
        tiltakToMerge.getTiltakData().setIverksattDato(iverksattDato);
    }
}
