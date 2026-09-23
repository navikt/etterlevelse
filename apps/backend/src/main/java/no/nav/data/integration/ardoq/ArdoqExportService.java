package no.nav.data.integration.ardoq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.integration.ardoq.domain.ArdoqExportEtterlevelseDokumentField;
import no.nav.data.integration.ardoq.domain.ArdoqSystemRelationField;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ArdoqExportService {

    private static final int FETCH_BATCH_SIZE = 500;

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;

    @Value("${etterlev.frontend.url}")
    private String frontendUrl;


    public List<ArdoqSystemRelationField> getArdoqSystemEtterlevelseDocRelationData() {
        List<EtterlevelseDokumentasjon> etterlevelseDokumentasjonMedSystem = etterlevelseDokumentasjonService.getEtterlevelseDokumentasjonerWithSystem();
        List<ArdoqSystemRelationField> ardoqSystemRelationFields = new ArrayList<>();

        etterlevelseDokumentasjonMedSystem.forEach(dokumentasjon -> {
            dokumentasjon.getEtterlevelseDokumentasjonData().getArdoqSystemIds().forEach(ardoqSystemId -> {
                ardoqSystemRelationFields.add(
                        ArdoqSystemRelationField.builder()
                                .ardoqId(ardoqSystemId)
                                .etterlevelseDokumentId(dokumentasjon.getId())
                                .build()
                );
            });
        });

        return ardoqSystemRelationFields;
    }

    public List<ArdoqExportEtterlevelseDokumentField> getEtterlevelseDocData() {
        List<Krav> aktivKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
        List<EtterlevelseDokumentasjon> etterlevelseDokumentasjonMedSystem = getAllEtterlevelseDokumentasjonerInBatches();
        List<ArdoqExportEtterlevelseDokumentField> ardoqExportEtterlevelseDokumentFields = new ArrayList<>();

        etterlevelseDokumentasjonMedSystem.forEach(dokumentasjon -> {

            List<Etterlevelse> etterlevelserForDok = etterlevelseService.getByEtterlevelseDokumentasjon(dokumentasjon.getId());
            List<Krav> kravForEdok = new ArrayList<>(aktivKrav.stream().filter(k ->
                    !new HashSet<>(dokumentasjon.getIrrelevansFor()).containsAll(k.getRelevansFor()) || k.getRelevansFor().isEmpty()
            ).toList());

            List<Etterlevelse> aktivEtterlevelserForDok = etterlevelserForDok.stream().filter(e ->  aktivKrav.stream().anyMatch(k ->
                    k.getKravNummer().equals(e.getKravNummer()) && k.getKravVersjon().equals(e.getKravVersjon()))).toList();

            long etterlevelseNotInKravForEdok = aktivEtterlevelserForDok.stream()
                    .filter(e -> kravForEdok.stream().noneMatch(k ->
                            k.getKravNummer().equals(e.getKravNummer()) && k.getKravVersjon().equals(e.getKravVersjon())))
                    .count();

            int totalKravForEdok = kravForEdok.size() + (int) etterlevelseNotInKravForEdok;

            var oppfyltEtterlevelseList = aktivEtterlevelserForDok.stream()
                    .filter(e -> e.getStatus() == EtterlevelseStatus.FERDIG_DOKUMENTERT || e.getStatus() == EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT)
                    .toList();

            var underArbeidEtterlevelseList = aktivEtterlevelserForDok.stream()
                    .filter(e -> e.getStatus() == EtterlevelseStatus.UNDER_REDIGERING
                            || e.getStatus() == EtterlevelseStatus.IKKE_RELEVANT
                            || e.getStatus() == EtterlevelseStatus.FERDIG
                            || e.getStatus() == EtterlevelseStatus.OPPFYLLES_SENERE)
                    .toList();

            var antallKravIkkeStartet = totalKravForEdok - (oppfyltEtterlevelseList.size() + underArbeidEtterlevelseList.size());

            ardoqExportEtterlevelseDokumentFields.add(
                    ArdoqExportEtterlevelseDokumentField.builder()
                            .etterlevelseDokumentNummer("E" + dokumentasjon.getEtterlevelseNummer())
                            .etterlevelseDokumentId(dokumentasjon.getId())
                            .etterlevelseDokumentNavn(dokumentasjon.getTitle())
                            .antallKrav(totalKravForEdok)
                            .kravIkkeStartet(antallKravIkkeStartet)
                            .kravUnderArbeid(underArbeidEtterlevelseList.size())
                            .kravFerdig(oppfyltEtterlevelseList.size())
                            .linkTilEtterlevelsesDokument(frontendUrl + "/dokumentasjon/" + dokumentasjon.getId())
                            .teams(dokumentasjon.getEtterlevelseDokumentasjonData().getResources())
                            .build()
                );
        });

        return ardoqExportEtterlevelseDokumentFields;
    }

    private List<EtterlevelseDokumentasjon> getAllEtterlevelseDokumentasjonerInBatches() {
        List<EtterlevelseDokumentasjon> result = new ArrayList<>();
        int pageNumber = 0;

        Page<EtterlevelseDokumentasjon> page;
        do {
            page = etterlevelseDokumentasjonService.getAll(PageRequest.of(pageNumber++, FETCH_BATCH_SIZE));
            result.addAll(page.getContent());
        } while (page.hasNext());

        return result;
    }

    public ByteArrayOutputStream ardoqExportEtterlevelseDokumentDataToExcel(List<ArdoqExportEtterlevelseDokumentField> ardoqExportEtterlevelseDokumentFields) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            var sheet = workbook.createSheet("Etterlevelse dokumentasjon data");
            var teamSheet = workbook.createSheet("Etterlevelse dokumentasjon relation med team");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_40_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] headers = {"Etterlevelsesdokument nummer", "EtterlevelsesDokumentId","Dokumentnavn", "Antall krav", "Krav ikke startet", "Krav under arbeid", "Krav ferdig", "Link til etterlevelsesdokument"};
            String[] teamHeaders = {"EtterlevelsesDokumentId", "TeamId"};
            var headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            var teamHeaderRow = teamSheet.createRow(0);
            for (int i = 0; i < teamHeaders.length; i++) {
                Cell cell = teamHeaderRow.createCell(i);
                cell.setCellValue(teamHeaders[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;
            int rowTeamIndex = 1;
            for (ArdoqExportEtterlevelseDokumentField ardoqExportEtterlevelseDokumentField : ardoqExportEtterlevelseDokumentFields) {
                var row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(ardoqExportEtterlevelseDokumentField.getEtterlevelseDokumentNummer());
                row.createCell(1).setCellValue(ardoqExportEtterlevelseDokumentField.getEtterlevelseDokumentId().toString());
                row.createCell(2).setCellValue(ardoqExportEtterlevelseDokumentField.getEtterlevelseDokumentNavn());
                row.createCell(3).setCellValue(ardoqExportEtterlevelseDokumentField.getAntallKrav());
                row.createCell(4).setCellValue(ardoqExportEtterlevelseDokumentField.getKravIkkeStartet());
                row.createCell(5).setCellValue(ardoqExportEtterlevelseDokumentField.getKravUnderArbeid());
                row.createCell(6).setCellValue(ardoqExportEtterlevelseDokumentField.getKravFerdig());
                row.createCell(7).setCellValue(ardoqExportEtterlevelseDokumentField.getLinkTilEtterlevelsesDokument());

                for (String teamId : ardoqExportEtterlevelseDokumentField.getTeams()) {
                    var teamRow = teamSheet.createRow(rowTeamIndex++);
                    teamRow.createCell(0).setCellValue(ardoqExportEtterlevelseDokumentField.getEtterlevelseDokumentId().toString());
                    teamRow.createCell(1).setCellValue(teamId);
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                teamSheet.autoSizeColumn(i);
            }

            workbook.write(out);
            log.info("Excel file generated successfully!");
            return out;
        } catch (IOException e) {
            log.error("Error creating Excel file: {}", e.getMessage());
        }
        return null;
    }

    public ByteArrayOutputStream ardoqExportSystemRelationDataToExcel(List<ArdoqSystemRelationField> ardoqExportSystemRelationFields) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            var sheet = workbook.createSheet("Ardoq System relation med Etterlevelse dokumentasjon");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_40_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] headers = {"System id", "EtterlevelsesDokumentId"};

            var headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;
            for (ArdoqSystemRelationField ardoqSystemRelationField : ardoqExportSystemRelationFields) {
                var row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(ardoqSystemRelationField.getArdoqId());
                row.createCell(1).setCellValue(ardoqSystemRelationField.getEtterlevelseDokumentId().toString());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            log.info("Excel file generated successfully!");
            return out;
        } catch (IOException e) {
            log.error("Error creating Excel file: {}", e.getMessage());
        }
        return null;
    }
}
