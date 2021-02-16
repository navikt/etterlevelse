package no.nav.data.etterlevelse.krav.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.behandling.domain.BehandlingRepo;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.exists;

@Repository
@RequiredArgsConstructor
public class KravRepoImpl implements KravRepoCustom {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final GenericStorageRepository repository;
    private final BehandlingRepo behandlingRepo;

    @Override
    public List<GenericStorage> findByRelevans(String code) {
        return findBy(KravFilter.builder().relevans(List.of(code)).build());
    }

    @Override
    public List<GenericStorage> findByLov(String lov) {
        return findBy(KravFilter.builder().lov(lov).build());
    }

    @Override
    public List<GenericStorage> findBy(KravFilter filter) {
        var query = "select id from generic_storage krav where type = 'Krav' ";
        var par = new MapSqlParameterSource();

        List<String> kravIdSafeList = new ArrayList<>();
        if (!filter.getRelevans().isEmpty()) {
            query += " and data -> 'relevansFor' ??| array[ :relevans ] ";
            par.addValue("relevans", filter.getRelevans());
        }
        if (filter.getNummer() != null) {
            query += " and data -> 'kravNummer' = to_jsonb(:kravNummer) ";
            par.addValue("kravNummer", filter.getNummer());
        }
        if (filter.getBehandlingId() != null) {
            kravIdSafeList.addAll(convert(behandlingRepo.findKravIdsForBehandling(filter.getBehandlingId()), KravId::kravId));
            query += """
                    and ( 
                     exists(select 1
                               from generic_storage ettlev
                               where ettlev.data ->> 'kravNummer' = krav.data ->> 'kravNummer'
                                 and ettlev.data ->> 'kravVersjon' = krav.data ->> 'kravVersjon'
                                 and type = 'Etterlevelse'
                                 and data ->> 'behandlingId' = :behandlingId
                            ) 
                    or data -> 'relevansFor' ??| array(
                     select jsonb_array_elements_text(data -> 'relevansFor')
                      from generic_storage
                      where data ->> 'behandlingId' = :behandlingId
                        and type = 'BehandlingData') 
                    ) 
                    """;
            par.addValue("behandlingId", filter.getBehandlingId());
        }
        if (filter.getUnderavdeling() != null) {
            query += " and data ->> 'underavdeling' = :underavdeling ";
            par.addValue("underavdeling", filter.getUnderavdeling());
        }
        if (filter.getLov() != null) {
            query += " and data #> '{regelverk}' @> :lov::jsonb ";
            par.addValue("lov", String.format("[{\"lov\": \"%s\"}]", filter.getLov()));
        }
        if (filter.isGjeldendeKrav()) {
            query += " and data ->> 'status' in :gjeldendeStatuser ";
            par.addValue("gjeldendeStatuser", KravStatus.gjeldende());
        }

        List<GenericStorage> kravList = fetch(jdbcTemplate.queryForList(query, par));
        return StreamUtils.filter(kravList, krav -> filterStateAndStatus(kravList, krav, filter, kravIdSafeList));
    }

    private List<GenericStorage> fetch(List<Map<String, Object>> resp) {
        return repository.findAllById(convert(resp, i -> (UUID) i.values().iterator().next()));
    }

    /**
     * true = keep
     */
    private boolean filterStateAndStatus(List<GenericStorage> all, GenericStorage test, KravFilter filter, List<String> kravIdSafeList) {
        Krav krav = test.toKrav();

        if (krav.getStatus() == KravStatus.UTKAST && !SecurityUtils.isKravEier()) {
            return false;
        }

        if (kravIdSafeList.contains(krav.kravId())) {
            return true;
        }

        // Filtrering for krav relevant for behandling
        if (filter.getBehandlingId() != null) {
            var succeeded = exists(all, k2 -> k2.toKrav().supersedes(krav));
            return !succeeded && krav.getStatus().kanEtterleves();
        }

        if (filter.isGjeldendeKrav()) {
            return exists(all, k2 -> k2.toKrav().supersedes(krav));
        }

        return true;
    }
}
