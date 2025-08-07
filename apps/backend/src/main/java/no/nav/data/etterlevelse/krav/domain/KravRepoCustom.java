package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;

import java.util.List;

public interface KravRepoCustom {

    List<Krav> findByRelevans(String code);

    List<Krav> findBy(KravFilter filter);

    List<Krav> findByLov(String lov);

}
