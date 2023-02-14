package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.behandling.dto.BehandlingFilter;

import java.util.List;

public interface EtterlevelseDokumentasjonRepoCustom {
    List<GenericStorage> findBy(BehandlingFilter filter);

    List<GenericStorage> findByIrrelevans(List<String> codes);

}
