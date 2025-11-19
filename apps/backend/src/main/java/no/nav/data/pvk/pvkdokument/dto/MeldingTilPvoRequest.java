package no.nav.data.pvk.pvkdokument.dto;

import lombok.*;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.pvk.pvkdokument.domain.MeldingTilPvo;
import no.nav.data.pvk.pvotilbakemelding.dto.VurderingRequest;

import java.time.LocalDateTime;

import static net.logstash.logback.util.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class MeldingTilPvoRequest implements Validated {
    private int innsendingId;
    private String merknadTilPvo;
    private LocalDateTime sendtTilPvoDato;
    private String sendtTilPvoAv;

    @Override
    public void format() {
        setMerknadTilPvo(trimToNull(merknadTilPvo));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        if (innsendingId < 0) {
            validator.addError(VurderingRequest.Fields.innsendingId, "NEGATIVE_INNSENDING_ID", "innsending id cannot be negative");
        }
    }

    public MeldingTilPvo convertToMeldingTilPvo() {
        return MeldingTilPvo.builder()
                .innsendingId(innsendingId)
                .merknadTilPvo(merknadTilPvo)
                .sendtTilPvoDato(sendtTilPvoDato)
                .sendtTilPvoAv(sendtTilPvoAv)
                .build();
    }

    public static MeldingTilPvoRequest buildFrom(MeldingTilPvo melding) {
        return MeldingTilPvoRequest.builder()
                .innsendingId(melding.getInnsendingId())
                .merknadTilPvo(melding.getMerknadTilPvo())
                .sendtTilPvoDato(melding.getSendtTilPvoDato())
                .sendtTilPvoAv(melding.getSendtTilPvoAv())
                .build();
    }


}
