package no.nav.data.etterlevelse.statistikk;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.statistikk.domain.BehandlingStatistikk;
import no.nav.data.etterlevelse.statistikk.dto.EtterlevelseStatistikkResponse;
import no.nav.data.etterlevelse.statistikk.dto.KravStatistikkResponse;
import no.nav.data.etterlevelse.statistikk.dto.TilbakemeldingStatistikkResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<RestResponsePage<BehandlingStatistikk>>  getBehandlingStatistikk(PageParameters pageParameters) {
        log.info("Get all behandling statistikk");
        Page<BehandlingStatistikk> page = service.getAllBehandlingStatistikk(pageParameters.createPage());
        return ResponseEntity.ok(new RestResponsePage<>(page));
    }

    @Operation(summary = "Get Krav Statistics ")
    @ApiResponse(description = "ok")
    @GetMapping("/krav")
    public ResponseEntity<RestResponsePage<KravStatistikkResponse>> getAllKravStatistics(PageParameters pageParameters) {
        log.info("Get Krav Statistics");
        Page<Krav> page = service.getAllKravStatistics(pageParameters.createPage());
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(service::toKravStatestikkResponse));
    }

    @Operation(summary = "Get Etterlevelse Statistics ")
    @ApiResponse(description = "ok")
    @GetMapping("/etterlevelse")
    public ResponseEntity<RestResponsePage<EtterlevelseStatistikkResponse>> getAllEtterlevelseStatistics(PageParameters pageParameters) {
        log.info("Get Etterlevelse Statistics");
        Page<Etterlevelse> page = service.getAllEtterlevelseStatistics(pageParameters.createPage());
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(service::toEtterlevelseStatistikkResponse));
    }

    @Operation(summary = "Get tilbakemelding Statistics ")
    @ApiResponse(description = "ok")
    @GetMapping("/tilbakemelding")
    public ResponseEntity<RestResponsePage<TilbakemeldingStatistikkResponse>> getAllTilbakemeldingStatistics(PageParameters pageParameters) {
        log.info("Get tilbakemelding Statistics");
        Page<TilbakemeldingStatistikkResponse> page = service.getAllTilbakemeldingStatistikk(pageParameters.createPage());
        return ResponseEntity.ok(new RestResponsePage<>(page));
    }
}
