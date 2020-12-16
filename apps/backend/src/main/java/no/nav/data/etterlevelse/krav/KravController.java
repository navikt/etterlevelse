package no.nav.data.etterlevelse.krav;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import javax.validation.Valid;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@RequestMapping("/krav")
@Tag(name = "Krav", description = "Krav for behandlinger")
public class KravController {


    private final KravService service;

    public KravController(KravService service) {
        this.service = service;
    }

    @Operation(summary = "Get All Krav")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<KravResponse>> getAll(PageParameters pageParameters) {
        log.info("Get all Krav");
        Page<Krav> page = service.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(Krav::convertToResponse));
    }

    @Operation(summary = "Get Krav by KravNummer")
    @ApiResponse(description = "ok")
    @GetMapping("/kravnummer/{kravNummer}")
    public ResponseEntity<RestResponsePage<KravResponse>> getById(@PathVariable Integer kravNummer) {
        log.info("Get Krav for kravNummer={}", kravNummer);
        return ResponseEntity.ok(new RestResponsePage<>(service.getByKravNummer(kravNummer)).convert(Krav::convertToResponse));
    }

    @Operation(summary = "Get One Krav by KravNummer and KravVersjon")
    @ApiResponse(description = "ok")
    @GetMapping("/kravnummer/{kravNummer}/{kravVersjon}")
    public ResponseEntity<KravResponse> getById(@PathVariable Integer kravNummer, @PathVariable Integer kravVersjon) {
        log.info("Get Krav for kravNummer={} kravVersjon={}", kravNummer, kravVersjon);
        Optional<KravResponse> response = service.getByKravNummer(kravNummer, kravVersjon).map(Krav::convertToResponse);
        if (response.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response.get());
    }

    @Operation(summary = "Get One Krav")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<KravResponse> getById(@PathVariable UUID id) {
        log.info("Get Krav id={}", id);
        return ResponseEntity.ok(service.get(id).convertToResponse());
    }

    @Operation(summary = "Search krav")
    @ApiResponse(description = "Krav fetched")
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<KravResponse>> searchKravByName(@PathVariable String name) {
        log.info("Received request for Krav with the name like {}", name);
        if (name.length() < 3) {
            throw new ValidationException("Search krav must be at least 3 characters");
        }
        var krav = service.search(name);
        log.info("Returned {} krav", krav.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(krav, Krav::convertToResponse)), HttpStatus.OK);
    }

    @Operation(summary = "Create Krav")
    @ApiResponse(responseCode = "201", description = "Krav created")
    @PostMapping
    public ResponseEntity<KravResponse> createKrav(@RequestBody KravRequest request) {
        log.info("Create Krav");
        var krav = service.save(request);
        return new ResponseEntity<>(krav.convertToResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Krav")
    @ApiResponse(description = "Krav updated")
    @PutMapping("/{id}")
    public ResponseEntity<KravResponse> updateKrav(@PathVariable UUID id, @Valid @RequestBody KravRequest request) {
        log.debug("Update Krav id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        var krav = service.save(request);
        return ResponseEntity.ok(krav.convertToResponse());
    }

    @Operation(summary = "Delete Krav")
    @ApiResponse(description = "Krav deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<KravResponse> deleteKravById(@PathVariable UUID id) {
        log.info("Delete Krav id={}", id);
        var krav = service.delete(id);
        return ResponseEntity.ok(krav.convertToResponse());
    }

    static class KravPage extends RestResponsePage<KravResponse> {

    }
}
