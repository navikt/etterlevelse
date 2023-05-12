package no.nav.data.etterlevelse.virkemiddel;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.virkemiddel.domain.Virkemiddel;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelRequest;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelResponse;
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
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@RequestMapping("/virkemiddel")
@Tag(name = "Virkemiddel", description = "Virkemiddel for krav og etterlevelse")
@RequiredArgsConstructor
public class VirkemiddelController {

    private final VirkemiddelService service;

    private final CodelistService codelistService;

    @Operation(summary = "Get All Virkemiddel")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<VirkemiddelResponse>> getAll(PageParameters pageParameters) {
        log.info("Get all Virkemiddel");
        Page<Virkemiddel> page = service.getAll(pageParameters.createPage());
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(Virkemiddel::toResponse));
    }

    @Operation(summary = "Get One Virkemiddel")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<VirkemiddelResponse> getById(@PathVariable UUID id) {
        log.info("Get Virkemiddel id={}", id);
        return ResponseEntity.ok(service.get(id).toResponse());
    }

    @Operation(summary = "Get virkemiddel by virkemiddel type")
    @ApiResponse(description = "Virkemiddel fetched")
    @GetMapping("/virkemiddeltype/{code}")
    public ResponseEntity<RestResponsePage<VirkemiddelResponse>> getVirkemiddelByVirkemiddelType(@PathVariable String code) {
        log.info("Received request for Virkemiddel with the virkemiddeltype like {}", code);
        codelistService.validateListNameAndCode(ListName.VIRKEMIDDELTYPE.name(), code);
        var virkemiddel = service.getByVirkemiddelType(code);
        log.info("Returned {} virkemiddel", virkemiddel.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(virkemiddel, Virkemiddel::toResponse)), HttpStatus.OK);
    }

    @Operation(summary = "Search virkemiddel")
    @ApiResponse(description = "Virkemiddel fetched")
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<VirkemiddelResponse>> searchVirkemiddelByName(@PathVariable String name) {
        log.info("Received request for Virkemiddel with the name like {}", name);
        if (name.length() < 3) {
            throw new ValidationException("Search virkemiddel must be at least 3 characters");
        }
        var virkemiddel = service.search(name);
        log.info("Returned {} virkemiddel", virkemiddel.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(virkemiddel, Virkemiddel::toResponse)), HttpStatus.OK);
    }

    @Operation(summary = "Create Virkemiddel")
    @ApiResponse(responseCode = "201", description = "Virkemiddel created")
    @PostMapping
    public ResponseEntity<VirkemiddelResponse> createVirkemiddel(@RequestBody VirkemiddelRequest request) {
        log.info("Create Virkemiddel");
        var virkemiddel = service.save(request);
        return new ResponseEntity<>(virkemiddel.toResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Virkemiddel")
    @ApiResponse(description = "Virkemiddel updated")
    @PutMapping("/{id}")
    public ResponseEntity<VirkemiddelResponse> updateVirkemiddel(@PathVariable UUID id, @Valid @RequestBody VirkemiddelRequest request) {
        log.debug("Update virkemiddel id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        var virkemiddel = service.save(request);
        return ResponseEntity.ok(virkemiddel.toResponse());
    }

    @Operation(summary = "Delete Virkemiddel")
    @ApiResponse(description = "Virkemiddel deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<VirkemiddelResponse> deleteVirkemiddelById(@PathVariable UUID id) {
        log.info("Delete Virkemiddel id={}", id);
        var virkemiddel = service.delete(id);
        return ResponseEntity.ok(virkemiddel.toResponse());
    }
}
