package no.nav.data.etterlevelse.behandling.domain;

import no.nav.data.common.storage.domain.GenericStorage;

import java.util.List;

public interface BehandlingRepoCustom {

    List<GenericStorage> findByRelevans(String code);

}
