package no.nav.data.integration.p360;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.etterlevelse.behandlingensLivslop.BehandlingensLivslopService;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopFil;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.export.EtterlevelseDokumentasjonToDoc;
import no.nav.data.integration.p360.dto.P360Case;
import no.nav.data.integration.p360.dto.P360CaseRequest;
import no.nav.data.integration.p360.dto.P360DocumentCreateRequest;
import no.nav.data.integration.p360.dto.P360File;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;

@Slf4j
@Service
@RequiredArgsConstructor
public class P360ArkiveringService {

    private final P360Service p360Service;
    private final EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;
    private final EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc;
    private final BehandlingensLivslopService behandlingensLivslopService;
    private final PvkDokumentService pvkDokumentService;

    public void archive(EtterlevelseDokumentasjon eDok, boolean onlyActiveKrav, boolean pvoTilbakemelding, boolean risikoeier, boolean godkjenning) {
        var pvkDokument = pvkDokumentService.getByEtterlevelseDokumentasjon(eDok.getId());

        SimpleDateFormat formatter = new SimpleDateFormat("yyyy'-'MM'-'dd");
        SimpleDateFormat titleDateformatter = new SimpleDateFormat("yyyy'-'MM'-'dd'_'HH'-'mm'-'ss");
        Date date = new Date();

        if (eDok.getEtterlevelseDokumentasjonData().getP360CaseNumber() == null || eDok.getEtterlevelseDokumentasjonData().getP360CaseNumber().isEmpty()) {
            P360Case sak = p360Service.createCase(P360CaseRequest.builder()
                    .CaseType("Sak")
                    .DefaultValueSet("Etterlevelse")
                    .Title("E" + eDok.getEtterlevelseNummer() + " " + eDok.getTitle().replace(":", " -"))
                    .Status("B")
                    .AccessCode("U")
                    .AccessGroup("Alle ansatte i Nav")
                    .ResponsiblePersonIdNumber(SecurityUtils.getCurrentIdent())
                    .build());

            eDok.getEtterlevelseDokumentasjonData().setP360CaseNumber(sak.CaseNumber);
            eDok.getEtterlevelseDokumentasjonData().setP360Recno(sak.Recno);
            etterlevelseDokumentasjonRepo.save(eDok);
        }

        String filename = titleDateformatter.format(date) + "_Etterlevelse_E" + eDok.getEtterlevelseNummer();
        if (onlyActiveKrav) {
            filename += "_kun_gjeldende_krav_versjon";
        } else {
            filename += "_alle_krav_versjone";
        }

        String documentTitle = "";
        if (pvoTilbakemelding && pvkDokument.isPresent()) {
            if (pvkDokument.get().getPvkDokumentData().getAntallInnsendingTilPvo() != null && pvkDokument.get().getPvkDokumentData().getAntallInnsendingTilPvo() > 1) {
                documentTitle += (pvkDokument.get().getPvkDokumentData().getAntallInnsendingTilPvo() + ". ");
            }
            documentTitle += pvkDokument.get().getPvkDokumentData().getAntallInnsendingTilPvo() + ". Tilbakemelding fra Personvernombudet for ";
        } else if (risikoeier) {
            documentTitle += "Personvernkonsekvensvurdering for ";
        } else if (godkjenning) {
            documentTitle += "Godkjent etterlevelsesdokument ";
        }

        documentTitle += "E" + eDok.getEtterlevelseNummer() + " versjon " + eDok.getEtterlevelseDokumentasjonData().getEtterlevelseDokumentVersjon() + ", " + eDok.getTitle().replace(":", " -").trim();

        byte[] wordFile = etterlevelseDokumentasjonToDoc.generateDocFor(eDok.getId(), Collections.emptyList(), Collections.emptyList(), onlyActiveKrav, (pvoTilbakemelding || risikoeier || godkjenning));

        var behandlingenslivslop = behandlingensLivslopService.getByEtterlevelseDokumentasjon(eDok.getId()).orElse(new BehandlingensLivslop());
        List<BehandlingensLivslopFil> BLLFiler = behandlingenslivslop.getBehandlingensLivslopData().getFiler();

        List<P360File> filer = new ArrayList<>();
        P360DocumentCreateRequest p360DocumentCreateRequest = P360DocumentCreateRequest.builder()
                .CaseNumber(eDok.getEtterlevelseDokumentasjonData().getP360CaseNumber())
                .Title(documentTitle)
                .DocumentDate(formatter.format(date))
                .ResponsiblePersonIdNumber(SecurityUtils.getCurrentIdent())
                .build();

        filer.add(P360File.builder()
                .Title(filename)
                .Format("docx")
                .Base64Data(Base64.getEncoder().encodeToString(wordFile))
                .build());

        if (pvoTilbakemelding || risikoeier || godkjenning) {
            BLLFiler.forEach(behandlingensLivslopFil -> {
                String[] bllFileName = behandlingensLivslopFil.getFilnavn().split("\\.");
                filer.add(
                        P360File.builder()
                                .Title(bllFileName[0])
                                .Format(bllFileName[1])
                                .Base64Data(Base64.getEncoder().encodeToString(behandlingensLivslopFil.getFil()))
                                .build()
                );
            });
        }

        p360DocumentCreateRequest.setFiles(filer);

        p360Service.save(p360DocumentCreateRequest);
    }
}
