package no.nav.data.common.auditing;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.dto.AuditLogResponse;
import no.nav.data.common.auditing.dto.AuditResponse;
import no.nav.data.common.auditing.dto.MailLogResponse;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.azure.support.MailLog;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@RequestMapping("/audit")
@Tag(name = "Audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditVersionService service;

    @Operation(summary = "Get Audit log")
    @ApiResponse(description = "Audit log fetched")
    @GetMapping
    public ResponseEntity<RestResponsePage<AuditResponse>> getAll(PageParameters paging, @RequestParam(required = false) String table) {
        log.info("Received request for Audit {} table {}", paging, table);
        Pageable pageable = paging.createSortedPageByFieldDescending(AuditVersion.Fields.time);
        Page<AuditResponse> page;
        if (table != null) {
            page = service.findByTable(table, pageable).map(AuditVersion::toResponse);
        } else {
            page = service.findAll(pageable).map(AuditVersion::toResponse);
        }
        return new ResponseEntity<>(new RestResponsePage<>(page), HttpStatus.OK);
    }

    @Operation(summary = "Get Audit log")
    @ApiResponse(description = "Audit log fetched")
    @GetMapping("/tableid/{id}")
    public ResponseEntity<RestResponsePage<AuditResponse>> findByTableId(PageParameters paging, @RequestParam(required = false) UUID id) {
        log.info("Received request for Audit {} table id {}", paging, id);
        Pageable pageable = paging.createSortedPageByFieldDescending(AuditVersion.Fields.time);
        Page<AuditResponse> page = service.findByTableId(id.toString(), pageable).map(AuditVersion::toResponse);
        return new ResponseEntity<>(new RestResponsePage<>(page), HttpStatus.OK);
    }

    @Operation(summary = "Get Audit log for object")
    @ApiResponse(description = "Audit log fetched")
    @GetMapping("/log/{id}")
    public ResponseEntity<AuditLogResponse> findForId(@PathVariable String id) {
        log.info("Received request for Audit with the id={}", id);
        List<AuditVersion> log = service.findByTableIdOrderByTimeDesc(id);
        return new ResponseEntity<>(new AuditLogResponse(id, convert(log, AuditVersion::toResponse)), HttpStatus.OK);
    }

    @Operation(summary = "Get mail log")
    @ApiResponse(description = "Mail log fetched")
    @GetMapping("/maillog")
    public ResponseEntity<RestResponsePage<MailLogResponse>> getAllMailLog(PageParameters paging) {
        log.info("Received request for MailLog {}", paging);
        Pageable pageable = paging.createSortedPageByFieldDescending("LAST_MODIFIED_DATE");
        var page = service.findAllMailLog(pageable).map(GenericStorage::getDomainObjectData).map(MailLog::toResponse);
        return new ResponseEntity<>(new RestResponsePage<>(page), HttpStatus.OK);
    }

    @Operation(summary = "Get mail log for id")
    @ApiResponse(description = "Audit log fetched")
    @GetMapping("/maillog/{id}")
    public ResponseEntity<MailLogResponse> findMailLog(@PathVariable UUID id) {
        log.info("Received request for MailLog with the id={}", id);
        return new ResponseEntity<>(service.getMaillogById(id).toResponse(), HttpStatus.OK);
    }

    @Operation(summary = "Get mail log for user")
    @ApiResponse(description = "Mail log fetched")
    @GetMapping("/maillog/user/{user}")
    public ResponseEntity<RestResponsePage<MailLogResponse>> getMailLogForUser(@PathVariable String user) {
        log.info("Received request for MailLog for user {}", user);
        var list = service.findMaillogByTo(user);
        return new ResponseEntity<>(new RestResponsePage<>(convert(list, gs -> gs.getDomainObjectData().toResponse())), HttpStatus.OK);
    }

    @Operation(summary = "Get audit log by table id and timestamp")
    @ApiResponse(description = "Get audit log by table id and timestamp")
    @GetMapping("/log/{tableId}/{timestamp}")
    public ResponseEntity<List<AuditResponse>> getByTableIdAndTimestamp(@PathVariable String tableId, @PathVariable String timestamp) {
        log.info("Received request for Audit log with table id {} and timestamp {}", tableId, timestamp);
        var list = service.getByTableIdAndTimestamp(tableId, timestamp).stream().map(AuditVersion:: toResponse).toList();
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @Operation(summary = "Get audit log for etterlevelse by etterlevelse document id and timestamp")
    @ApiResponse(description = "Get audit log for etterlevelse by etterlevelse document id and timestamp")
    @GetMapping("/log/etterlevelse/{etterlevelseDokumentasjonsId}/{timestamp}")
    public ResponseEntity<List<AuditResponse>> getEtterlevelserByEtterlevelseDokumentasjonsIdAndTimestamp(@PathVariable String etterlevelseDokumentasjonsId, @PathVariable String timestamp) {
        log.info("Received request for Audit log for etterlevelser with etterlevelse document id {} and timestamp {}", etterlevelseDokumentasjonsId, timestamp);
        var list = service.findLatestEtterlevelseByEtterlevelseDokumentIdAndTimestamp(etterlevelseDokumentasjonsId, timestamp).stream().map(AuditVersion:: toResponse).toList();
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    static class AuditLogPage extends RestResponsePage<AuditResponse> {
    }

    static class MailLogPage extends RestResponsePage<MailLogResponse> {
    }
}
