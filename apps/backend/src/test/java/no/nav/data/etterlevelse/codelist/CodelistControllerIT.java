package no.nav.data.etterlevelse.codelist;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.AllCodelistResponse;
import no.nav.data.etterlevelse.codelist.dto.CodelistRequest;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static no.nav.data.etterlevelse.codelist.CodelistUtils.createCodelist;
import static no.nav.data.etterlevelse.codelist.CodelistUtils.createCodelistRequest;
import static no.nav.data.etterlevelse.codelist.CodelistUtils.createNrOfCodelistRequests;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CodelistControllerIT extends IntegrationTestBase {

    private static final ParameterizedTypeReference<List<CodelistResponse>> CODELIST_LIST_RESP = new ParameterizedTypeReference<>() {
    };

    @Autowired
    private CodelistRepository repository;

    @Autowired
    private CodelistService service;


    @BeforeEach
    void setUp() {
        CodelistCache.set(createCodelist(ListName.RELEVANS, "TEST_CODE"));
    }

    @AfterEach
    void cleanUp() {
        repository.deleteAll();
        service.refreshCache();
    }

    @Nested
    class Get {

        @Test
        void findAll_shouldReturnAllCodelists() {
            ResponseEntity<AllCodelistResponse> responseEntity = restTemplate.exchange(
                    "/codelist", HttpMethod.GET, HttpEntity.EMPTY, AllCodelistResponse.class);

            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(responseEntity.getBody()).isNotNull();
            assertThat(responseEntity.getBody().getCodelist()).hasSize(ListName.values().length);

            Arrays.stream(ListName.values())
                    .forEach(listName -> assertThat(responseEntity.getBody().getCodelist()
                            .get(listName)).containsAll(CodelistService.getCodelistResponseList(listName)));
        }

        @Test
        void getCodelistByListName() {
            ResponseEntity<List<CodelistResponse>> responseEntity = restTemplate.exchange(
                    "/codelist/RELEVANS", HttpMethod.GET, HttpEntity.EMPTY, CODELIST_LIST_RESP);

            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(responseEntity.getBody()).isNotNull();
            assertThat(responseEntity.getBody()).isEqualTo(CodelistService.getCodelistResponseList(ListName.RELEVANS));
        }

        @Test
        void getByListNameAndCode() {
            ResponseEntity<CodelistResponse> responseEntity = restTemplate.exchange(
                    "/codelist/RELEVANS/TEST_CODE", HttpMethod.GET, HttpEntity.EMPTY, CodelistResponse.class);

            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(responseEntity.getBody()).isNotNull();
            assertThat(responseEntity.getBody().getDescription()).isEqualTo(CodelistService.getCodelist(ListName.RELEVANS, "TEST_CODE").getDescription());
        }

    }

    @Nested
    class Save {

        @Test
        void shouldSaveNewCodelists() {
            List<CodelistRequest> requests = List.of(createCodelistRequest(ListName.RELEVANS.name(), "SaveCode", "SaveShortName", "SaveDescription"));
            assertFalse(CodelistCache.contains(ListName.RELEVANS, "SaveCode"));

            ResponseEntity<List<CodelistResponse>> responseEntity = restTemplate.exchange(
                    "/codelist", HttpMethod.POST, new HttpEntity<>(requests), CODELIST_LIST_RESP);

            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            CodelistResponse codelist = responseEntity.getBody().get(0);
            assertThat(codelist.getList()).isEqualTo(ListName.RELEVANS);
            assertThat(codelist.getCode()).isEqualTo("SAVECODE");
            assertThat(codelist.getShortName()).isEqualTo("SaveShortName");
            assertThat(codelist.getDescription()).isEqualTo("SaveDescription");

            assertTrue(CodelistCache.contains(ListName.RELEVANS, "SAVECODE"));
            Codelist savedCodelist = CodelistService.getCodelist(ListName.RELEVANS, "SAVECODE");
            assertThat(savedCodelist.getCode()).isEqualTo("SAVECODE");
            assertThat(savedCodelist.getShortName()).isEqualTo("SaveShortName");
            assertThat(savedCodelist.getDescription()).isEqualTo("SaveDescription");
        }

        @Test
        void shouldNotSaveOrProcessAnEmptyRequest() {
            List<CodelistRequest> requests = Collections.emptyList();
            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    "/codelist", HttpMethod.POST, new HttpEntity<>(requests), String.class);

            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(responseEntity.getBody()).isEqualTo(Collections.EMPTY_LIST.toString());
        }

        @Test
        void shouldSaveManyCodelist() {
            service.refreshCache();
            List<CodelistRequest> requests = createNrOfCodelistRequests(4);

            ResponseEntity<List<CodelistResponse>> responseEntity = restTemplate.exchange(
                    "/codelist", HttpMethod.POST, new HttpEntity<>(requests), CODELIST_LIST_RESP);

            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(CodelistService.getCodelist(ListName.RELEVANS).size()).isEqualTo(4);
        }

        @Test
        void shouldInvalidateWrongListname() {
            List<CodelistRequest> requests = List.of(createCodelistRequest("PROVENAANCE"));

            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    "/codelist", HttpMethod.POST, new HttpEntity<>(requests), String.class);

            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(responseEntity.getBody()).contains("PROVENAANCE was invalid for type ListName");
        }

//        @ParameterizedTest
//        @ValueSource(strings = {})
//        void shouldInvalidateCreatingImmutableCodelist(String testValue) {
//            List<CodelistRequest> requests = List.of(createCodelistRequest(testValue));
//
//            ResponseEntity<String> responseEntity = restTemplate.exchange("/codelist", HttpMethod.POST, new HttpEntity<>(requests), String.class);
//
//            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
//            assertThat(responseEntity.getBody()).contains(String.format(ERROR_IMMUTABLE_CODELIST, testValue));
//        }
    }

    @Nested
    class Update {

        @Test
        void shouldUpdateOneCodelist() {
            saveCodelist(createCodelist(ListName.RELEVANS, "CODE", "SavedShortName", "SavedDescription"));
            assertThat(CodelistService.getCodelist(ListName.RELEVANS, "CODE").getShortName()).isEqualTo("SavedShortName");
            assertThat(CodelistService.getCodelist(ListName.RELEVANS, "CODE").getDescription()).isEqualTo("SavedDescription");

            List<CodelistRequest> updatedCodelists = List.of(
                    createCodelistRequest("RELEVANS", "CODE", "UpdatedShortName", "UpdatedDescription"));

            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    "/codelist", HttpMethod.PUT, new HttpEntity<>(updatedCodelists), String.class);

            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(CodelistService.getCodelist(ListName.RELEVANS, "CODE").getShortName()).isEqualTo("UpdatedShortName");
            assertThat(CodelistService.getCodelist(ListName.RELEVANS, "CODE").getDescription()).isEqualTo("UpdatedDescription");
        }

        @Test
        void shouldUpdateManyCodelists() {
            service.refreshCache();
            List<CodelistRequest> requests = createNrOfCodelistRequests(4);
            restTemplate.exchange(
                    "/codelist", HttpMethod.POST, new HttpEntity<>(requests), new ParameterizedTypeReference<List<Codelist>>() {
                    });

            requests.forEach(request -> {
                request.setShortName("UpdatedShortName");
                request.setDescription("UpdatedDescription");
            });

            ResponseEntity<List<Codelist>> responseEntity = restTemplate.exchange(
                    "/codelist", HttpMethod.PUT, new HttpEntity<>(requests), new ParameterizedTypeReference<>() {
                    });

            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);

            assertThat(CodelistService.getCodelist(ListName.RELEVANS).size()).isEqualTo(4);
            List<Codelist> list = CodelistService.getCodelist(ListName.RELEVANS);
            list.forEach(cod -> {
                assertThat(cod.getShortName()).isEqualTo("UpdatedShortName");
                assertThat(cod.getDescription()).isEqualTo("UpdatedDescription");
            });
        }
    }

    @Nested
    class Delete {

        @Test
        void shouldDeleteCodelist() {
            saveCodelist(createCodelist(ListName.RELEVANS, "DELETE_CODE"));
            assertTrue(repository.findByListAndCode(ListName.RELEVANS, "DELETE_CODE").isPresent());

            ResponseEntity<String> responseEntity = restTemplate.exchange("/codelist/RELEVANS/DELETE_CODE", HttpMethod.DELETE, HttpEntity.EMPTY, String.class);

            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertFalse(repository.findByListAndCode(ListName.RELEVANS, "DELETE_CODE").isPresent());
        }

//        @ParameterizedTest
//        @ValueSource(strings = {})
//        void shouldInvalidateDeletingImmutable(String input) {
//            saveCodelist(createCodelist(ListName.valueOf(input), "DELETE"));
//            String url = String.format("/codelist/%s/DELETE", input);
//            ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.DELETE, HttpEntity.EMPTY, String.class);
//
//            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
//            assertThat(responseEntity.getBody()).contains(String.format(ERROR_IMMUTABLE_CODELIST, input));
//        }

        @Test
        void shouldThrowCodelistNotErasableException_whenCodelistToBeDeletedIsStillInUse() {
            saveCodelist(createCodelist(ListName.RELEVANS, "DELETE_CODE"));
            kravStorageService.save(Krav.builder().relevansFor(List.of("DELETE_CODE")).status(KravStatus.AKTIV).build());
            assertTrue(repository.findByListAndCode(ListName.RELEVANS, "DELETE_CODE").isPresent());

            ResponseEntity<String> responseEntity = restTemplate.exchange("/codelist/RELEVANS/DELETE_CODE", HttpMethod.DELETE, HttpEntity.EMPTY, String.class);

            assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(responseEntity.getBody()).contains("The code DELETE_CODE in list RELEVANS cannot be erased.");
            assertTrue(repository.findByListAndCode(ListName.RELEVANS, "DELETE_CODE").isPresent());
        }

    }

    private void saveCodelist(Codelist codelist) {
        CodelistCache.set(codelist);
        repository.save(codelist);
    }


}
