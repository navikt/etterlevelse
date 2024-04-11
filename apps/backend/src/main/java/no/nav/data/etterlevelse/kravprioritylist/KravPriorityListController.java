package no.nav.data.etterlevelse.kravprioritylist;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.kravprioritylist.domain.KravPriorityList;
import no.nav.data.etterlevelse.kravprioritylist.dto.KravPriorityListRequest;
import no.nav.data.etterlevelse.kravprioritylist.dto.KravPriorityListResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

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

        codelistService.validateListNameAndCode(ListName.TEMA.name(), temacode);

        Optional<KravPriorityListResponse> kravPriorityList = service.getByTema(temacode).map(KravPriorityList::toResponse);
        return kravPriorityList.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());

    }

    @Operation(summary = "Get krav prioritery by tema code and krav nummer")
    @ApiResponse(description = "ok")
    @GetMapping("/tema/{temacode}/{kravnummer}")
    public ResponseEntity<Integer> getByTemaCodeAndKravNummer(@PathVariable String temacode, @PathVariable Integer kravnummer) {
        log.info("Get krav prioritering for tema={}", temacode);

        codelistService.validateListNameAndCode(ListName.TEMA.name(), temacode);

        Optional<KravPriorityListResponse> kravPriorityList = service.getByTema(temacode).map(KravPriorityList::toResponse);

        if(kravPriorityList.isEmpty())  {
            return ResponseEntity.notFound().build();
        }

        int kravPriority = 0;

        if(!kravPriorityList.get().getPriorityList().isEmpty()) {
            kravPriority = kravPriorityList.get().getPriorityList().indexOf(kravnummer) + 1;
        }

        if(kravPriority == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(kravPriority);
    }

    @Operation(summary = "Get one krav priority list")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<KravPriorityListResponse> getById(@PathVariable UUID id) {
        log.info("Get krav priority list id={}", id);
        return ResponseEntity.ok(service.get(id).toResponse());
    }

    @Operation(summary = "Create krav prioritering")
    @ApiResponse(description = "ok")
    @PostMapping
    public ResponseEntity<KravPriorityListResponse> createKravPriorityList(@RequestBody KravPriorityListRequest request) {
        log.info("Create krav priority list");
        var kravPriorityList = service.save(request);
        return new ResponseEntity<>(kravPriorityList.toResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "Update krav prioritering")
    @ApiResponse(description = "ok")
    @PutMapping("/{id}")
    public ResponseEntity<KravPriorityListResponse> updateKravPriorityList(@PathVariable UUID id,@Valid @RequestBody KravPriorityListRequest request) {
        log.info("Update krav priority list id={}", id);

        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var kravPriorityList = service.save(request);
        return ResponseEntity.ok(kravPriorityList.toResponse());
    }

    @Operation(summary = "Delete krav prioritering")
    @ApiResponse(description = "ok")
    @DeleteMapping("/{id}")
    public ResponseEntity<KravPriorityListResponse> deleteKravPriorityList(@PathVariable UUID id) {
        log.info("Delete krav priority list id={}", id);
        var kravPriorityList = service.delete(id);
        return ResponseEntity.ok(kravPriorityList.toResponse());
    }
}
