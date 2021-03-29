package no.nav.data.integration.begrep;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.integration.begrep.dto.BegrepResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static java.util.Comparator.comparing;
import static no.nav.data.common.utils.StartsWithComparator.startsWith;

@Slf4j
@RestController
@RequestMapping("/begrep")
@RequiredArgsConstructor
@Tag(name = "Begrep", description = "REST API for Begrep")
public class BegrepController {

    private final BegrepService begrepService;

    @Operation(summary = "Get Begrep")
    @ApiResponse(description = "Begrep fetched")
    @GetMapping("/{id}")
    public ResponseEntity<BegrepResponse> findForId(@PathVariable String id) {
        log.info("Received request for Begrep with the id={}", id);
        var begrepResponse = begrepService.getBegrep(id);
        if (begrepResponse.isEmpty()) {
            log.info("Cannot find the Begrep with id={}", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        log.info("Returned Begrep");
        return new ResponseEntity<>(begrepResponse.get(), HttpStatus.OK);
    }

    @Operation(summary = "Search Begreps")
    @ApiResponse(description = "Begreps fetched")
    @GetMapping("/search/{searchString}")
    public ResponseEntity<RestResponsePage<BegrepResponse>> searchBegrepByName(@PathVariable String searchString) {
        log.info("Received request for Begrep with name/description like {}", searchString);
        if (searchString.length() < 3) {
            throw new ValidationException("Search begrep must be at least 3 characters");
        }
        var begreper = begrepService.searchBegreper(searchString);
        begreper.sort(comparing(t -> t.getNavn() + t.getBeskrivelse(), startsWith(searchString)));
        log.info("Returned {} begreps", begreper.size());
        return new ResponseEntity<>(new RestResponsePage<>(begreper), HttpStatus.OK);
    }

    public static final class BegrepPage extends RestResponsePage<BegrepResponse> {

    }

}
