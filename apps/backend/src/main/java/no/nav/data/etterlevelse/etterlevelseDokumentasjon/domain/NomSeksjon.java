package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.*;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class NomSeksjon {
    private String nomSeksjontId;
    private String nomSeksjonName;
}
