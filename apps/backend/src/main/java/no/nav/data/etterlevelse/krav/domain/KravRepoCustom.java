package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;

import java.util.List;

public interface KravRepoCustom {

    List<GenericStorage<Krav>> findByRelevans(String code);

    List<GenericStorage<Krav>> findByVirkemiddelIder(String virkemiddelId);

    List<GenericStorage<Krav>> findBy(KravFilter filter);

    List<GenericStorage<Krav>> findByLov(String lov);

}
