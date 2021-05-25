package no.nav.data.etterlevelse.behandling.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.behandling.dto.BehandlingFilter;

import java.util.List;

public interface BehandlingRepoCustom {

    List<GenericStorage> findByRelevans(String code);

    List<GenericStorage> findByRelevans(List<String> codes);

    List<GenericStorage> findBy(BehandlingFilter filter);

}
