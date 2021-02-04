package no.nav.data.etterlevelse.varsel;

import lombok.Getter;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import org.springframework.stereotype.Component;

@Component
public class UrlGenerator {

    private static final String teamSlackId = "T5LNAMWNA";

    @Getter
    private final String baseUrl;
    @Getter
    private final boolean dev;

    private static UrlGenerator INSTANCE;

    public UrlGenerator(SecurityProperties securityProperties) {
        baseUrl = securityProperties.findBaseUrl();
        dev = securityProperties.isDev();
        INSTANCE = this;
    }

    public String kravUrl(Krav krav) {
        return "%s/krav/%d/%d".formatted(baseUrl, krav.getKravNummer(), krav.getKravVersjon());
    }

    public String tilbakemeldingUrl(Tilbakemelding tilbakemelding) {
        return "%s/krav/%d/%d/tilbakemelding/%s".formatted(baseUrl, tilbakemelding.getKravNummer(), tilbakemelding.getKravVersjon(), tilbakemelding.getId());
    }

    public static UrlGenerator instance() {
        return INSTANCE;
    }
}
