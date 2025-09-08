package no.nav.data.pvk.risikoscenario;

import no.nav.data.IntegrationTestBase;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravData;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.risikoscenario.dto.KravRisikoscenarioRequest;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioRequest;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioResponse;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakData;
import no.nav.data.pvk.tiltak.dto.RisikoscenarioTiltakRequest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class RisikoscenarioIT extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }

    @Test
    void testGetById() {
        Risikoscenario risikoscenario = insertRisikoscenario();
        
        // Get should result in NOT_FOUND for unknown uuid...
        ResponseEntity<RisikoscenarioResponse> respEnt = restTemplate.getForEntity("/risikoscenario/{id}", RisikoscenarioResponse.class, UUID.randomUUID());
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        
        // Test get...
        respEnt = restTemplate.getForEntity("/risikoscenario/{id}", RisikoscenarioResponse.class, risikoscenario.getId());
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respEnt.getBody().getId()).isEqualTo(risikoscenario.getId());
    }
    
    @Test
    @SuppressWarnings("all")
    void testGetrisikoscenarioByPvkDokumentId() {
        Risikoscenario risikoscenario = insertRisikoscenario();
        
        // Get by pvkDocId should return no risikoscenario for unknown uuid...
        ResponseEntity<RestResponsePage> respEntPage = restTemplate.getForEntity("/risikoscenario/pvkdokument/{pvkDokumentId}/{scenarioType}", RestResponsePage.class, UUID.randomUUID(), RisikoscenarioType.ALL);
        assertThat(respEntPage.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respEntPage.getBody().getNumberOfElements()).isEqualTo(0);
        
        // Test get by pvkDocId...
        respEntPage = restTemplate.getForEntity("/risikoscenario/pvkdokument/{pvkDokumentId}/{scenarioType}", RestResponsePage.class, risikoscenario.getPvkDokumentId(), RisikoscenarioType.ALL);
        assertThat(respEntPage.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respEntPage.getBody().getNumberOfElements()).isEqualTo(1);
    }
    
    @Test
    @SuppressWarnings("all")
    void testGetrisikoscenarioByKravnr() {
        Risikoscenario risikoscenario = insertRisikoscenario();
        risikoscenario = risikoscenarioService.save(risikoscenario, true);
        
        // Get by kravnummer should return no risikoscenario for unknown kravnummer...
        ResponseEntity<RestResponsePage> respEntPage = restTemplate.getForEntity("/risikoscenario/kravnummer/{kravNummer}", RestResponsePage.class, 404);
        assertThat(respEntPage.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respEntPage.getBody().getNumberOfElements()).isEqualTo(0);
        
        // Test get by pvkDocId...
        respEntPage = restTemplate.getForEntity("/risikoscenario/kravnummer/{kravNummer}", RestResponsePage.class, risikoscenario.getRisikoscenarioData().getRelevanteKravNummer().get(0));
        assertThat(respEntPage.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respEntPage.getBody().getNumberOfElements()).isEqualTo(1);
    }
    
    @Test
    void testCrate() {
        PvkDokument pvkDokument = createPvkDokument();
        RisikoscenarioRequest request = RisikoscenarioRequest.builder()
                .pvkDokumentId(pvkDokument.getId().toString())
                .build();
        
        // Test create...
        ResponseEntity<RisikoscenarioResponse> respEnt = restTemplate.postForEntity("/risikoscenario", request, RisikoscenarioResponse.class);
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        RisikoscenarioResponse response = respEnt.getBody();
        assertThat(response.getId()).isNotNull();
        assertThat(response.getPvkDokumentId()).isEqualTo(pvkDokument.getId().toString());
        List<Risikoscenario> savedScenarios = risikoscenarioRepo.findAll();
        assertThat(savedScenarios).hasSize(1);
        assertThat(savedScenarios.get(0).getId()).isEqualTo(response.getId());

        // Create shuld return BAD_REQUEST if linked to non-existing PvkDokument...
        request.setId(null);
        request.setPvkDokumentId(UUID.randomUUID().toString());
        respEnt = restTemplate.postForEntity("/risikoscenario", request, RisikoscenarioResponse.class);
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void testCrateRisikoscenarioKnyttetTilKrav() {
        PvkDokument pvkDokument = createPvkDokument();
        kravService.save(Krav.builder().id(UUID.randomUUID()).kravNummer(50).kravVersjon(1)
                .data(KravData.builder().navn("Krav 50").regelverk(List.of(Regelverk.builder().lov("ARKIV").spesifisering("§1").build()))
                        .status(KravStatus.AKTIV).build())
                .build()
        );
        RisikoscenarioRequest request = RisikoscenarioRequest.builder()
                .pvkDokumentId(pvkDokument.getId().toString())
                .build();
        // Not testing that request should result in BAD_REQUEST when referencing to non-existing PvkDokument

        // Test create...
        ResponseEntity<RisikoscenarioResponse> respEnt = restTemplate.postForEntity("/risikoscenario/krav/{kravnummer}", request, RisikoscenarioResponse.class, 50);
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        RisikoscenarioResponse response = respEnt.getBody();
        assertThat(response.getId()).isNotNull();
        assertThat(response.getPvkDokumentId()).isEqualTo(pvkDokument.getId().toString());
        List<Risikoscenario> savedScenarios = risikoscenarioRepo.findAll();
        assertThat(savedScenarios).hasSize(1);
        assertThat(savedScenarios.get(0).getId()).isEqualTo(response.getId());

        // Should result in BAD_REQUEST if unknown Krav...
        request.setId(null);
        respEnt = restTemplate.postForEntity("/risikoscenario/krav/{kravnummer}", request, RisikoscenarioResponse.class, 555);
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void testUpdate() {
        Risikoscenario risikoscenario = insertRisikoscenario();
        RisikoscenarioRequest request = RisikoscenarioRequest.builder()
                .pvkDokumentId(risikoscenario.getPvkDokumentId().toString())
                .navn("2024 YR4")
                .build();

        // Update should fail for unknown risikoscenario...
        ResponseEntity<RisikoscenarioResponse> respEnt = restTemplate.exchange("/risikoscenario/{id}", HttpMethod.PUT, new HttpEntity<>(request), RisikoscenarioResponse.class, request.getId());
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        
        // Test update...
        request.setId(risikoscenario.getId());
        respEnt = restTemplate.exchange("/risikoscenario/{id}", HttpMethod.PUT, new HttpEntity<>(request), RisikoscenarioResponse.class, request.getId());
        risikoscenario = risikoscenarioService.get(risikoscenario.getId());
        assertThat(risikoscenario.getRisikoscenarioData().getNavn()).isEqualTo("2024 YR4");
    }

    @Test
    void testDelete() {
        Risikoscenario risikoscenario = insertRisikoscenario();

        // Delete should fail if risikoscenario has a relation to one or more tiltak...
        PvkDokument pvkDokument = pvkDokumentService.get(risikoscenario.getPvkDokumentId());
        Tiltak tiltak = tiltakService.save(Tiltak.builder()
                .pvkDokumentId(pvkDokument.getId())
                .tiltakData(new TiltakData())
                .build(), null, false);
        risikoscenarioService.addTiltak(risikoscenario.getId(), List.of(tiltak.getId()));
        ResponseEntity<RisikoscenarioResponse> resp = restTemplate.exchange("/risikoscenario/{id}", HttpMethod.DELETE, null, RisikoscenarioResponse.class, risikoscenario.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(risikoscenarioRepo.count()).isEqualTo(1);
        risikoscenarioService.removeTiltak(risikoscenario.getId(), tiltak.getId());

        // Delete should return OK and null if requested to delete non-existing Risikoscenario
        resp = restTemplate.exchange("/risikoscenario/{id}", HttpMethod.DELETE, null, RisikoscenarioResponse.class, UUID.randomUUID());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNull();
        assertThat(risikoscenarioRepo.count()).isEqualTo(1);
        
        // Test delete...
        resp = restTemplate.exchange("/risikoscenario/{id}", HttpMethod.DELETE, null, RisikoscenarioResponse.class, risikoscenario.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(risikoscenarioRepo.count()).isEqualTo(0);
    }

    @Test
    void testAddRelevantKravToRisikoscenarioer() {
        Risikoscenario risikoscenario = insertRisikoscenario();
        
        // Should get BAD REQUEST if unknown Krav...
        KravRisikoscenarioRequest relReq = KravRisikoscenarioRequest.builder().kravnummer(1113).risikoscenarioIder(List.of(risikoscenario.getId().toString())).build();
        ResponseEntity<List<RisikoscenarioResponse>> respEntPage = restTemplate.exchange(
                "/risikoscenario/update/addRelevantKrav", 
                HttpMethod.PUT, 
                new HttpEntity<>(relReq),
                new ParameterizedTypeReference<List<RisikoscenarioResponse>>() {}
        );
        assertThat(respEntPage.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        // Test add Krav...
        kravService.save(Krav.builder().id(UUID.randomUUID()).kravNummer(99).kravVersjon(1)
                .data(KravData.builder().navn("Krav 40").status(KravStatus.AKTIV).build()).build());
        relReq.setKravnummer(99);
        respEntPage = restTemplate.exchange(
                "/risikoscenario/update/addRelevantKrav", 
                HttpMethod.PUT, 
                new HttpEntity<>(relReq), 
                new ParameterizedTypeReference<List<RisikoscenarioResponse>>() {}
        );
        assertThat(respEntPage.getStatusCode()).isEqualTo(HttpStatus.OK);
        risikoscenario = risikoscenarioService.get(risikoscenario.getId());
        assertThat(risikoscenario.getRisikoscenarioData().getRelevanteKravNummer()).containsOnly(50, 99);
    }
    
    @Test
    void testRemoveKravFromRisikoscenarioById() {
        Risikoscenario risikoscenario = insertRisikoscenario();
        
        // Should get BAD REQUEST if unknown Krav or Krav not related to Risikoscenario...
        kravService.save(Krav.builder().id(UUID.randomUUID()).kravNummer(51).kravVersjon(1)
                .data(KravData.builder().navn("Krav 51").status(KravStatus.AKTIV).build()).build());
        ResponseEntity<RisikoscenarioResponse> respEntPage = restTemplate.exchange(
                "/risikoscenario/{id}/removeKrav/{kravnummer}", HttpMethod.PUT, null, RisikoscenarioResponse.class, risikoscenario.getId(), 51
        );
        assertThat(respEntPage.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        respEntPage = restTemplate.exchange(
                "/risikoscenario/{id}/removeKrav/{kravnummer}", HttpMethod.PUT, null, RisikoscenarioResponse.class, risikoscenario.getId(), 404
        );
        assertThat(respEntPage.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        // Test add Krav...
        respEntPage = restTemplate.exchange(
                "/risikoscenario/{id}/removeKrav/{kravnummer}", HttpMethod.PUT, null, RisikoscenarioResponse.class, risikoscenario.getId(), 50
        );
        assertThat(respEntPage.getStatusCode()).isEqualTo(HttpStatus.OK);
        risikoscenario = risikoscenarioService.get(risikoscenario.getId());
        assertThat(risikoscenario.getRisikoscenarioData().getRelevanteKravNummer()).isEmpty();
    }

    @Test
    void testUpdateRisikoscenarioAddTiltak() {
        Risikoscenario risikoscenario = insertRisikoscenario();
        Tiltak tiltak = insertTiltak(risikoscenario.getPvkDokumentId());
        
        // Should get 404 if unknown Tiltak or Risikoscenario...
        RisikoscenarioTiltakRequest relReq = RisikoscenarioTiltakRequest.builder().risikoscenarioId(risikoscenario.getId()).build();
        relReq.setTiltakIds(List.of(UUID.randomUUID()));
        ResponseEntity<RisikoscenarioResponse> resp = restTemplate.exchange("/risikoscenario/update/addRelevanteTiltak", HttpMethod.PUT, new HttpEntity<>(relReq), RisikoscenarioResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        relReq.setTiltakIds(List.of(tiltak.getId()));
        relReq.setRisikoscenarioId(UUID.randomUUID());
        resp = restTemplate.exchange("/risikoscenario/update/addRelevanteTiltak", HttpMethod.PUT, new HttpEntity<>(relReq), RisikoscenarioResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        relReq.setRisikoscenarioId(risikoscenario.getId());
        
        // Test add Tiltak...
        resp = restTemplate.exchange("/risikoscenario/update/addRelevanteTiltak", HttpMethod.PUT, new HttpEntity<>(relReq), RisikoscenarioResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        Assertions.assertNotNull(resp.getBody());
        assertThat(resp.getBody().isTiltakOppdatert()).isTrue();
        assertThat(risikoscenarioService.getTiltak(risikoscenario.getId())).containsOnly(tiltak.getId());

        // Should get Bad Request if relation already exists...
        resp = restTemplate.exchange("/risikoscenario/update/addRelevanteTiltak", HttpMethod.PUT, new HttpEntity<>(relReq), RisikoscenarioResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
   
    @Test
    void testRemoveTiltakFromRisikoscenarioById() {
        Risikoscenario risikoscenario = insertRisikoscenario();
        Tiltak tiltak = insertTiltak(risikoscenario.getPvkDokumentId());
        
        // Should get Bad Request if Tiltak is not related to Risikoscenario...
        ResponseEntity<RisikoscenarioResponse> resp = restTemplate.exchange(
                "/risikoscenario/{id}/removeTiltak/{tiltakId}", HttpMethod.PUT, null, RisikoscenarioResponse.class, 
                risikoscenario.getId().toString(), tiltak.getId().toString()
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        // Test remove...
        tiltakService.addRisikoscenarioTiltakRelasjon(risikoscenario.getId(), tiltak.getId());
        resp = restTemplate.exchange(
                "/risikoscenario/{id}/removeTiltak/{tiltakId}", HttpMethod.PUT, null, RisikoscenarioResponse.class, 
                risikoscenario.getId().toString(), tiltak.getId().toString()
        );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        Assertions.assertNotNull(resp.getBody());
        assertThat(resp.getBody().isTiltakOppdatert()).isTrue();
        assertThat(risikoscenarioService.getTiltak(risikoscenario.getId())).isEmpty();
    }
   
    private Tiltak insertTiltak(UUID pvkDokId) {
        Tiltak tiltak = Tiltak.builder()
                .pvkDokumentId(pvkDokId)
                .tiltakData(new TiltakData())
                .build();
        return tiltakService.save(tiltak, null, false);

    }

}
