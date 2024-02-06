package no.nav.data.etterlevelse.codelist;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodeUsageResponse;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodelistUsageResponse;
import no.nav.data.etterlevelse.codelist.codeusage.dto.ReplaceCodelistRequest;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistRequest;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import static no.nav.data.etterlevelse.codelist.CodelistUtils.createCodelistRequest;
import static org.assertj.core.api.Assertions.assertThat;

public class CodeUsageControllerIT extends IntegrationTestBase {

    @Autowired
    private CodelistService codelistService;
    @Autowired
    private CodelistRepository codelistRepository;

    @BeforeEach
    void setUp() {
        codelistRepository.deleteAll();
        codelistService.refreshCache();
        createTestData();
    }

    @Nested
    class findAllCodeUsageOfListname {

        @ParameterizedTest
        @CsvSource({
                "RELEVANS,2",
                "AVDELING,1",
                "UNDERAVDELING,1",
                "LOV,1",
                "TEMA,1"
        })
        void shouldFindCodeUsage(String list, int expectedCodesInUse) {
            ResponseEntity<CodelistUsageResponse> response = restTemplate
                    .exchange(String.format("/codelist/usage/find/%s", list), HttpMethod.GET, HttpEntity.EMPTY, CodelistUsageResponse.class);

            assertThat(
                    Objects.requireNonNull(response.getBody()).getCodesInUse().stream().filter(CodeUsageResponse::isInUse).count()
            ).isEqualTo(expectedCodesInUse);
        }
    }

    @Nested
    class findCodeUsageByListNameAndCode {

        @ParameterizedTest
        @CsvSource({
                "RELEVANS,REL1,1",
                "RELEVANS,REL2,0",
                "AVDELING,AVD1,1",
                "UNDERAVDELING,UNDAVD1,1",
                "LOV,ARKIV,1"
        })
        void findKrav(String list, String code, int expectedCount) {
            var response = getForListAndCode(list, code);

            assertThat(countKrav(response)).isEqualTo(expectedCount);
        }

        @ParameterizedTest
        @CsvSource({"RELEVANS,NOT_FOUND"})
        void shouldNotFindCodeUsage(String list, String code) {
            assertThat(HttpStatus.BAD_REQUEST).isEqualTo(getForListAndCode(list, code).getStatusCode());
        }

        private ResponseEntity<CodeUsageResponse> getForListAndCode(String list, String code) {
            return restTemplate.getForEntity("/codelist/usage/find/{list}/{code}", CodeUsageResponse.class, list, code);
        }
    }

    @Nested
    class replaceCodelist {

        @ParameterizedTest
        @CsvSource({
                "RELEVANS,REL1,1,0",
                "AVDELING,AVD1,1,0",
                "UNDERAVDELING,UNDAVD1,1,1",
                "LOV,ARKIV,1,0",
                "TEMA,ARKIV_TEMA,0,1",
        })
        void replaceCodelistUsage(String list, String code, int krav, int codelist) {
            String newCode = "REPLACECODE";
            codelistService.save(List.of(createCodelistRequest(list, newCode)));

            var noactions = replaceCode(list, newCode, code);
            assertThat(noactions.isInUse()).isFalse();

            var replace = replaceCode(list, code, newCode);
            assertThat(replace.isInUse()).isTrue();
            assertThat(replace.getKrav()).hasSize(krav);
            assertThat(replace.getCodelist()).hasSize(codelist);

            var replaceSecondRun = replaceCode(list, code, newCode);
            assertThat(replaceSecondRun.isInUse()).isFalse();
        }

        private CodeUsageResponse replaceCode(String list, String code, String newCode) {
            ResponseEntity<CodeUsageResponse> response = restTemplate
                    .postForEntity("/codelist/usage/replace", new ReplaceCodelistRequest(list, code, newCode), CodeUsageResponse.class);
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            return response.getBody();
        }
    }

    private void createTestData() {
        createCodelistsByRequests();
        kravStorageService.save(Krav.builder().avdeling("AVD1").status(KravStatus.AKTIV).relevansFor(List.of("REL1")).build());
        kravStorageService.save(Krav.builder().underavdeling("UNDAVD1").status(KravStatus.AKTIV).relevansFor(List.of("REL3")).regelverk(List.of(Regelverk.builder().lov("ARKIV").build())).build());
    }

    private void createCodelistsByRequests() {
        List<CodelistRequest> requests = List.of(
                createCodelistRequest(ListName.RELEVANS.name(), "REL1"),
                createCodelistRequest(ListName.RELEVANS.name(), "REL2"),
                createCodelistRequest(ListName.RELEVANS.name(), "REL3"),
                createCodelistRequest(ListName.AVDELING.name(), "AVD1"),
                createCodelistRequest(ListName.UNDERAVDELING.name(), "UNDAVD1"),
                createCodelistRequest(ListName.TEMA.name(), "ARKIV_TEMA"),
                createCodelistRequest(ListName.LOV.name(), "ARKIV"),
                createCodelistRequest(ListName.LOV.name(), "PERSON", Map.of("tema", "ARKIV_TEMA", "underavdeling", "UNDAVD1"))
        );
        codelistService.save(requests);
    }

    private int countKrav(ResponseEntity<CodeUsageResponse> response) {
        return Objects.requireNonNull(response.getBody()).getKrav().size();
    }


}