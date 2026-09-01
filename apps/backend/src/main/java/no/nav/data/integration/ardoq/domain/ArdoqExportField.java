package no.nav.data.integration.ardoq.domain;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArdoqExportField {
    private String ardoqId;
    private String systemNavn;
    private String etterlevelseDokumentNummer;
    private String etterlevelseDokumentNavn;
    private int antallKrav;
    private int kravIkkeStartet;
    private int kravUnderArbeid;
    private int kravFerdig;
    private String linkTilEtterlevelsesDokument;
}
