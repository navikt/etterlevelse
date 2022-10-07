package no.nav.data.etterlevelse.etterlevelsearkiv;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.arkivering.EtterlevelseArkivController;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkivStatus;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;

public class EtterlevelseArkivServiceTest extends IntegrationTestBase {

    @Test
    void arkiver_createSixEtterlevelseArkiv_getThreeWithStatusArkivert() {
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.ARKIVERT).build());


        etterlevelseArkivService.setStatusToArkivert();

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/status?status=ARKIVERT", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(3);
    }
}
