package no.nav.data.etterlevelse.studentExport;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.studentExport.dto.EtterlevelseDokumentasjonStudentResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@Tag(name = "Student export for EtterlevelseDokumentasjon", description = "Student export for Etterlevelse Dokumentasjon")
@RequestMapping("/student/etterlevelsedokumentasjon")
public class StudentExportController {

        private final StudentExportService studentExportService;

    @Operation(summary = "Get Etterlevelse Dokumentasjoner")
    @ApiResponse(description = "ok")
    @GetMapping("/limit/{limit}")
        public List<EtterlevelseDokumentasjonStudentResponse> getDataForStudent(@PathVariable int limit) {
            log.info("Get Etterlevelse Dokumentasjoner for student data with data limit={}", limit);
            return studentExportService.getDataForStudent(limit);
        }

}
