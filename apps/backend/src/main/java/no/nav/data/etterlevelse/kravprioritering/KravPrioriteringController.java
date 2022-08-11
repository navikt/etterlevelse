package no.nav.data.etterlevelse.kravprioritering;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.kravprioritering.domain.KravPrioritering;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringRequest;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Objects;
import java.util.UUID;


@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/kravprioritering")
@Tag(name = "KravPrioritering", description = "prioriterings rekkefølge for krav")
public class KravPrioriteringController {


    private final KravPrioriteringService service;

    @Operation(summary = "Get all krav prioritering")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<KravPrioriteringResponse>> getAll(
            PageParameters pageParameters
    ) {
       log.info("Get all krav prioriteringer");
       Page<KravPrioritering> page = service.getAll(pageParameters);
       return ResponseEntity.ok(new RestResponsePage<>(page).convert(KravPrioritering::toResponse));
    }

    @Operation(summary = "Get krav prioritering by KravNummer and KravVersjon")
    @ApiResponse(description = "ok")
    @GetMapping({"/kravnummer/{kravNummer}/{kravVersjon}", "/kravNummer/{kraVnummer}"})
    public ResponseEntity<RestResponsePage<KravPrioriteringResponse>> getById(
            @PathVariable Integer kravNummer,
            @PathVariable(required = false) Integer kravVersjon
    ) {
        log.info("Get krav prioritering for kravnummer={}", kravNummer);
        List<KravPrioritering> kravPrioriteringList = service.getByKravNummer(kravNummer, kravVersjon);
        return ResponseEntity.ok(new RestResponsePage<>(kravPrioriteringList).convert(KravPrioritering::toResponse));
    }

    @Operation(summary = "Get one krav prioritering")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<KravPrioriteringResponse> getById(@PathVariable UUID id) {
        log.info("Get krav prioritering id={}", id);
        return ResponseEntity.ok(service.get(id).toResponse());
    }

    @Operation(summary = "Create krav prioritering")
    @ApiResponse(description = "ok")
    @PostMapping
    public ResponseEntity<KravPrioriteringResponse> createKravPrioritering(@RequestBody KravPrioriteringRequest request) {
        log.info("Create krav prioritering");
        var kravPrioritering = service.save(request);
        return new ResponseEntity<>(kravPrioritering.toResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "Update krav prioritering")
    @ApiResponse(description = "ok")
    @PutMapping("/{id}")
    public ResponseEntity<KravPrioriteringResponse> updateKravPrioritering(@PathVariable UUID id,@Valid @RequestBody KravPrioriteringRequest request) {
        log.info("Update krav prioritering id={}", id);

        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var kravPrioritering = service.save(request);
        return ResponseEntity.ok(kravPrioritering.toResponse());
    }

    @Operation(summary = "Delete krav prioritering")
    @ApiResponse(description = "ok")
    @DeleteMapping("/{id}")
    public ResponseEntity<KravPrioriteringResponse> deleteKravPrioritering(@PathVariable UUID id) {
        log.info("Delete krav prioritering id={}", id);
        var kravPrioritering = service.delete(id);
        return ResponseEntity.ok(kravPrioritering.toResponse());
    }

    static class KravPrioriteringPage extends RestResponsePage<KravPrioriteringResponse> {

    }
}
