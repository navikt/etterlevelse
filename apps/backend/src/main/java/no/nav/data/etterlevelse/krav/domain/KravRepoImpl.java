package no.nav.data.etterlevelse.krav.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.etterlevelse.behandling.BehandlingService;
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
    private final BehandlingService behandlingService;

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

        List<KravId> kravIdSafeList = new ArrayList<>();
        if (!filter.getRelevans().isEmpty()) {
            query += " and data -> 'relevansFor' ??| array[ :relevans ] ";
            par.addValue("relevans", filter.getRelevans());
        }
        if (filter.getNummer() != null) {
            query += " and data -> 'kravNummer' = to_jsonb(:kravNummer) ";
            par.addValue("kravNummer", filter.getNummer());
        }
        if (filter.getBehandlingId() != null) {
            kravIdSafeList.addAll(jdbcTemplate.queryForList("""
                    select 
                     data ->> 'kravVersjon' as kravVersjon, data ->> 'kravVersjon' as kravVersjon
                     from generic_storage
                     where type = 'Etterlevelse'
                     and data ->> 'behandlingId' = :behandlingId
                    """, new MapSqlParameterSource("behandlingId", filter.getBehandlingId()), KravId.class));
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

        List<GenericStorage> kravList = fetch(jdbcTemplate.queryForList(query, par));
        if (!kravIdSafeList.isEmpty() && filter.getBehandlingId() != null) {
            // If query for behandling, remove old versions of krav that fit it, unless they are in use by this behandling
            kravList.removeIf(krav -> exists(kravList, k2 -> k2.toKrav().succeeds(krav.toKrav())) && !exists(kravIdSafeList, kid -> kid.kravId().equals(krav.toKrav().kravId())));
        }
        return kravList;
    }

    private List<GenericStorage> fetch(List<Map<String, Object>> resp) {
        return repository.findAllById(convert(resp, i -> (UUID) i.values().iterator().next()));
    }
}
