package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@Tag(name = "EtterlevelseDokumentasjon", description = "Etterlevelse Dokumentasjon")
@RequestMapping("/etterlevelsedokumentasjon")
@RequiredArgsConstructor
public class EtterlevelseDokumentasjonController {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;


    @Operation(summary = "Get All Etterlevelse Dokumentasjon")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<EtterlevelseDokumentasjonResponse>> getAll(PageParameters pageParameters) {
        log.info("get all etterlevelse dokumentasjon");
        Page<EtterlevelseDokumentasjon> etterlevelseDokumentasjonPage = etterlevelseDokumentasjonService.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseDokumentasjonPage).convert(EtterlevelseDokumentasjon::toResponse));
    }

    @Operation(summary = "Get One Etterlevelse Dokumentasjon")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<EtterlevelseDokumentasjonResponse> getById(@PathVariable UUID id) {
        log.info("Get Etterlevelse Dokumentasjon id={}", id);
        return ResponseEntity.ok(etterlevelseDokumentasjonService.get(id).toResponse());
    }
}
