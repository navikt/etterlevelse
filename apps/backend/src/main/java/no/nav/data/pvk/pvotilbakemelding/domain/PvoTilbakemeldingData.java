package no.nav.data.pvk.pvotilbakemelding.domain;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class PvoTilbakemeldingData {
    private List<Vurdering> vurderinger;
}


