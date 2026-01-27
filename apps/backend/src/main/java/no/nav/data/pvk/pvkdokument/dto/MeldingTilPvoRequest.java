package no.nav.data.pvk.pvkdokument.dto;

import lombok.*;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.pvk.pvkdokument.domain.MeldingTilPvo;

import java.time.LocalDateTime;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class MeldingTilPvoRequest implements Validated {
    private int innsendingId;
    private String merknadTilPvo;
    private String endringsNotat;
    private LocalDateTime sendtTilPvoDato;
    private String sendtTilPvoAv;
    //versjonering
    private Integer etterlevelseDokumentVersjon;

    @Override
    public void format() {
        setMerknadTilPvo(trimToNull(merknadTilPvo));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        if (innsendingId < 0) {
            validator.addError(Fields.innsendingId, "NEGATIVE_INNSENDING_ID", "innsending id cannot be negative");
        }
    }

    public static MeldingTilPvoRequest buildFrom(MeldingTilPvo melding) {
        return MeldingTilPvoRequest.builder()
                .innsendingId(melding.getInnsendingId())
                .merknadTilPvo(melding.getMerknadTilPvo())
                .endringsNotat(melding.getEndringsNotat())
                .sendtTilPvoDato(melding.getSendtTilPvoDato())
                .sendtTilPvoAv(melding.getSendtTilPvoAv())
                .etterlevelseDokumentVersjon(melding.getEtterlevelseDokumentVersjon())
                .build();
    }

    public MeldingTilPvo convertToMeldingTilPvo() {
        return MeldingTilPvo.builder()
                .innsendingId(innsendingId)
                .merknadTilPvo(merknadTilPvo)
                .endringsNotat(endringsNotat)
                .sendtTilPvoDato(sendtTilPvoDato)
                .sendtTilPvoAv(sendtTilPvoAv)
                .etterlevelseDokumentVersjon(etterlevelseDokumentVersjon)
                .build();
    }


}
