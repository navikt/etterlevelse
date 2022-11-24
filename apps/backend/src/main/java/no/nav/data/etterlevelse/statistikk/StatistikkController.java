package no.nav.data.etterlevelse.statistikk;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.statistikk.domain.BehandlingStatistikk;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/statistikk")
@Tag(name = "Statistikk", description = "Etterlevelse løsning statistikk")
@RequiredArgsConstructor
public class StatistikkController {

    private final StatistikkService service;

    @Operation(summary = "Get all behandling statistikk")
    @ApiResponse(description = "ok")
    @GetMapping("/behandling")
    public ResponseEntity<List<BehandlingStatistikk>>  getBehandlingStatistikk() {
        log.info("Get all behandling statistikk");
        return ResponseEntity.ok(service.getAllBehandlingStatistikk());
    }
}
