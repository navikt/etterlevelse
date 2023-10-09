package no.nav.data.etterlevelse.varsel;

import lombok.Getter;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import org.springframework.stereotype.Component;

@Component
public class UrlGenerator {

    @Getter
    private final String baseUrl;
    @Getter
    private final boolean dev;

    public UrlGenerator(SecurityProperties securityProperties) {
        baseUrl = securityProperties.findBaseUrl();
        dev = securityProperties.isDev();
    }

    public String tilbakemeldingUrl(Tilbakemelding tilbakemelding) {
        return "%s/krav/%d/%d?tilbakemeldingId=%s".formatted(baseUrl, tilbakemelding.getKravNummer(), tilbakemelding.getKravVersjon(), tilbakemelding.getId());
    }
}
