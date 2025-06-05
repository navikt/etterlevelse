package no.nav.data.etterlevelse.etterlevelsemetadata.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@EqualsAndHashCode
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseMetadataData {

    private List<String> tildeltMed;
    private String notater;

}
