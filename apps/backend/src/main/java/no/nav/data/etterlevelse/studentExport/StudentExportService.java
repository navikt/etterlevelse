package no.nav.data.etterlevelse.studentExport;

import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodeUsage;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.export.EtterlevelseDokumentasjonToDoc;
import no.nav.data.etterlevelse.export.domain.EtterlevelseMedKravData;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.studentExport.dto.EtterlevelseDokumentasjonStudentResponse;
import no.nav.data.etterlevelse.studentExport.dto.EtterlevelseStudentResponse;
import no.nav.data.etterlevelse.studentExport.dto.KravStudentResponse;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentExportService {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;

    public List<EtterlevelseDokumentasjonStudentResponse> getDataForStudent(int limit) {
        var response = new ArrayList<EtterlevelseDokumentasjonStudentResponse>();

        var etterlevelseDokumentasjoner = etterlevelseDokumentasjonService.getLatestCreated(limit);
        var alleAktivKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());

        etterlevelseDokumentasjoner.forEach(ed -> {
            var studentResponse = EtterlevelseDokumentasjonStudentResponse.buildFrom(ed);
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

            response.add(studentResponse);

        });
        return response;
    }
}
