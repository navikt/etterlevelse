package no.nav.data.pvk.pvotilbakemelding.domain;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class TilhorendeDokumentasjonTilbakemelding {
    private String sistRedigertAv;
    private LocalDateTime sistRedigertDato;
    private String internDiskusjon;

    private String behandlingskatalogDokumentasjonTilstrekkelig;
    private String behandlingskatalogDokumentasjonTilbakemelding;

    private String kravDokumentasjonTilstrekkelig;
    private String kravDokumentasjonTilbakemelding;

    private String risikovurderingTilstrekkelig;
    private String risikovurderingTilbakemelding;
}
