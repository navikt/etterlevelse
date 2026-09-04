package no.nav.data.integration.ardoq;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.integration.ardoq.domain.ArdoqExportField;
import no.nav.data.integration.ardoq.dto.ArdoqSystemResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Comparator.comparing;
import static no.nav.data.common.utils.StartsWithComparator.startsWith;
import static no.nav.data.common.utils.StreamUtils.filter;
import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;

@Slf4j
@RestController
@Tag(name = "Ardoq", description = "Ardoq integrasjon")
@RequestMapping("/ardoq")
@RequiredArgsConstructor
public class ArdoqController {

    private final ArdoqClient ardoqClient;
    private final ArdoqExportService ardoqExportService;


    @Operation(summary = "Get all ardoq system")
    @ApiResponses(value = {@ApiResponse(description = "Systems fetched")})
    @GetMapping("/system")
    public ResponseEntity<List<ArdoqSystemResponse>> getAllSystem() {
        log.info("Getting all system from ardoq");
        return new ResponseEntity<>(ardoqClient.getAllArdoqSystems(), HttpStatus.OK);
    }

    @Operation(summary = "Get Ardoq system by id")
    @ApiResponses(value = {@ApiResponse(description = "System fetched")})
    @GetMapping("/{ardoqId}")
    public ResponseEntity<ArdoqSystemResponse> getArdoqSystemById(@PathVariable String ardoqId) {
        log.info("Getting system from ardoq with id: {}", ardoqId);
        Optional<ArdoqSystemResponse> ardoqSystem = ardoqClient.getArdoqSystemById(ardoqId);
        if (ardoqSystem.isEmpty()) {
            throw new NotFoundException("Couldn't find system " + ardoqId);
        }
        return new ResponseEntity<>(ardoqSystem.get(), HttpStatus.OK);
    }

    @Operation(summary = "Search Systems")
    @ApiResponse(description = "Systems fetched")
    @GetMapping("/search/{name}")
    public ResponseEntity<List<ArdoqSystemResponse>> searchSystemByName(@PathVariable String name) {
        log.info("Received request for Ardoq system with the name like {}", name);
        validateLen(name);
        var systems = filter(ardoqClient.getAllArdoqSystems(), system -> containsIgnoreCase(system.getNavn() + " - " + system.getAlias(), name));
        systems.sort(comparing(ArdoqSystemResponse::getNavn, startsWith(name)));
        log.info("Returned {} systems", systems.size());
        return ResponseEntity.ok(systems);
    }

    @Operation(summary = "Export Systems relations with etterlevelses document")
    @ApiResponse(description = "test endpoint for exporting ardoq with etterlevelses document relations")
    @GetMapping("/export")
    public ResponseEntity<byte[]> ExportRelations() {
        log.info("Exporting ardoq with etterlevelses document relations");
        List<ArdoqExportField> systems = ardoqExportService.getColumnData();
        log.info("Successfully created export data");
        log.info("Generating excel file");
        ByteArrayOutputStream excelFile = ardoqExportService.ardoqExportDataToExcel(systems);
        log.info("Successfully generated excel file");
        String filename = "ArdoqSystemRaport.xlsx";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelFile.toByteArray());
    }



    private void validateLen(String name) {
        if (Stream.of(name.split(" ")).sorted().distinct().collect(Collectors.joining("")).length() < 3) {
            throw new ValidationException("Search must be at least 3 characters");
        }
    }
}
