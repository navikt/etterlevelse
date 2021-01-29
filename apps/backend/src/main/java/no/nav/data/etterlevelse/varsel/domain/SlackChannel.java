package no.nav.data.etterlevelse.varsel.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SlackChannel {

    private String id;
    private String name;
    private Integer numMembers;
}
