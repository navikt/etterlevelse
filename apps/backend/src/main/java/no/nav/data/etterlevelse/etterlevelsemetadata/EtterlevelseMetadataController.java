package no.nav.data.etterlevelse.etterlevelsemetadata;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/etterlevelsemetadata")
@Tag(name = "KravPrioritering", description = "prioriterings rekkefølge for krav")
public class EtterlevelseMetadataController {
}
