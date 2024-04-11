package no.nav.data.etterlevelse.krav;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.ImageUtils;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravImage;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
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

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@RequestMapping("/krav")
@Tag(name = "Krav", description = "Krav for behandlinger")
@RequiredArgsConstructor
public class KravController {

    private final KravService service;
    private final EtterlevelseService etterlevelseService;
    private final TilbakemeldingService tilbakemeldingService;

    @Operation(summary = "Get All Krav")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<KravResponse>> getAll(PageParameters pageParameters) {
        log.info("Get all Krav");
        Page<Krav> page = service.getAll(pageParameters.createPage());
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(Krav::toResponse));
    }

    @Operation(summary = "Get All Krav Without Login ")
    @ApiResponse(description = "ok")
    @GetMapping("/statistic")
    public ResponseEntity<RestResponsePage<KravResponse>> getAllKravStatistics(PageParameters pageParameters) {
        log.info("Get all Krav Statistics");
        Page<Krav> page = service.getAllKravStatistics(pageParameters.createPage());
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

    @Operation(summary = "Search krav by krav number")
    @ApiResponse(description = "Krav fetched")
    @GetMapping("/search/number/{number}")
    public ResponseEntity<RestResponsePage<KravResponse>> searchKravByNumber(@PathVariable String number) {
        log.info("Received request for Krav with the name like {}", number);
        if (number.length() < 1) {
            throw new ValidationException("Search krav number must be at least 1 characters");
        }
        var krav = service.searchByNumber(number);
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
        var krav = service.get(id);
        List<Etterlevelse> etterlevelseList = etterlevelseService.getByKravNummer(krav.getKravNummer(), krav.getKravVersjon());
        if (!etterlevelseList.isEmpty()) {
            throw new ValidationException(String.format("Can not delete krav. Found %s etterlevelse connected to krav.", etterlevelseList.size()));
        }
        List<Tilbakemelding> tilbakemeldingList = tilbakemeldingService.getForKravByNumberAndVersion(krav.getKravNummer(), krav.getKravVersjon());
        if (!tilbakemeldingList.isEmpty()) {
            throw new ValidationException(String.format("Can not delete krav. Found %s tilbakemelding connected to krav.", tilbakemeldingList.size()));
        }
        var deletedKrav = service.delete(id);
        return ResponseEntity.ok(deletedKrav.toResponse());
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

    static class KravPage extends RestResponsePage<KravResponse> {

    }
}
