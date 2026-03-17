package no.nav.data.integration.dpBehandling;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.integration.dpBehandling.dto.DpBehandling;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@Tag(name = "Nav som Databehandler", description = "Nav som Databehandler from Behandlingskatalogen")
@RequestMapping("/dpbehandling")
@RequiredArgsConstructor
public class DpBehandlingController {

     private final DpBehandlingService service;

    @Operation(summary = "Get Nav som databehandler")
    @ApiResponses(value = {@ApiResponse(description = "DpBehandling fetched")})
    @GetMapping("/{id}")
    public ResponseEntity<DpBehandling> getDpBehandling(@PathVariable String id) {
        log.info("Get DpBehandling by id={}", id);
        DpBehandling dpBehandlinger = service.getDpBehandling(id);
        if (dpBehandlinger == null) {
            throw new NotFoundException("behandling %s not found".formatted(id));
        }
        return ResponseEntity.ok(dpBehandlinger);
    }

    @Operation(summary = "Search DpBehandlinger")
    @ApiResponses(value = {@ApiResponse(description = "DpBehandlinger fetched")})
    @GetMapping("/search/{search}")
    public ResponseEntity<RestResponsePage<DpBehandling>> searchDpBehandlinger(@PathVariable String search) {
        if (search == null || search.replace(" ", "").length() < 3) {
            return ResponseEntity.badRequest().build();
        }
        log.info("Search dpbehandling by value={}", search);
        List<DpBehandling> dpBehandlingList = service.findDpBehandlinger(search);
        return ResponseEntity.ok(new RestResponsePage<>(dpBehandlingList));
    }
}
