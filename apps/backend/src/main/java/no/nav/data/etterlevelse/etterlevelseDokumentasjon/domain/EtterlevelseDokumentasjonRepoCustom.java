package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonFilter;

import java.util.List;

public interface EtterlevelseDokumentasjonRepoCustom {

    List<EtterlevelseDokumentasjon> findBy(EtterlevelseDokumentasjonFilter filter);

    List<EtterlevelseDokumentasjon> findByIrrelevans(List<String> codes);

    List<EtterlevelseDokumentasjon> getEtterlevelseDokumentasjonerForTeam(List<String> teamId);

    List<EtterlevelseDokumentasjon> findByBehandlingIds(List<String> ids);

    List<EtterlevelseDokumentasjon> findByKravRelevans(List<String> kravRelevans);

}
