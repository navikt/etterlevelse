package no.nav.data.integration.ardoq.domain;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArdoqExportEtterlevelseDokumentField {
    private UUID etterlevelseDokumentId;
    private String etterlevelseDokumentNummer;
    private String etterlevelseDokumentNavn;
    private int antallKrav;
    private int kravIkkeStartet;
    private int kravUnderArbeid;
    private int kravFerdig;
    private String linkTilEtterlevelsesDokument;
    private List<String> teams;
}
