package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonFilter;

import java.util.List;

public interface EtterlevelseDokumentasjonRepoCustom {
    List<GenericStorage> findBy(EtterlevelseDokumentasjonFilter filter);

    List<GenericStorage> findByIrrelevans(List<String> codes);

}
