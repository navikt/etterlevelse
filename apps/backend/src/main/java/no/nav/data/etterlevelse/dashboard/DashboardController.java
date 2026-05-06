package no.nav.data.etterlevelse.dashboard;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.dashboard.dto.DashboardResponse;
import no.nav.data.etterlevelse.dashboard.dto.DashboardTableResponse;
import no.nav.data.etterlevelse.dashboard.dto.TemaDashboardResponse;

@Slf4j
@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard", description = "Dashboard statistikk per avdeling")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Get dashboard stats for all avdelinger")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<List<DashboardResponse>> getDashboardStats() {
        log.info("Getting dashboard for all avdeling");
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @Operation(summary = "Get dashboard stats for a single avdeling")
    @ApiResponse(description = "ok")
    @GetMapping("/avdeling/{avdelingId}")
    public ResponseEntity<DashboardResponse> getAvdelingStats(@PathVariable String avdelingId) {
        log.info("Getting dashboard for avdeling with id={}", avdelingId);
        if (avdelingId.isEmpty() || avdelingId.equals("ingen-avdeling")) {
            return ResponseEntity.ok(dashboardService.getStatsForEtterlevelsesDokumentWithNoAvdeling());
        } else {
            return ResponseEntity.ok(dashboardService.getAvdelingStats(avdelingId));
        }
    }

    @Operation(summary = "Get dashboard stats for a single avdeling")
    @ApiResponse(description = "ok")
    @GetMapping("/table/avdeling/{avdelingId}")
    public ResponseEntity<List<DashboardTableResponse>> getTableDashboardForAvdeling(@PathVariable String avdelingId) {
        log.info("Getting dashboard table for avdeling with id={}", avdelingId);
        if (avdelingId.isEmpty() || avdelingId.equals("ingen-avdeling")) {
            return ResponseEntity.ok(dashboardService.getDashboardTable(""));
        } else {
            return ResponseEntity.ok(dashboardService.getDashboardTable(avdelingId));
        }
    }

    @Operation(summary = "Get tema dashboard stats")
    @ApiResponse(description = "ok")
    @GetMapping("/tema")
    public ResponseEntity<List<TemaDashboardResponse>> getTemaDashboardStats(
            @RequestParam(required = false) String avdelingId,
            @RequestParam(required = false) String seksjonId) {
        log.info("Getting tema dashboard stats avdelingId={} seksjonId={}", avdelingId, seksjonId);
        return ResponseEntity.ok(dashboardService.getTemaDashboardStats(avdelingId, seksjonId));
    }
}