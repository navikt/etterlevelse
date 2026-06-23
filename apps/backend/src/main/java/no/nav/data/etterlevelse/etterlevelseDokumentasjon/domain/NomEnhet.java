package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.*;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class NomEnhet {
    private String nomEnhetId;
    private String nomEnhetName;
}
