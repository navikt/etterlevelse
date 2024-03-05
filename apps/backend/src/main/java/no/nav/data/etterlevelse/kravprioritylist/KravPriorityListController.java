package no.nav.data.etterlevelse.kravprioritylist;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.kravprioritylist.domain.KravPriorityList;
import no.nav.data.etterlevelse.kravprioritylist.dto.KravPriorityListResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/kravprioritylist")
@Tag(name = "KravPriorityList", description = "Prioriterings rekkefølge for krav")
public class KravPriorityListController {

    private final KravPriorityListService service;
    private final CodelistService codelistService;

    @Operation(summary = "Get all krav prioritering")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<KravPriorityListResponse>> getAll(
            PageParameters pageParameters
    ) {
        log.info("Get all krav prioriteringer");
        Page<KravPriorityList> page = service.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(KravPriorityList::toResponse));
    }


    @Operation(summary = "Get krav prioritering by tema code")
    @ApiResponse(description = "ok")
    @GetMapping("/tema/{temacode}")
    public ResponseEntity<KravPriorityListResponse> getByTemaCode(@PathVariable String temacode) {
        log.info("Get krav prioritering for tema={}", temacode);
        if(temacode.length() < 3) {
            throw new ValidationException("Tema code must be more than 3 characters");
        }

        codelistService.validateListNameAndCode(ListName.TEMA.name(), temacode);

        Optional<KravPriorityListResponse> kravPriorityList = service.getByTema(temacode).map(KravPriorityList::toResponse);
        return kravPriorityList.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());

    }

    @Operation(summary = "Get krav prioritery by tema code and krav nummer")
    @ApiResponse(description = "ok")
    @GetMapping("/tema/{temacode}/{kravnummer}")
    public ResponseEntity<Integer> getByTemaCodeAndKravNummer(@PathVariable String temacode, @PathVariable Integer kravnummer) {
        log.info("Get krav prioritering for tema={}", temacode);
        if(temacode.length() < 3) {
            throw new ValidationException("Tema code must be more than 3 characters");
        }

        codelistService.validateListNameAndCode(ListName.TEMA.name(), temacode);

        Optional<KravPriorityListResponse> kravPriorityList = service.getByTema(temacode).map(KravPriorityList::toResponse);

        if(kravPriorityList.isEmpty())  {
            ResponseEntity.notFound().build();
        }

        int kravPriority = -1;

        if(kravPriorityList.isPresent() && !kravPriorityList.get().getPriorityList().isEmpty()) {
            kravPriority = kravPriorityList.get().getPriorityList().indexOf(kravnummer);
        }

        if(kravPriority < 0) {
            ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(kravPriority);
    }
}
