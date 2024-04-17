package no.nav.data.etterlevelse.arkivering;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkivStatus;
import no.nav.data.etterlevelse.arkivering.dto.ArkiverRequest;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivRequest;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivResponse;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/etterlevelsearkiv")
@Tag(name = "Etterlevelsearkiv", description = "Etterlevelsearkiv")
public class EtterlevelseArkivController {

    private final EtterlevelseArkivService etterlevelseArkivService;
    private final EtterlevelseService etterlevelseService;

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final EtterlevelseArkivToDocService etterlevelseArkivToDocService;

    @Operation(summary = "Get all etterlevelsearkiv")
    @ApiResponse(description = "Ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> getAll(PageParameters pageParameters) {
        log.info("Get all etterlevelsearkiv");
        Page<EtterlevelseArkiv> page = etterlevelseArkivService.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(EtterlevelseArkiv::toResponse));
    }

    @Operation(summary = "Get One EtterlevelseArkiv")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<EtterlevelseArkivResponse> getById(@PathVariable UUID id) {
        log.info("Get Etterlevelse arkiv data by id={}", id);
        return ResponseEntity.ok(etterlevelseArkivService.get(id).toResponse());
    }

    @Operation(summary = "Get etterlevelsearkiv by webSak nummer")
    @ApiResponse(description = "Ok")
    @GetMapping("/websaknummer")
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> getByWebsakNummer(
            @RequestParam(name = "websakNummer") String webSakNummer
    ) {
        log.info("Get etterlevelsearkiv by webSaknummer {}", webSakNummer);
        List<EtterlevelseArkiv> etterlevelseArkivList = etterlevelseArkivService.getByWebsakNummer(webSakNummer);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseArkivList).convert(EtterlevelseArkiv::toResponse));
    }

    @Operation(summary = "Get etterlevelsearkiv by status")
    @ApiResponse(description = "Ok")
    @GetMapping("/status")
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> getByStatus(@RequestParam EtterlevelseArkivStatus status) {
        log.info("Get etterlevelsearkiv by status {}", status);
        List<EtterlevelseArkiv> etterlevelseArkivList = etterlevelseArkivService.getByStatus(status.name());
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseArkivList).convert(EtterlevelseArkiv::toResponse));
    }

    @Operation(summary = "Get etterlevelsearkiv by etterlevelseDokumentasjonId")
    @ApiResponse(description = "Ok")
    @GetMapping("/etterlevelsedokumentasjon/{etterlevelseDokumentasjonId}")
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> getByEtterlevelseDokumentasjon(@PathVariable String etterlevelseDokumentasjonId) {
        log.info("Get etterlevelsearkiv by etterlevelse dokumentasjon id {}", etterlevelseDokumentasjonId);
        List<EtterlevelseArkiv> etterlevelseArkivList = etterlevelseArkivService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseArkivList).convert(EtterlevelseArkiv::toResponse));
    }

    @SneakyThrows
    @Operation(summary = "Export etterlevelse to archive")
    @ApiResponse(description = "Doc fetched", content = @Content(schema = @Schema(implementation = byte[].class)))
    @GetMapping(value = "/export", produces = "application/zip")
    public void getExportArchive(HttpServletResponse response) {
        log.info("export etterlevelse to archive");

        List<EtterlevelseArkiv> etterlevelseArkivList = etterlevelseArkivService.setStatusToBehandler_arkivering();

        byte[] etterlevelserArchiveZip = etterlevelseArkivToDocService.getEtterlevelserArchiveZip(etterlevelseArkivList);

        response.setContentType("application/zip");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=archive.zip");
        StreamUtils.copy(etterlevelserArchiveZip, response.getOutputStream());
        response.flushBuffer();
    }

    @Operation(summary = "Update status to arkivert")
    @ApiResponse(description = "ok")
    @PutMapping("/status/arkivert")
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> arkiver(@RequestBody ArkiverRequest arkiverRequest) {

        log.info("Arkivering vellykket, setter status BEHANDLER_ARKIVERING til ARKIVERT");

        if (!arkiverRequest.getFailedToArchiveEtterlevelseNr().isEmpty()) {
            for (String failedEtterlevelseDokumentasjonFilnavn : arkiverRequest.getFailedToArchiveEtterlevelseNr()) {

                final Pattern pattern = Pattern.compile("E\\d+");
                final Matcher matcher = pattern.matcher(failedEtterlevelseDokumentasjonFilnavn);

                String failedEtterlevelseNr = matcher.find() ? matcher.group(0) : "E";

                log.info("Feilet med å arkivere: " + failedEtterlevelseNr);
                List<EtterlevelseDokumentasjon> sokResultat = etterlevelseDokumentasjonService.searchEtterlevelseDokumentasjon(failedEtterlevelseNr)
                        .stream()
                        .filter(etterlevelseDokumentasjon -> etterlevelseDokumentasjon.getEtterlevelseNummer() == Integer.parseInt(failedEtterlevelseNr.substring(1)))
                        .toList();
                if (!sokResultat.isEmpty()) {
                    log.info("Fant etterlevelse dokumentasjon for: {}, søkeresultat:{}", failedEtterlevelseNr, sokResultat.get(0).getEtterlevelseNummer());
                    etterlevelseArkivService.setStatusWithEtterlevelseDokumentasjonId(EtterlevelseArkivStatus.ERROR, sokResultat.get(0).getId().toString());
                } else {
                    throw new ValidationException("Fant ikke etterlevelse dokumentasjon for " + failedEtterlevelseNr);
                }
            }
        }

        List<EtterlevelseArkiv> etterlevelseArkivList = etterlevelseArkivService.setStatusToArkivert();
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseArkivList).convert(EtterlevelseArkiv::toResponse));
    }

    @Operation(summary = "Update etterlevelseArkiv as admin")
    @ApiResponse(description = "ok")
    @PutMapping("/admin/update/{id}")
    public ResponseEntity<EtterlevelseArkivResponse> adminUpdate(@PathVariable UUID id, @Valid @RequestBody EtterlevelseArkivRequest request) {

        log.info("Oppdaterer arkivering som admin");

        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        if (etterlevelseService.getByEtterlevelseDokumentasjon(request.getEtterlevelseDokumentasjonId()).isEmpty()) {
            log.info("Ingen dokumentasjon på etterlevelse dokumentasjon med id: " + request.getEtterlevelseDokumentasjonId());
            throw new ValidationException("Kan ikke arkivere en etterlevelse dokumentasjon som ikke har dokumentert innhold");
        } else {
            LocalDateTime today = LocalDateTime.now();
            if (request.getStatus() == EtterlevelseArkivStatus.TIL_ARKIVERING) {
                request.setTilArkiveringDato(today);
            } else if (request.getStatus() == EtterlevelseArkivStatus.ARKIVERT) {
                request.setArkiveringDato(today);
            } else if (request.getStatus() == EtterlevelseArkivStatus.IKKE_ARKIVER) {
                request.setArkiveringAvbruttDato(today);
            }
            var etterlevelseArkiv = etterlevelseArkivService.save(request);
            return ResponseEntity.ok(etterlevelseArkiv.toResponse());
        }

    }

    @Operation(summary = "Creating etterlevelseArkiv")
    @ApiResponse(description = "ok")
    @PostMapping
    public ResponseEntity<EtterlevelseArkivResponse> createEtterlevelseArkiv(@RequestBody EtterlevelseArkivRequest request) {
        log.info("Create etterlevelseArkiv");

        List<Etterlevelse> etterlevelseList = etterlevelseService.getByEtterlevelseDokumentasjon(request.getEtterlevelseDokumentasjonId());
        if (etterlevelseList.isEmpty()) {
            log.info("Ingen etterlevelse dokumentasjon med id: " + request.getEtterlevelseDokumentasjonId());
            throw new ValidationException("Kan ikke arkivere uten ferdig dokumentert innhold");
        } else {
            if (request.getStatus() == EtterlevelseArkivStatus.TIL_ARKIVERING) {
                LocalDateTime tilArkiveringDato = LocalDateTime.now();
                request.setTilArkiveringDato(tilArkiveringDato);
            }
            var etterlevelseArkiv = etterlevelseArkivService.save(request);
            return new ResponseEntity<>(etterlevelseArkiv.toResponse(), HttpStatus.CREATED);
        }
    }

    @Operation(summary = "Update etterlevelseArkiv")
    @ApiResponse(description = "ok")
    @PutMapping("/{id}")
    public ResponseEntity<EtterlevelseArkivResponse> updateEtterlevelseArkiv(@PathVariable UUID id, @Valid @RequestBody EtterlevelseArkivRequest request) {
        log.info("Update EtterlevelseArkivResponseid={}", id);

        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        EtterlevelseArkiv etterlevelseArkivToUpate = etterlevelseArkivService.get(id);

        if (etterlevelseService.getByEtterlevelseDokumentasjon(request.getEtterlevelseDokumentasjonId()).isEmpty()) {
            log.info("Ingen etterlevelse dokumentasjon med id: " + request.getEtterlevelseDokumentasjonId());
            throw new ValidationException("Kan ikke arkivere uten ferdig dokumentert innhold");
        } else if (etterlevelseArkivToUpate.getStatus() == EtterlevelseArkivStatus.BEHANDLER_ARKIVERING) {
            log.info("Arkivering pågår, kan ikke bestille ny arkivering for etterlevelse dokumentasjon med id: " + request.getEtterlevelseDokumentasjonId());
            throw new ValidationException("Arkivering pågår, kan ikke bestille ny arkivering for etterlevelse dokumentasjon med id: " + request.getEtterlevelseDokumentasjonId());
        } else if (etterlevelseArkivToUpate.getStatus() == EtterlevelseArkivStatus.ERROR) {
            log.info("Kan ikke bestille ny arkivering. Forrige arkivering var ikke vellyket for etterlevelse dokumentasjon med id: " + request.getEtterlevelseDokumentasjonId());
            throw new ValidationException("Kan ikke bestille ny arkivering. Forrige arkivering var ikke vellyket for etterlevelse dokumentasjon med id: " + request.getEtterlevelseDokumentasjonId());
        } else {
            LocalDateTime today = LocalDateTime.now();
            if (request.getStatus() == EtterlevelseArkivStatus.TIL_ARKIVERING) {
                request.setTilArkiveringDato(today);
            } else if (request.getStatus() == EtterlevelseArkivStatus.IKKE_ARKIVER) {
                request.setArkiveringAvbruttDato(today);
            }
            var etterlevelseArkiv = etterlevelseArkivService.save(request);
            return ResponseEntity.ok(etterlevelseArkiv.toResponse());
        }
    }

    @Operation(summary = "Delete etterlevelseArkiv")
    @ApiResponse(description = "ok")
    @DeleteMapping("/{id}")
    public ResponseEntity<EtterlevelseArkivResponse> deleteEtterlevelseArkiv(@PathVariable UUID id) {
        log.info("Delete EtterlevelseArkivResponse id={}", id);
        var etterlevelseMetadata = etterlevelseArkivService.delete(id);
        return ResponseEntity.ok(etterlevelseMetadata.toResponse());
    }

    public static class EtterlevelseArkivPage extends RestResponsePage<EtterlevelseArkiv> {

    }
}
