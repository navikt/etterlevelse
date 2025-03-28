package no.nav.data.etterlevelse.behandlingensLivslop;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.dto.BehandlingensLivslopRequest;
import no.nav.data.etterlevelse.behandlingensLivslop.dto.BehandlingensLivslopResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/behandlingenslivslop")
@Tag(name = "Behandlingens Livsløp", description = "Behandlingens Livsløp for etterlevelsesdokumentasjon")
public class BehandlingensLivslopController {

    private final BehandlingensLivslopService service;

    @Operation(summary = "Get All Behandlingens Livsløp")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<BehandlingensLivslopResponse>> getAll(
            PageParameters pageParameters
    ) {
        log.info("Get all Behandlingens Livsløp");
        Page<BehandlingensLivslop> page = service.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(BehandlingensLivslopResponse::buildFrom));
    }

    @Operation(summary = "Get One Behandlingens Livsløp")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<BehandlingensLivslopResponse> getById(@PathVariable UUID id) {
        log.info("Get Behandlingens Livsløp id={}", id);
        return ResponseEntity.ok(BehandlingensLivslopResponse.buildFrom(service.get(id)));
    }

    @Operation(summary = "Get Behandlingens Livsløp by etterlevelsedokument id")
    @ApiResponse(description = "ok")
    @GetMapping("/etterlevelsedokument/{etterlevelseDokumentId}")
    public ResponseEntity<BehandlingensLivslopResponse> getPvkDokumentByEtterlevelseDokumentId(@PathVariable String etterlevelseDokumentId) {
        log.info("Get Behandlingens Livsløp by etterlevelseDokument id={}", etterlevelseDokumentId);
        Optional<BehandlingensLivslop> behandlingensLivslop = service.getByEtterlevelseDokumentasjon(etterlevelseDokumentId);
        if (behandlingensLivslop.isPresent()) {
            return ResponseEntity.ok(BehandlingensLivslopResponse.buildFrom(behandlingensLivslop.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Create Behandlingens Livsløp")
    @ApiResponse(responseCode = "201", description = "Behandlingens Livsløp created")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BehandlingensLivslopResponse> createBehandlingensLivslop(
            @RequestPart(value = "filer", required = false) List<MultipartFile> filer,
            @RequestPart BehandlingensLivslopRequest request
    ) {
        log.info("Create Behandlingens Livsløp");
        if(filer != null && !filer.isEmpty()) {
            request.setFiler(filer);
        }
        var behandlingensLivslop = service.save(request.convertToBehandlingensLivslop(), request.isUpdate());
        return new ResponseEntity<>(BehandlingensLivslopResponse.buildFrom(behandlingensLivslop), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Behandlingens Livsløp")
    @ApiResponse(description = "Behandlingens Livsløp updated")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BehandlingensLivslopResponse> updateBehandlingensLivslop(
            @PathVariable UUID id,
            @RequestPart(value = "filer", required = false) List<MultipartFile> filer,
            @Valid @RequestPart BehandlingensLivslopRequest request) {
        log.info("Update Behandlingens Livsløp id={}", id);

        if (!Objects.equals(id, request.getId())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var behandlingensLivslopToUpdate = service.get(id);

        if (behandlingensLivslopToUpdate == null) {
            throw new ValidationException(String.format("Could not find behandlingens livsløp to be updated with id = %s ", request.getId()));
        }
        if(filer != null && !filer.isEmpty()) {
            request.setFiler(filer);
        }
        request.mergeInto(behandlingensLivslopToUpdate);
        var behandlingensLivslop = service.save(behandlingensLivslopToUpdate, request.isUpdate());
        return ResponseEntity.ok(BehandlingensLivslopResponse.buildFrom(behandlingensLivslop));
    }

     @Operation(summary = "Delete Behandlingens Livsløp")
     @ApiResponse(description = "Behandlingens Livsløp deleted")
     @DeleteMapping("/{id}")
     public ResponseEntity<BehandlingensLivslopResponse> deleteBehandlingensLivslopById(@PathVariable UUID id) {
         log.info("Delete Behandlingens Livslop id={}", id);
         var behandlingensLivslop = service.delete(id);
         return ResponseEntity.ok(BehandlingensLivslopResponse.buildFrom(behandlingensLivslop));
     }

}
