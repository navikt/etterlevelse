package no.nav.data.etterlevelse.krav.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.ChangeStamped;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.krav.domain.TilbakemeldingData.Melder;
import no.nav.data.etterlevelse.krav.domain.TilbakemeldingData.Melding;
import no.nav.data.etterlevelse.krav.domain.TilbakemeldingData.Rolle;
import no.nav.data.etterlevelse.krav.dto.CreateTilbakemeldingRequest;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingNewMeldingRequest;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingResponse;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingResponse.MeldingResponse;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import org.hibernate.annotations.Type;
import org.springframework.util.Assert;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.tryFind;

@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "TILBAKEMELDING")
public class Tilbakemelding extends ChangeStamped implements KravId {

    @Id
    @Column(name = "ID")
    private UUID id;

    @Column(name = "KRAV_NUMMER", nullable = false)
    private Integer kravNummer;

    @Column(name = "KRAV_VERSJON", nullable = false)
    private Integer kravVersjon;

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private TilbakemeldingData data = new TilbakemeldingData();


    public Melding getLastMelding() {
        return data.getMeldinger().get(data.getMeldinger().size() - 1);
    }

    public List<Varslingsadresse> getRecipientsForMelding(Krav krav, Melding melding) {
        Assert.isTrue(krav.kravId().equals(kravId()), "Feil krav");
        if (melding.getRolle() == Rolle.KRAVEIER) {
            return List.of(data.getMelder().getVarslingsadresse());
        }
        return krav.getVarslingsadresser();
    }

    // TODO: Should be moved to CreateTilbakemeldingRequest
    public static Tilbakemelding buildFrom(CreateTilbakemeldingRequest request) {
        return Tilbakemelding.builder()
                .kravNummer(request.getKravNummer())
                .kravVersjon(request.getKravVersjon())
                .data(TilbakemeldingData.builder()
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
                        .build())
                .build();
    }

    public Melding newMelding(TilbakemeldingNewMeldingRequest request) {
        var melding = Melding.builder()
                .meldingNr(getLastMelding().getMeldingNr() + 1)
                .fraIdent(request.getIdent())
                .rolle(request.getRolle())
                .tid(LocalDateTime.now())
                .innhold(request.getMelding())
                .build();
        data.getMeldinger().add(melding);
        return melding;
    }

    public Melding finnMelding(int meldingNr) {
        return tryFind(data.getMeldinger(), m -> m.getMeldingNr() == meldingNr).orElseThrow(() -> new ValidationException("Melding finnes ikke"));
    }

    public void fjernMelding(Melding melding) {
        data.getMeldinger().remove(melding);
    }

    // TODO: Should be moved to TilbakemeldingResponse
    public TilbakemeldingResponse toResponse() {
        return TilbakemeldingResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .kravNummer(kravNummer)
                .kravVersjon(kravVersjon)
                .tittel(data.getTittel())
                .type(data.getType())
                .melderIdent(data.getMelder().getIdent())
                .endretKrav(data.isEndretKrav())
                .status(data.getStatus())
                .meldinger(convert(data.getMeldinger(), melding -> MeldingResponse.builder()
                        .meldingNr(melding.getMeldingNr())
                        .fraIdent(melding.getFraIdent())
                        .rolle(melding.getRolle())
                        .tid(melding.getTid())
                        .innhold(melding.getInnhold())
                        .endretTid(melding.getEndretTid())
                        .endretAvIdent(melding.getEndretAvIdent())
                        .build()))
                .build();
    }

    // The rest is boilerplate code that delegates to contained TilbakemeldingData
    
    public void setStatus(TilbakemeldingStatus status) {
        data.setStatus(status);
    }

    public void setEndretKrav(boolean endretKrav) {
        data.setEndretKrav(endretKrav);
    }

    public Melder getMelder() {
        return data.getMelder();
    }

    public List<Melding> getMeldinger() {
        return data.getMeldinger();
    }

    public Boolean isEndretKrav() {
        return data.isEndretKrav();
    }

    public TilbakemeldingStatus getStatus() {
        return data.getStatus();
    }

}
