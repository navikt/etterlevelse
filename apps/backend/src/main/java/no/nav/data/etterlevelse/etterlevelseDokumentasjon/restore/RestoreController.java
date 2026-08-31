package no.nav.data.etterlevelse.etterlevelseDokumentasjon.restore;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.restore.dto.DeletedEtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.restore.dto.RestoreResultResponse;

@Slf4j
@RestController
@RequestMapping("/restore")
@Tag(name = "Restore", description = "Gjenoppretting av slettede etterlevelsesdokumentasjoner")
@RequiredArgsConstructor
public class RestoreController {

    private final RestoreService restoreService;

    @Operation(summary = "Get deleted etterlevelse dokumentasjon")
    @ApiResponse(description = "List of deleted etterlevelse dokumentasjon fetched")
    @GetMapping("/etterlevelsedokumentasjon")
    public ResponseEntity<List<DeletedEtterlevelseDokumentasjonResponse>> findDeleted() {
        log.info("Received request for deleted etterlevelse dokumentasjon");
        return new ResponseEntity<>(restoreService.findDeleted(), HttpStatus.OK);
    }

    @Operation(summary = "Restore deleted etterlevelse dokumentasjon")
    @ApiResponse(description = "Etterlevelse dokumentasjon restored")
    @PostMapping("/etterlevelsedokumentasjon/{id}")
    public ResponseEntity<RestoreResultResponse> restore(@PathVariable UUID id) {
        log.info("Received request to restore etterlevelse dokumentasjon with id={}", id);
        return new ResponseEntity<>(restoreService.restore(id), HttpStatus.OK);
    }

}
