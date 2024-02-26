package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.krav.dto.CreateTilbakemeldingRequest;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingNewMeldingRequest;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingResponse;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingResponse.MeldingResponse;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import org.springframework.util.Assert;

import java.time.LocalDateTime;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.tryFind;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Tilbakemelding extends DomainObject implements KravId {

    private Integer kravNummer;
    private Integer kravVersjon;

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

    public Melding getLastMelding() {
        return meldinger.get(meldinger.size() - 1);
    }

    public List<Varslingsadresse> getRecipientsForMelding(Krav krav, Melding melding) {
        Assert.isTrue(krav.kravId().equals(kravId()), "Feil krav");
        if (melding.getRolle() == Rolle.KRAVEIER) {
            return List.of(melder.varslingsadresse);
        }
        return krav.getVarslingsadresser();
    }

    public static Tilbakemelding create(CreateTilbakemeldingRequest request) {
        return Tilbakemelding.builder()
                .kravNummer(request.getKravNummer())
                .kravVersjon(request.getKravVersjon())
                .tittel(request.getTittel())
                .type(request.getType())
                .status(request.getStatus())
                .endretKrav(request.isEndretKrav())
                .melder(Melder.builder()
                        .ident(request.getIdent())
                        .varslingsadresse(request.getVarslingsadresse())
                        .build())
                .meldinger(List.of(Melding.builder()
                        .meldingNr(1)
                        .fraIdent(request.getIdent())
                        .rolle(Rolle.MELDER)
                        .tid(LocalDateTime.now())
                        .innhold(request.getFoersteMelding())
                        .build()))
                .build();
    }

    public Melding newMelding(TilbakemeldingNewMeldingRequest request) {
        var melding = Melding.builder()
                .meldingNr(getLastMelding().meldingNr + 1)
                .fraIdent(request.getIdent())
                .rolle(request.getRolle())
                .tid(LocalDateTime.now())
                .innhold(request.getMelding())
                .build();
        getMeldinger().add(melding);
        return melding;
    }

    public Melding finnMelding(int meldingNr) {
        return tryFind(getMeldinger(), m -> m.getMeldingNr() == meldingNr).orElseThrow(() -> new ValidationException("Melding finnes ikke"));
    }

    public void fjernMelding(Melding melding) {
        getMeldinger().remove(melding);
    }

    public TilbakemeldingResponse toResponse() {
        return TilbakemeldingResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .kravNummer(kravNummer)
                .kravVersjon(kravVersjon)
                .tittel(tittel)
                .type(type)
                .melderIdent(melder.getIdent())
                .endretKrav(endretKrav)
                .status(status)
                .meldinger(convert(meldinger, melding -> MeldingResponse.builder()
                        .meldingNr(melding.meldingNr)
                        .fraIdent(melding.fraIdent)
                        .rolle(melding.rolle)
                        .tid(melding.tid)
                        .innhold(melding.innhold)
                        .endretTid(melding.endretTid)
                        .endretAvIdent(melding.endretAvIdent)
                        .build()))
                .build();
    }
}
