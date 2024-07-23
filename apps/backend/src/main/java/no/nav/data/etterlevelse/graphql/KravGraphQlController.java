package no.nav.data.etterlevelse.graphql;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.etterlevelse.krav.domain.Krav;

import java.util.UUID;

@RequiredArgsConstructor
@Controller
public class KravGraphQlController {
    private final KravService kravService;
    @QueryMapping
    public KravResponse kravById(@Argument UUID id, @Argument Integer nummer,@Argument Integer versjon) {
        if (id != null) {
            try {
                return kravService.get(id).toResponse();
            } catch (NotFoundException e) {
                return null;
            }
        } else if (nummer != null && versjon != null) {
            var resp = kravService.getByKravNummer(nummer, versjon)
                    .map(Krav::toResponse)
                    .orElse(null);
            return resp;
        }
        return null;
    }
}
