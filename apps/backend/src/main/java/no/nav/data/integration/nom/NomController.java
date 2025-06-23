package no.nav.data.integration.nom;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.integration.nom.domain.OrgEnhet;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/nom")
@Tag(name = "Nom", description = "Nom")
public class NomController {

    private final NomGraphClient nomGraphClient;

    @Operation(summary = "Get All Avdelinger")
    @ApiResponse(description = "ok")
    @GetMapping("/avdelinger")
    public ResponseEntity<OrgEnhet> getAllAvdelinger() {
        log.info("Get all avdelinger from nom");
        OrgEnhet response = nomGraphClient.getAllAvdelinger();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get by id")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<OrgEnhet> getById(@PathVariable String id) {
        log.info("Get nom by id");
        OrgEnhet response = nomGraphClient.getById(id);
        return ResponseEntity.ok(response);
    }
}
