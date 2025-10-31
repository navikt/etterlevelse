package no.nav.data.pvk.tiltak;

import no.nav.data.IntegrationTestBase;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakData;
import no.nav.data.pvk.tiltak.dto.TiltakRequest;
import no.nav.data.pvk.tiltak.dto.TiltakResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class TiltakIT extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }

    @Test
    void testGetById() {
        Tiltak tiltak = insertTiltak();
        
        // Get should result in NOT_FOUND for unknown uuid...
        ResponseEntity<TiltakResponse> respEnt = restTemplate.getForEntity("/tiltak/{id}", TiltakResponse.class, UUID.randomUUID());
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        
        // Test get...
        respEnt = restTemplate.getForEntity("/tiltak/{id}", TiltakResponse.class, tiltak.getId());
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respEnt.getBody().getId()).isEqualTo(tiltak.getId());
    }
    
    @Test
    @SuppressWarnings("all")
    void testGetTiltakByPvkDokumentId() {
        Tiltak tiltak = insertTiltak();
        
        // Get by pvkDocId should return no tiltak for unknown uuid...
        ResponseEntity<RestResponsePage> respEntPage = restTemplate.getForEntity("/tiltak/pvkdokument/{pvkDokumentId}", RestResponsePage.class, UUID.randomUUID());
        assertThat(respEntPage.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respEntPage.getBody().getNumberOfElements()).isEqualTo(0);
        
        // Test get by pvkDocId...
        respEntPage = restTemplate.getForEntity("/tiltak/pvkdokument/{pvkDokumentId}", RestResponsePage.class, tiltak.getPvkDokumentId());
        assertThat(respEntPage.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respEntPage.getBody().getNumberOfElements()).isEqualTo(1);
    }
    
    @Test
    void testCrate() {
        PvkDokument pvkDokument = createPvkDokument();
        Risikoscenario risikoscenario = risikoscenarioService.save(generateRisikoscenario(pvkDokument.getId()), false);
        TiltakRequest request = TiltakRequest.builder()
                .pvkDokumentId(pvkDokument.getId().toString())
                .build();

        // Should result in error to call create with unknown Risikoscenario...
        ResponseEntity<TiltakResponse> respEnt = restTemplate.postForEntity("/tiltak/risikoscenario/{id}", request, TiltakResponse.class, UUID.randomUUID());
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(tiltakRepo.findAll()).isEmpty();
        
        // Test create...
        respEnt = restTemplate.postForEntity("/tiltak/risikoscenario/{id}", request, TiltakResponse.class, risikoscenario.getId());
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        TiltakResponse response = respEnt.getBody();
        assertThat(response.getId()).isNotNull();
        assertThat(response.getPvkDokumentId()).isEqualTo(pvkDokument.getId().toString());
        assertThat(response.getRisikoscenarioIds()).contains(risikoscenario.getId());
        Tiltak tiltak = tiltakService.get(response.getId());
        assertThat(tiltak).isNotNull();
        assertThat(response.getRisikoscenarioIds().get(0)).isEqualTo(risikoscenario.getId());
    }
    
    @Test
    void testUpdate() {
        Tiltak tiltak = insertTiltak();
        TiltakRequest request = TiltakRequest.builder()
                .pvkDokumentId(tiltak.getPvkDokumentId().toString())
                .navn("BoinkBoink")
                .iverksatt(true)
                .build();

        // Update should fail for unknown tiltak...
        ResponseEntity<TiltakResponse> respEnt = restTemplate.exchange("/tiltak/{id}", HttpMethod.PUT, new HttpEntity<>(request), TiltakResponse.class, request.getId());
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        
        // Test update...
        request.setId(tiltak.getId());
        respEnt = restTemplate.exchange("/tiltak/{id}", HttpMethod.PUT, new HttpEntity<>(request), TiltakResponse.class, request.getId());
        tiltak = tiltakService.get(tiltak.getId());
        assertThat(tiltak.getTiltakData().getNavn()).isEqualTo("BoinkBoink");
        assertThat(tiltak.getTiltakData().getIverksatt()).isTrue();
        assertThat(tiltak.getTiltakData().getIverksattDato()).isNotNull();
    }

    @Test
    void testDelete() {
        PvkDokument pvkDokument = createPvkDokument();
        Tiltak tiltak = insertTiltak();

        // Delete should fail if tiltak has a relation to one or more risikoscenarioer...
        Risikoscenario risikoscenario = risikoscenarioService.save(generateRisikoscenario(pvkDokument.getId()), false);
        risikoscenarioService.addTiltak(risikoscenario.getId(), List.of(tiltak.getId()));
        ResponseEntity<TiltakResponse> resp = restTemplate.exchange("/tiltak/{id}", HttpMethod.DELETE, null, TiltakResponse.class, tiltak.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(tiltakRepo.count()).isEqualTo(1);
        risikoscenarioService.removeTiltak(risikoscenario.getId(), tiltak.getId());

        // Test delete...
        resp = restTemplate.exchange("/tiltak/{id}", HttpMethod.DELETE, null, TiltakResponse.class, tiltak.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(tiltakRepo.count()).isEqualTo(0);
    }
    
    private Tiltak insertTiltak() {
        PvkDokument pvkDokument = createPvkDokument();
        Tiltak tiltak = Tiltak.builder()
                .pvkDokumentId(pvkDokument.getId())
                .tiltakData(new TiltakData())
                .build();
        return tiltakService.save(tiltak, null, false);
    }

}
