package no.nav.data.pvk.behandlingensArtOgOmfang.domain;

import lombok.*;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class BehandlingensArtOgOmfangData {
    private Boolean stemmerPersonkategorier;
    private String personkategoriAntallBeskrivelse;
    private String tilgangsBeskrivelsePersonopplysningene;
    private String lagringsBeskrivelsePersonopplysningene;
}
