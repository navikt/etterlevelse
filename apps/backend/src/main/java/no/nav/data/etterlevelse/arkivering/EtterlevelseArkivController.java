package no.nav.data.etterlevelse.arkivering;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
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

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
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

    private final BehandlingService behandlingService;

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
            @RequestParam(name="websakNummer") String webSakNummer
    ) {
        log.info("Get etterlevelsearkiv by webSaknummer {}", webSakNummer);
        List<EtterlevelseArkiv> etterlevelseArkivList=etterlevelseArkivService.getByWebsakNummer(webSakNummer);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseArkivList).convert(EtterlevelseArkiv::toResponse));
    }

    @Operation(summary = "Get etterlevelsearkiv by status")
    @ApiResponse(description = "Ok")
    @GetMapping("/status")
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> getByStatus(@RequestParam EtterlevelseArkivStatus status) {
        log.info("Get etterlevelsearkiv by status {}", status);
        List<EtterlevelseArkiv> etterlevelseArkivList=etterlevelseArkivService.getByStatus(status.name());
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseArkivList).convert(EtterlevelseArkiv::toResponse));
    }

    @Operation(summary = "Get etterlevelsearkiv by behandlingId")
    @ApiResponse(description = "Ok")
    @GetMapping("/behandling/{behandlingId}")
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> getByBehandling(@PathVariable String behandlingId) {
        log.info("Get etterlevelsearkiv by behandlinId {}", behandlingId);
        List<EtterlevelseArkiv> etterlevelseArkivList=etterlevelseArkivService.getByBehandling(behandlingId);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseArkivList).convert(EtterlevelseArkiv::toResponse));
    }

    @SneakyThrows
    @Operation(summary = "Export etterlevelse to archive")
    @ApiResponse(description = "Ok")
    @GetMapping(value = "/export", produces = "application/zip")
    public void getExportArchive(HttpServletResponse response) {
        log.info("export etterlevelse to archive");

        List<EtterlevelseArkiv> etterlevelseArkivList = etterlevelseArkivService.setStatusToBehandler_arkivering();

        byte[] etterlevelserArchiveZip = etterlevelseArkivService.getEtterlevelserArchiveZip(etterlevelseArkivList);

        response.setContentType("application/zip");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=archive.zip");
        StreamUtils.copy(etterlevelserArchiveZip, response.getOutputStream());
        response.flushBuffer();
    }

    @Operation(summary = "Update status to arkivert")
    @ApiResponse(description = "ok")
    @PutMapping("/status/arkivert")
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> arkiver(@RequestBody ArkiverRequest arkiverRequest){

        log.info("Arkivering vellykket, setter status BEHANDLER_ARKIVERING til ARKIVERT");

        if(!arkiverRequest.getFailedToArchiveBehandlingsNr().isEmpty()) {
            for(String failedBehandlingsFilnavn: arkiverRequest.getFailedToArchiveBehandlingsNr()) {

                final Pattern pattern = Pattern.compile("B\\d*" );
                final Matcher matcher = pattern.matcher(failedBehandlingsFilnavn);

                String failedBehandlingsNr = matcher.find() ? matcher.group(0) : "B";

                log.info("Feilet med å arkivere: " + failedBehandlingsNr);
                List<Behandling> sokResultat = behandlingService.findBehandlinger(failedBehandlingsNr)
                        .stream()
                        .filter(behandling -> behandling.getNummer()==Integer.parseInt(failedBehandlingsNr.substring(1)))
                        .toList();
                if(!sokResultat.isEmpty()){
                    log.info("Fant behandling for: {}, søkeresultat:{}",failedBehandlingsNr, sokResultat.get(0).getNummer());
                    etterlevelseArkivService.setStatusWithBehandlingsId(EtterlevelseArkivStatus.ERROR.name(), sokResultat.get(0).getId());
                } else {
                    throw new ValidationException("Fant ikke behandling for " + failedBehandlingsNr);
                }
            }
        }
        String arkiveringDato = LocalDateTime.now().toString();
        etterlevelseArkivService.updateArkiveringDato(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING.name(),arkiveringDato);

        List<EtterlevelseArkiv> etterlevelseArkivList = etterlevelseArkivService.setStatusToArkivert();
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseArkivList).convert(EtterlevelseArkiv::toResponse));
    }

    @Operation(summary = "Update etterlevelseArkiv as admin")
    @ApiResponse(description = "ok")
    @PutMapping("/admin/update/{id}")
    public ResponseEntity<EtterlevelseArkivResponse> adminUpdate(@PathVariable UUID id, @Valid @RequestBody EtterlevelseArkivRequest request){

        log.info("Oppdaterer arkivering som admin");

        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        if(etterlevelseService.getByBehandling(request.getBehandlingId()).isEmpty()) {
            log.info("Ingen dokumentasjon på behandling med id: " + request.getBehandlingId());
            throw  new ValidationException("Kan ikke arkivere en behandling som ikke har dokumentert innhold");
        } else {
            if(request.getStatus() == EtterlevelseArkivStatus.TIL_ARKIVERING) {
                LocalDateTime tilArkiveringDato = LocalDateTime.now();
                request.setTilArkiveringDato(tilArkiveringDato);
            }
            else if(request.getStatus() == EtterlevelseArkivStatus.ARKIVERT) {
                LocalDateTime arkiveringDato = LocalDateTime.now();
                request.setArkiveringDato(arkiveringDato);
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

        List<Etterlevelse> etterlevelseList = etterlevelseService.getByBehandling(request.getBehandlingId());

        if(etterlevelseList.isEmpty()) {
            log.info("Ingen dokumentasjon på behandling med id: " + request.getBehandlingId());
            throw  new ValidationException("Kan ikke arkivere en behandling som ikke har ferdig dokumentert innhold");
        } else {
            if(request.getStatus() == EtterlevelseArkivStatus.TIL_ARKIVERING) {
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

        if(etterlevelseService.getByBehandling(request.getBehandlingId()).isEmpty()) {
            log.info("Ingen dokumentasjon på behandling med id: " + request.getBehandlingId());
            throw  new ValidationException("Kan ikke arkivere en behandling som ikke har ferdig dokumentert innhold");
        } else if (etterlevelseArkivToUpate.getStatus() == EtterlevelseArkivStatus.BEHANDLER_ARKIVERING ) {
            log.info("Arkivering pågår, kan ikke bestille ny arkivering for behandling med id: " + request.getBehandlingId());
            throw new ValidationException("Arkivering pågår, kan ikke bestille ny arkivering for behandling med id: " + request.getBehandlingId());
        } else if (etterlevelseArkivToUpate.getStatus() == EtterlevelseArkivStatus.ERROR) {
            log.info("Kan ikke bestille ny arkivering. Forrige arkivering var ikke vellyket for behandling med id: " + request.getBehandlingId());
            throw new ValidationException("Kan ikke bestille ny arkivering. Forrige arkivering var ikke vellyket for behandling med id: " + request.getBehandlingId());
        } else {
            if(request.getStatus() == EtterlevelseArkivStatus.TIL_ARKIVERING) {
                LocalDateTime tilArkiveringDato = LocalDateTime.now();
                request.setTilArkiveringDato(tilArkiveringDato);
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
