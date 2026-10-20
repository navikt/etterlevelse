package no.nav.data.common.utils;

import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonData;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JsonUtilsTest {

    @Test
    void createObjectMapper_keepsBuilderDefaultsForMissingProperties() {
        var data = JsonUtils.createObjectMapper().readValue("{\"title\":\"test\"}", EtterlevelseDokumentasjonData.class);

        assertThat(data.getTitle()).isEqualTo("test");
        assertThat(data.getStatus()).isEqualTo(EtterlevelseDokumentasjonStatus.UNDER_ARBEID);
        assertThat(data.getBehandlingIds()).isEmpty();
    }
}
