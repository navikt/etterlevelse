package no.nav.data.integration.ardoq;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@Tag(name = "Ardoq", description = "Ardoq integrasjon")
@RequestMapping("/ardoq")
@RequiredArgsConstructor
public class ArdoqController {

    private final ArdoqClient ardoqClient;


    @Operation(summary = "Get report by id")
    @ApiResponses(value = {@ApiResponse(description = "Report fetched")})
    @GetMapping("/{reportId}")
    public void getReportById(@PathVariable String reportId) {
        log.info("Getting report from ardoq with id: {}", reportId);
        ardoqClient.getReport(reportId);
    }
}
