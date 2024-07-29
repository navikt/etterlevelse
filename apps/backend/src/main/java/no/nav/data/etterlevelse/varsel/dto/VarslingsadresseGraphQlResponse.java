package no.nav.data.etterlevelse.varsel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import lombok.experimental.SuperBuilder;
import no.nav.data.etterlevelse.varsel.domain.SlackChannel;
import no.nav.data.etterlevelse.varsel.domain.SlackUser;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class VarslingsadresseGraphQlResponse extends Varslingsadresse {
    private SlackUser slackUser;
    private SlackChannel slackChannel;
}
