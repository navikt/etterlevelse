package no.nav.data.pvk.pvotilbakemelding.domain;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class Tilbakemeldingsinnhold {

    private String sistRedigertAv;
    private LocalDateTime sistRedigertDato;
    private String bidragsVurdering;
    private String internDiskusjon;
    private String tilbakemeldingTilEtterlevere;

}
