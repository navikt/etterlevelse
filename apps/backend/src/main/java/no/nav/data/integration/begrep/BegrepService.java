package no.nav.data.integration.begrep;

import no.nav.data.integration.begrep.dto.BegrepResponse;

import java.util.List;
import java.util.Optional;

public interface BegrepService {

    Optional<BegrepResponse> getBegrep(String id);

    List<BegrepResponse> searchBegreper(String searchString);
}
