package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class TilbakemeldingData {

    private String tittel;
    private TilbakemeldingsType type;
    private Melder melder;
    private List<Melding> meldinger;
    private TilbakemeldingStatus status;
    private boolean endretKrav;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Melder {
        private String ident;
        private Varslingsadresse varslingsadresse;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Melding {
        private int meldingNr;
        private String fraIdent;
        private Rolle rolle;
        private LocalDateTime tid;
        private String innhold;

        private LocalDateTime endretTid;
        private String endretAvIdent;

        public void endre(String newInnhold) {
            innhold = newInnhold;
            endretTid = LocalDateTime.now();
            endretAvIdent = SecurityUtils.getCurrentIdent();
        }
    }

    public enum TilbakemeldingsType {
        GOD,
        UKLAR,
        ANNET
    }

    public enum Rolle {
        KRAVEIER,
        MELDER
    }

}
