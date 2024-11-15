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
import org.springframework.http.ResponseEntity;
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
    @PostMapping
    public ResponseEntity<BehandlingensLivslopResponse> createBehandlingensLivslop(@RequestBody BehandlingensLivslopRequest request) {
        log.info("Create Behandlingens Livsløp");

        var behandlingensLivslop = service.save(request.convertToBehandlingensLivslop(), request.isUpdate());

        return new ResponseEntity<>(BehandlingensLivslopResponse.buildFrom(behandlingensLivslop), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Behandlingens Livsløp")
    @ApiResponse(description = "Behandlingens Livsløp updated")
    @PutMapping("/{id}")
    public ResponseEntity<BehandlingensLivslopResponse> updateBehandlingensLivslo(@PathVariable UUID id, @Valid @RequestBody BehandlingensLivslopRequest request) {
        log.info("Update Behandlingens Livsløp id={}", id);

        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var behandlingensLivslopToUpdate = service.get(id);

        if (behandlingensLivslopToUpdate == null) {
            throw new ValidationException(String.format("Could not find behandlingens livsløp to be updated with id = %s ", request.getId()));
        }

        request.mergeInto(behandlingensLivslopToUpdate);
        var behandlingensLivslop = service.save(behandlingensLivslopToUpdate, request.isUpdate());
        return ResponseEntity.ok(BehandlingensLivslopResponse.buildFrom(behandlingensLivslop));
    }

    /* FIXME
    @Operation(summary = "Delete Behandlingens Livsløp")
    @ApiResponse(description = "Pvk Document deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<PvkDokumentResponse> deletePvkDokumentById(@PathVariable UUID id) {
        log.info("Delete Pvk Document id={}", id);
        var pvkDokument = pvkDokumentService.delete(id);
        if(pvkDokument == null) {
            log.warn("Could not find pvk dokument with id = {} to delete", id);
            return ResponseEntity.ok(null);
        } else {
            return ResponseEntity.ok(PvkDokumentResponse.buildFrom(pvkDokument));
        }
    }

    @Operation(summary = "Get Pvk Document files")
    @ApiResponse(description = "ok")
    @GetMapping("/{pvkdokumentid}/files")
    public ResponseEntity<List<PvkDokumentFil>> getFilesByPvkDokumentId(@PathVariable UUID pvkdokumentid) {
        log.info("Get files for Pvk dokument id={}", pvkdokumentid);
        List<PvkDokumentFil> files = pvkDokumentService.getPvkDokumentFilByPvkDokumentId(pvkdokumentid.toString());

        return ResponseEntity.ok(files);
    }

    @Operation(summary = "Upload Pvk Document files")
    @ApiResponse(responseCode = "201", description = "Files saved")
    @PostMapping("/{pvkdokumentid}/files")
    public ResponseEntity<List<String>> uploadFiles(
            @PathVariable UUID pvkdokumentid,
            @RequestParam("file") List<MultipartFile> files
    ) {
        log.info("Pvk Document {} upload {} files", pvkdokumentid, files.size());
        var pvkDokument = pvkDokumentService.get(pvkdokumentid);

        if (pvkDokument == null) {
            log.warn("Unable to save files, no pvk document with id={} found", pvkdokumentid);
            throw new ValidationException(String.format("Unable to save files, no pvk document with id=%s found", pvkdokumentid));
        }

        files.forEach(i -> Assert.isTrue(validFile(i), () -> "Invalid file " + i.getName() + " " + i.getContentType()));

        var filesToSave = pvkDokumentService.saveImages(convert(files, f -> {
            var pvkDokumentFil = pvkDokumentService.getPvkDokumentFilByFileNameAndType(f.getOriginalFilename(), f.getContentType());

            var pvkDokumentFilToSave = PvkDokumentFil.builder()
                    .pvkDokumetId(pvkDokument.getId().toString())
                    .filename(f.getOriginalFilename())
                    .fileType(f.getContentType())
                    .content(getBytes(f))
                    .build();

            pvkDokumentFil.ifPresentOrElse(
                    pvkFil ->  pvkDokumentFilToSave.setId(pvkFil.getId()),
                    () -> pvkDokumentFilToSave.setId(UUID.randomUUID()));

            return pvkDokumentFilToSave;
        }));

        return new ResponseEntity<>(convert(filesToSave, i -> i.getId().toString()), HttpStatus.CREATED);
    }

    @Operation(summary = "Delete Pvk Document file")
    @ApiResponse(description = "Pvk Document file deleted")
    @DeleteMapping("/pvkdokumentfil/{id}")
    public ResponseEntity<PvkDokumentFil> deletePvkDokumentFilById(@PathVariable UUID id) {
        log.info("Delete Pvk Document file with id={}", id);
        var pvkDokumentFil = pvkDokumentService.deleteFile(id);

        if(pvkDokumentFil == null) {
            log.warn("Could not find pvk dokument file with id = {} to delete", id);
            return ResponseEntity.ok(null);
        } else {
            return ResponseEntity.ok(pvkDokumentFil);
        }
    }

    private boolean validFile(MultipartFile i) {
        return List.of(MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_JPEG_VALUE, MediaType.APPLICATION_PDF).contains(i.getContentType())
                && getBytes(i).length > 0;
    }

    @SneakyThrows
    private byte[] getBytes(MultipartFile f) {
        return f.getBytes();
    }
    //*/
}
