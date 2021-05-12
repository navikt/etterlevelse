package no.nav.data.etterlevelse.krav;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.ImageUtils;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravImage;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.dto.CreateTilbakemeldingRequest;
import no.nav.data.etterlevelse.krav.dto.EditTilbakemeldingRequest;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingNewMeldingRequest;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import javax.validation.Valid;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@RequestMapping("/krav")
@Tag(name = "Krav", description = "Krav for behandlinger")
@RequiredArgsConstructor
public class KravController {

    private final KravService service;
    private final TilbakemeldingService tilbakemeldingService;

    @Operation(summary = "Get All Krav")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<KravResponse>> getAll(PageParameters pageParameters) {
        log.info("Get all Krav");
        Page<Krav> page = service.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(Krav::toResponse));
    }

    @Operation(summary = "Get Krav by KravNummer")
    @ApiResponse(description = "ok")
    @GetMapping("/kravnummer/{kravNummer}")
    public ResponseEntity<RestResponsePage<KravResponse>> getById(@PathVariable Integer kravNummer) {
        log.info("Get Krav for kravNummer={}", kravNummer);
        return ResponseEntity.ok(new RestResponsePage<>(service.getByKravNummer(kravNummer)).convert(Krav::toResponse));
    }

    @Operation(summary = "Get One Krav by KravNummer and KravVersjon")
    @ApiResponse(description = "ok")
    @GetMapping("/kravnummer/{kravNummer}/{kravVersjon}")
    public ResponseEntity<KravResponse> getById(@PathVariable Integer kravNummer, @PathVariable Integer kravVersjon) {
        log.info("Get Krav for kravNummer={} kravVersjon={}", kravNummer, kravVersjon);
        Optional<KravResponse> response = service.getByKravNummer(kravNummer, kravVersjon).map(Krav::toResponse);
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
        return ResponseEntity.ok(service.get(id).toResponse());
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
        return new ResponseEntity<>(new RestResponsePage<>(convert(krav, Krav::toResponse)), HttpStatus.OK);
    }

    @Operation(summary = "Create Krav")
    @ApiResponse(responseCode = "201", description = "Krav created")
    @PostMapping
    public ResponseEntity<KravResponse> createKrav(@RequestBody KravRequest request) {
        log.info("Create Krav");
        var krav = service.save(request);
        return new ResponseEntity<>(krav.toResponse(), HttpStatus.CREATED);
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
        return ResponseEntity.ok(krav.toResponse());
    }

    @Operation(summary = "Delete Krav")
    @ApiResponse(description = "Krav deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<KravResponse> deleteKravById(@PathVariable UUID id) {
        log.info("Delete Krav id={}", id);
        var krav = service.delete(id);
        return ResponseEntity.ok(krav.toResponse());
    }

    // Image

    @Operation(summary = "Get Krav image")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}/files/{fileId}")
    public ResponseEntity<byte[]> getFileById(@PathVariable UUID id, @PathVariable UUID fileId,
            @RequestParam(required = false, value = "w") Integer w) {
        log.info("Get Krav id={} fileId={}", id, fileId);
        KravImage image = service.getImage(id, fileId);
        if (w == null) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, image.getType())
                    .body(image.getContent());
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE)
                .body(ImageUtils.resize(image.getContent(), w));
    }

    @Operation(summary = "Upload krav images")
    @ApiResponse(responseCode = "201", description = "Images saved")
    @PostMapping("/{id}/files")
    public ResponseEntity<List<String>> uploadFiles(
            @PathVariable UUID id,
            @RequestParam("file") List<MultipartFile> files) {
        log.info("Krav {} upload {} images", id, files.size());
        var krav = service.get(id);
        var images = service.saveImages(convert(files, f -> KravImage.builder()
                .kravId(krav.getId())
                .name(f.getOriginalFilename())
                .type(f.getContentType())
                .content(getBytes(f))
                .build()));
        images.forEach(i -> Assert.isTrue(validImage(i), () -> "Invalid image " + i.getName() + " " + i.getType()));
        return new ResponseEntity<>(convert(images, i -> i.getId().toString()), HttpStatus.CREATED);
    }

    private boolean validImage(KravImage i) {
        return List.of(MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_JPEG_VALUE).contains(i.getType())
                && i.getContent().length > 0;
    }

    @SneakyThrows
    private byte[] getBytes(MultipartFile f) {
        return f.getBytes();
    }

    // Tilbakemelding

    @Operation(summary = "Create Tilbakemelding")
    @ApiResponse(responseCode = "201", description = "Tilbakemelding created")
    @PostMapping("/tilbakemelding")
    public ResponseEntity<TilbakemeldingResponse> createTilbakemelding(@RequestBody CreateTilbakemeldingRequest request) {
        log.info("Create Tilbakemelding");
        var tilbakemelding = tilbakemeldingService.create(request);
        return new ResponseEntity<>(tilbakemelding.toResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "New Melding on Tilbakemelding")
    @ApiResponse(description = "Melding added")
    @PostMapping("/tilbakemelding/melding")
    public ResponseEntity<TilbakemeldingResponse> tilbakemeldingNewMelding(@RequestBody TilbakemeldingNewMeldingRequest request) {
        log.info("New Melding on Tilbakemelding");
        var tilbakemelding = tilbakemeldingService.newMelding(request);
        return ResponseEntity.ok(tilbakemelding.toResponse());
    }

    @Operation(summary = "Delete Melding on Tilbakemelding")
    @ApiResponse(description = "Melding deleted")
    @DeleteMapping("/tilbakemelding/{tilbakemeldingId}/{meldingNr}")
    public ResponseEntity<TilbakemeldingResponse> tilbakemeldingDeleteMelding(@PathVariable UUID tilbakemeldingId, @PathVariable int meldingNr) {
        log.info("Slett Melding on Tilbakemelding");
        var tilbakemelding = tilbakemeldingService.deleteMelding(tilbakemeldingId, meldingNr);
        return ResponseEntity.ok(tilbakemelding.toResponse());
    }

    @Operation(summary = "Edit Melding on Tilbakemelding")
    @ApiResponse(description = "Melding edited")
    @PostMapping("/tilbakemelding/{tilbakemeldingId}/{meldingNr}")
    public ResponseEntity<TilbakemeldingResponse> tilbakemeldingEditMelding(@PathVariable UUID tilbakemeldingId, @PathVariable int meldingNr, @RequestBody EditTilbakemeldingRequest req) {
        log.info("Edit Melding on Tilbakemelding");
        var tilbakemelding = tilbakemeldingService.editMelding(tilbakemeldingId, meldingNr, req.getInnhold());
        return ResponseEntity.ok(tilbakemelding.toResponse());
    }

    @Operation(summary = "Get Tilbakemeldinger for krav")
    @ApiResponse(description = "Tilbakemeldinger for krav")
    @GetMapping("/tilbakemelding/{kravNummer}/{kravVersjon}")
    public ResponseEntity<RestResponsePage<TilbakemeldingResponse>> getTilbakemeldinger(@PathVariable int kravNummer, @PathVariable int kravVersjon) {
        log.info("Get Tilbakemeldinger for krav K{}.{}", kravNummer, kravVersjon);
        var tilbakemeldinger = tilbakemeldingService.getForKrav(kravNummer, kravVersjon);
        return ResponseEntity.ok(new RestResponsePage<>(tilbakemeldinger).convert(Tilbakemelding::toResponse));
    }

    static class TilbakemeldingPage extends RestResponsePage<TilbakemeldingResponse> {

    }

    static class KravPage extends RestResponsePage<KravResponse> {

    }
}
