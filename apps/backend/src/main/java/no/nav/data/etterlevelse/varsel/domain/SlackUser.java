package no.nav.data.etterlevelse.varsel.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SlackUser {

    private String id;
    private String name;
}
