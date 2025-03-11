package no.nav.data.pvk.pvotilbakemelding.domain;

import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class Tilbakemeldingsinnhold {

    private String sistRedigertAv;
    private LocalDate sistRedigertDato;
    private String bidragsVurdering;
    private String internDiskusjon;
    private String TilbakemeldingTilEtterlevere;

}
