package no.nav.data.pvk.risikoscenario;

import no.nav.data.IntegrationTestBase;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioData;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioRequest;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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
        
        // Get by pvkDocId should return no risikoscenario for unknown kravnummer...
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
        PvkDokument pvkDokument = pvkDokumentService.save(generatePvkDokument(UUID.randomUUID()), false);
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
        PvkDokument pvkDokument = pvkDokumentService.save(generatePvkDokument(UUID.randomUUID()), false);
        Krav krav = kravStorageService.save(Krav.builder().navn("Krav 50").kravNummer(50).kravVersjon(1).status(KravStatus.AKTIV).build());
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

    /* FIXME: Make tests for the rest
    
    @Test
    void testUpdate() {
        risikoscenario risikoscenario = insertrisikoscenario();
        risikoscenarioRequest request = risikoscenarioRequest.builder()
                .pvkDokumentId(risikoscenario.getPvkDokumentId().toString())
                .navn("BoinkBoink")
                .build();

        // Update should fail for unknown risikoscenario...
        ResponseEntity<risikoscenarioResponse> respEnt = restTemplate.exchange("/risikoscenario/{id}", HttpMethod.PUT, new HttpEntity<>(request), risikoscenarioResponse.class, request.getId());
        assertThat(respEnt.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        
        // Test update...
        request.setId(risikoscenario.getId().toString());
        respEnt = restTemplate.exchange("/risikoscenario/{id}", HttpMethod.PUT, new HttpEntity<>(request), risikoscenarioResponse.class, request.getId());
        risikoscenario = risikoscenarioService.get(risikoscenario.getId());
        assertThat(risikoscenario.getrisikoscenarioData().getNavn()).isEqualTo("BoinkBoink");
    }

    @Test
    void testDelete() {
        PvkDokument pvkDokument = pvkDokumentService.save(generatePvkDokument(UUID.randomUUID()), false);
        risikoscenario risikoscenario = insertrisikoscenario();

        // Delete should fail if risikoscenario has a relation to one or more risikoscenarioer...
        Risikoscenario risikoscenario = risikoscenarioService.save(generateRisikoscenario(pvkDokument.getId()), false);
        RisikoscenariorisikoscenarioRequest relReq = RisikoscenariorisikoscenarioRequest.builder()
                .risikoscenarioId(risikoscenario.getId().toString())
                .risikoscenarioIds(List.of(risikoscenario.getId().toString()))
                .build();
        restTemplate.exchange("/risikoscenario/update/addRelevanterisikoscenario", HttpMethod.PUT, new HttpEntity<>(relReq), RisikoscenarioResponse.class);
        ResponseEntity<risikoscenarioResponse> resp = restTemplate.exchange("/risikoscenario/{id}", HttpMethod.DELETE, null, risikoscenarioResponse.class, risikoscenario.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(risikoscenarioRepo.count()).isEqualTo(1);
        restTemplate.exchange("/risikoscenario/{id}/removerisikoscenario/{risikoscenarioId}", HttpMethod.PUT, null, RisikoscenarioResponse.class, risikoscenario.getId().toString(), risikoscenario.getId().toString());

        // Test delete...
        resp = restTemplate.exchange("/risikoscenario/{id}", HttpMethod.DELETE, null, risikoscenarioResponse.class, risikoscenario.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(risikoscenarioRepo.count()).isEqualTo(0);
    }

        //*/

    private Risikoscenario insertRisikoscenario() {
        PvkDokument pvkDokument = pvkDokumentService.save(generatePvkDokument(UUID.randomUUID()), false);
        Krav krav = kravStorageService.save(Krav.builder().navn("Krav 50").kravNummer(50).kravVersjon(1).status(KravStatus.AKTIV).build());

        Risikoscenario risikoscenario = Risikoscenario.builder()
                .pvkDokumentId(pvkDokument.getId())
                .risikoscenarioData(RisikoscenarioData.builder()
                        .relevanteKravNummer(List.of(krav.getKravNummer()))
                        .build()
                )
                .build();
        return risikoscenarioService.save(risikoscenario, false);
    }


}
