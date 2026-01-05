package no.nav.data.integration.nom;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.integration.nom.domain.OrgEnhet;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
    public ResponseEntity<List<OrgEnhet>> getAllAvdelinger() {
        log.info("Get all avdelinger from nom");
        List<OrgEnhet> response = nomGraphClient.getAllAvdelinger();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get avdeling by nom id")
    @ApiResponse(description = "ok")
    @GetMapping("/avdeling/{id}")
    public ResponseEntity<OrgEnhet> getAvdelingById(@PathVariable String id) {
        log.info("Get avdeling by nom id");
        var response = nomGraphClient.getAvdelingById(id);
        if (response.isEmpty()) {
            throw new NotFoundException("Couldn't find avdeling " + id);
        }
        return ResponseEntity.ok(response.get());
    }

    @Operation(summary = "Get seksjon by avdeling id")
    @ApiResponse(description = "ok")
    @GetMapping("/seksjon/avdeling/{id}")
    public ResponseEntity<List<OrgEnhet>> getSeksjonByAvdelingId(@PathVariable String id) {
        log.info("Get seksjoner by avdeling id");
        var response = nomGraphClient.getAllSeksjonForAvdeling(id);
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
