package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@Tag(name = "EtterlevelseDokumentasjon", description = "Etterlevelse dokumentasjon")
@RequestMapping("/etterlevelsedokumentasjon")
@RequiredArgsConstructor
public class EtterlevelseDokumentasjonController {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    public ResponseEntity<RestResponsePage<EtterlevelseDokumentasjonResponse>> getAll(PageParameters pageParameters) {
        log.info("get all etterlevelse dokumentasjon");
        Page<EtterlevelseDokumentasjon> etterlevelseDokumentasjonPage = etterlevelseDokumentasjonService.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseDokumentasjonPage).convert(EtterlevelseDokumentasjon::toResponse));
    }

}
