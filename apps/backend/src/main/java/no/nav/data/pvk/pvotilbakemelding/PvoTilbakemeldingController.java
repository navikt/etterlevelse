package no.nav.data.pvk.pvotilbakemelding;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/pvotilbakemelding")
@Tag(name = "Pvo tilbakemelding", description = "PVO tilbakemelding for PVK dokument")
public class PvoTilbakemeldingController {

    private final PvoTilbakemeldingService pvoTilbakemeldingService;


}
