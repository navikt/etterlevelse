package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;

import java.util.List;

public interface KravRepoCustom {

    List<GenericStorage> findByRelevans(String code);

    List<GenericStorage> findBy(KravFilter filter);

    List<GenericStorage> findByLov(String lov);

}
