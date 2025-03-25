package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.util.List;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseDokumentasjonData {

    private Integer etterlevelseNummer;

    private String title;
    private List<String> behandlingIds;
    private String beskrivelse;
    private String gjenbrukBeskrivelse;
    @Builder.Default
    private boolean tilgjengeligForGjenbruk = false; // True if document is ready for re-use
    @Builder.Default
    private boolean behandlerPersonopplysninger = true;
    private String virkemiddelId;
    @Builder.Default
    private boolean knyttetTilVirkemiddel = true;
    @Builder.Default
    private boolean forGjenbruk = false; // True if document is intenden for re-use
    private List<String> teams;
    private List<String> resources;
    private List<String> risikoeiere;
    private String avdeling;
    private List<String> irrelevansFor;
    private List<String> prioritertKravNummer;
    private List<String> Risikovurderinger; // Inneholder både lenke og beskrivelse, formattert som markdown
    private List<Varslingsadresse> varslingsadresser;

}
