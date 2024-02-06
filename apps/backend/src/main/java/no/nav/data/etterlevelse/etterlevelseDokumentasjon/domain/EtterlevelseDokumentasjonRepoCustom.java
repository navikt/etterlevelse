package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonFilter;

import java.util.List;

public interface EtterlevelseDokumentasjonRepoCustom {
    List<GenericStorage<EtterlevelseDokumentasjon>> findBy(EtterlevelseDokumentasjonFilter filter);

    List<GenericStorage<EtterlevelseDokumentasjon>> findByIrrelevans(List<String> codes);

    List<GenericStorage<EtterlevelseDokumentasjon>> getEtterlevelseDokumentasjonerForTeam(List<String> teamId);

    List<GenericStorage<EtterlevelseDokumentasjon>> findByBehandlingIds(List<String> ids);

}
