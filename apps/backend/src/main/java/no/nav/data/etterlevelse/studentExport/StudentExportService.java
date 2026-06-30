package no.nav.data.etterlevelse.studentExport;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.behandlingensLivslop.BehandlingensLivslopService;
import no.nav.data.etterlevelse.behandlingensLivslop.dto.BehandlingensLivslopResponse;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.studentExport.dto.EtterlevelseDokumentasjonStudentResponse;
import no.nav.data.etterlevelse.studentExport.dto.EtterlevelseStudentResponse;
import no.nav.data.etterlevelse.studentExport.dto.KravStudentResponse;
import no.nav.data.pvk.behandlingensArtOgOmfang.BehandlingensArtOgOmfangService;
import no.nav.data.pvk.behandlingensArtOgOmfang.dto.BehandlingensArtOgOmfangResponse;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import no.nav.data.pvk.pvkdokument.domain.PvkVurdering;
import no.nav.data.pvk.pvkdokument.dto.PvkDokumentResponse;
import no.nav.data.pvk.risikoscenario.RisikoscenarioService;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioResponse;
import no.nav.data.pvk.tiltak.TiltakService;
import no.nav.data.pvk.tiltak.dto.TiltakResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentExportService {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;
    private final BehandlingensLivslopService behandlingensLivslopService;
    private final BehandlingensArtOgOmfangService behandlingensArtOgOmfangService;
    private final PvkDokumentService pvkDokumentService;
    private final RisikoscenarioService risikoscenarioService;
    private final TiltakService tiltakService;

    public List<EtterlevelseDokumentasjonStudentResponse> getDataForStudent(Pageable page) {
        var response = new ArrayList<EtterlevelseDokumentasjonStudentResponse>();

        var etterlevelseDokumentasjoner = etterlevelseDokumentasjonService.getLatestCreated(page);
        var alleAktivKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());

        etterlevelseDokumentasjoner.forEach(ed -> {
            var studentResponse = EtterlevelseDokumentasjonStudentResponse.buildFrom(ed);
            studentResponse.setBehandlinger(etterlevelseDokumentasjonService.getBehandlingData(ed.getBehandlingIds()));

            var behandlingensLivslop = behandlingensLivslopService.getByEtterlevelseDokumentasjon(ed.getId());
            var artOgOmfang = behandlingensArtOgOmfangService.getByEtterlevelseDokumentasjonId(ed.getId());
            var pvkDokument = pvkDokumentService.getByEtterlevelseDokumentasjon(ed.getId());

            List<Krav> kravForEdok = new ArrayList<>(alleAktivKrav.stream().filter(k ->
                    !new HashSet<>(ed.getIrrelevansFor()).containsAll(k.getRelevansFor()) || k.getRelevansFor().isEmpty()
            ).toList());

            var etterlevelser = etterlevelseService.getByEtterlevelseDokumentasjon(ed.getId())
                    .stream()
                    .filter(e -> alleAktivKrav.stream().anyMatch(k ->
                            k.getKravNummer().equals(e.getKravNummer()) &&
                            k.getKravVersjon().equals(e.getKravVersjon())))
                    .toList();

            studentResponse.setRelevanteKraver(kravForEdok.stream()
                    .map(KravStudentResponse::buildFrom)
                    .toList());

            studentResponse.setKravBesvarelser(etterlevelser.stream().map(EtterlevelseStudentResponse::buildFrom).toList());

            if(behandlingensLivslop.isPresent()) {
                var bllResponse = BehandlingensLivslopResponse.buildFrom(behandlingensLivslop.get());
                bllResponse.setChangeStamp(null);
                bllResponse.setVersion(null);
                studentResponse.setBehandlingensLivslopResponse(bllResponse);
            }

            if (artOgOmfang.isPresent()) {
                var artOgOmfangResponse = BehandlingensArtOgOmfangResponse.buildFrom(artOgOmfang.get());
                artOgOmfangResponse.setChangeStamp(null);
                artOgOmfangResponse.setVersion(null);
                studentResponse.setBehandlingsArtOgOmfang(artOgOmfangResponse);
            }

            if (pvkDokument.isPresent()) {
                var pvkDokumentResponse = PvkDokumentResponse.buildFrom(pvkDokument.get());
                pvkDokumentResponse.setChangeStamp(null);
                pvkDokumentResponse.setVersion(null);
                if (!pvkDokumentResponse.getMeldingerTilPvo().isEmpty()) {
                    pvkDokumentResponse.setMeldingerTilPvo(pvkDokumentResponse.getMeldingerTilPvo().stream()
                            .map(melding -> {
                                melding.setSendtTilPvoAv(null);
                                return melding;
                            })
                            .toList());
                }
                pvkDokumentResponse.setGodkjentAvRisikoeier(null);
                studentResponse.setPvkDokument(pvkDokumentResponse);

                if (pvkDokumentResponse.getPvkVurdering().equals(PvkVurdering.SKAL_UTFORE)) {
                    var risikoscenarioList = risikoscenarioService.getByPvkDokument(pvkDokumentResponse.getId().toString(), RisikoscenarioType.ALL)
                            .stream().map(r -> {
                                r.setVersion(null);
                                r.setLastModifiedBy(null);
                                r.setCreatedBy(null);
                                return r;
                            }).toList();
                    var tiltakList = tiltakService.getByPvkDokument(pvkDokumentResponse.getId()).stream().map(t -> {
                        t.setVersion(null);
                        t.getTiltakData().setAnsvarlig(null);
                        t.getTiltakData().setAnsvarligTeam(null);
                        t.setLastModifiedBy(null);
                        t.setCreatedBy(null);
                        return t;
                    }).toList();


                    studentResponse.setRisikoscenarioList(risikoscenarioList.stream()
                            .map(RisikoscenarioResponse::buildFrom)
                            .toList());
                    studentResponse.setTiltakList(tiltakList.stream()
                            .map(TiltakResponse::buildFrom)
                            .toList());
                }
            }

            response.add(studentResponse);

        });
        return response;
    }
}
