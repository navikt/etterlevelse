package no.nav.data.pvk.pvotilbakemelding.dto;

import lombok.*;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.krav.dto.SuksesskriterieRequest;
import no.nav.data.pvk.pvotilbakemelding.domain.Tilbakemeldingsinnhold;
import no.nav.data.pvk.pvotilbakemelding.domain.TilhorendeDokumentasjonTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.Vurdering;

import java.time.LocalDateTime;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.copyOf;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class VurderingRequest  implements Validated {
    private int innsendingId;
    private Tilbakemeldingsinnhold behandlingenslivslop;
    private Tilbakemeldingsinnhold behandlingensArtOgOmfang;
    private TilhorendeDokumentasjonTilbakemelding tilhorendeDokumentasjon;
    private Tilbakemeldingsinnhold innvolveringAvEksterne;
    private Tilbakemeldingsinnhold risikoscenarioEtterTiltakk;

    private String internDiskusjon;
    private String merknadTilEtterleverEllerRisikoeier;
    private LocalDateTime sendtDato;
    private String sendtAv;
    private List<String> ansvarlig;

    private Boolean arbeidGarVidere;
    private String arbeidGarVidereBegrunnelse;
    private Boolean behovForForhandskonsultasjon;
    private String behovForForhandskonsultasjonBegrunnelse;

    private String pvoVurdering;
    private Boolean pvoFolgeOppEndringer;
    private Boolean vilFaPvkIRetur;

    @Override
    public void format() {
        setInnsendingId(innsendingId);
        getBehandlingenslivslop().setTilbakemeldingTilEtterlevere(trimToNull(behandlingenslivslop.getTilbakemeldingTilEtterlevere()));
        getBehandlingenslivslop().setInternDiskusjon(trimToNull(behandlingenslivslop.getInternDiskusjon()));

        getBehandlingensArtOgOmfang().setTilbakemeldingTilEtterlevere(trimToNull(behandlingensArtOgOmfang.getTilbakemeldingTilEtterlevere()));
        getBehandlingensArtOgOmfang().setInternDiskusjon(trimToNull(behandlingensArtOgOmfang.getInternDiskusjon()));

        getTilhorendeDokumentasjon().setInternDiskusjon(trimToNull(tilhorendeDokumentasjon.getInternDiskusjon()));
        getTilhorendeDokumentasjon().setBehandlingskatalogDokumentasjonTilbakemelding(trimToNull(tilhorendeDokumentasjon.getBehandlingskatalogDokumentasjonTilbakemelding()));
        getTilhorendeDokumentasjon().setKravDokumentasjonTilbakemelding(trimToNull(tilhorendeDokumentasjon.getKravDokumentasjonTilbakemelding()));
        getTilhorendeDokumentasjon().setRisikovurderingTilbakemelding(trimToNull(tilhorendeDokumentasjon.getRisikovurderingTilbakemelding()));

        getInnvolveringAvEksterne().setTilbakemeldingTilEtterlevere(trimToNull(innvolveringAvEksterne.getTilbakemeldingTilEtterlevere()));
        getInnvolveringAvEksterne().setInternDiskusjon(trimToNull(innvolveringAvEksterne.getInternDiskusjon()));

        getRisikoscenarioEtterTiltakk().setTilbakemeldingTilEtterlevere(trimToNull(risikoscenarioEtterTiltakk.getTilbakemeldingTilEtterlevere()));
        getRisikoscenarioEtterTiltakk().setInternDiskusjon(trimToNull(risikoscenarioEtterTiltakk.getInternDiskusjon()));

        setInternDiskusjon(trimToNull(internDiskusjon));
        setMerknadTilEtterleverEllerRisikoeier(trimToNull(merknadTilEtterleverEllerRisikoeier));

        setSendtAv(sendtAv);
        setSendtDato(sendtDato);
        setAnsvarlig(copyOf(ansvarlig));

        setArbeidGarVidere(arbeidGarVidere);
        setArbeidGarVidereBegrunnelse(arbeidGarVidereBegrunnelse);
        setBehovForForhandskonsultasjon(behovForForhandskonsultasjon);
        setBehovForForhandskonsultasjonBegrunnelse(behovForForhandskonsultasjonBegrunnelse);

        setPvoVurdering(pvoVurdering);
        setPvoFolgeOppEndringer(pvoFolgeOppEndringer);
        setVilFaPvkIRetur(vilFaPvkIRetur);
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        if (innsendingId < 0) {
            validator.addError(Fields.innsendingId, "NEGATIVE_INNSENDING_ID", "innsending id cannot be negative");
        }
    }

    public Vurdering convertToVurdering() {
        return Vurdering.builder()
                .innsendingId(innsendingId)
                .behandlingenslivslop(behandlingenslivslop)
                .behandlingensArtOgOmfang(behandlingensArtOgOmfang)
                .tilhorendeDokumentasjon(tilhorendeDokumentasjon)
                .innvolveringAvEksterne(innvolveringAvEksterne)
                .risikoscenarioEtterTiltakk(risikoscenarioEtterTiltakk)

                .internDiskusjon(internDiskusjon)
                .merknadTilEtterleverEllerRisikoeier(merknadTilEtterleverEllerRisikoeier)

                .sendtAv(sendtAv)
                .sendtDato(sendtDato)
                .ansvarlig(copyOf(ansvarlig))
                .arbeidGarVidere(arbeidGarVidere)
                .arbeidGarVidereBegrunnelse(arbeidGarVidereBegrunnelse)
                .behovForForhandskonsultasjon(behovForForhandskonsultasjon)
                .behovForForhandskonsultasjonBegrunnelse(behovForForhandskonsultasjonBegrunnelse)
                .pvoVurdering(pvoVurdering)
                .pvoFolgeOppEndringer(pvoFolgeOppEndringer)
                .vilFaPvkIRetur(vilFaPvkIRetur)
                .build();

    }

    public static VurderingRequest buildFrom(Vurdering vurdering) {
        return VurderingRequest.builder()
                .innsendingId(vurdering.getInnsendingId())
                .behandlingenslivslop(vurdering.getBehandlingenslivslop())
                .behandlingensArtOgOmfang(vurdering.getBehandlingensArtOgOmfang())
                .tilhorendeDokumentasjon(vurdering.getTilhorendeDokumentasjon())
                .innvolveringAvEksterne(vurdering.getInnvolveringAvEksterne())
                .risikoscenarioEtterTiltakk(vurdering.getRisikoscenarioEtterTiltakk())

                .internDiskusjon(vurdering.getInternDiskusjon())
                .merknadTilEtterleverEllerRisikoeier(vurdering.getMerknadTilEtterleverEllerRisikoeier())

                .sendtAv(vurdering.getSendtAv())
                .sendtDato(vurdering.getSendtDato())
                .ansvarlig(copyOf(vurdering.getAnsvarlig()))
                .arbeidGarVidere(vurdering.getArbeidGarVidere())
                .arbeidGarVidereBegrunnelse(vurdering.getArbeidGarVidereBegrunnelse())
                .behovForForhandskonsultasjon(vurdering.getBehovForForhandskonsultasjon())
                .behovForForhandskonsultasjonBegrunnelse(vurdering.getBehovForForhandskonsultasjonBegrunnelse())
                .pvoVurdering(vurdering.getPvoVurdering())
                .pvoFolgeOppEndringer(vurdering.getPvoFolgeOppEndringer())
                .vilFaPvkIRetur(vurdering.getVilFaPvkIRetur())
                .build();
    }
}
