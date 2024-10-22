package no.nav.data.pvk.pvkdokument.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PersonkategoriData {
    private String personkategoriId;
    private String antallBruker;
}
