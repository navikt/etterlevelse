package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.common.storage.domain.GenericStorage;

import java.util.List;

public interface KravRepoCustom {

    List<GenericStorage> findByRelevans(String code);

}
