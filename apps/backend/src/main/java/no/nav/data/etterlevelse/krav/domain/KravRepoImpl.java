package no.nav.data.etterlevelse.krav.domain;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

import static java.util.Comparator.comparing;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.exists;

@Repository
@RequiredArgsConstructor
public class KravRepoImpl implements KravRepoCustom {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final EntityManager entityManager;
    private final EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;

    @Override
    public List<Krav> findByRelevans(String code) {
        return findBy(KravFilter.builder().relevans(List.of(code)).build());
    }

    @Override
    public List<Krav> findByVirkemiddelIder(String virkemiddelId){
        var query = "select id from krav where data -> 'virkemiddelIder' ??| array[ :virkemiddelId ]";
        var par = new MapSqlParameterSource();

        par.addValue("virkemiddelId", List.of(virkemiddelId));

        List<Krav> kravList = fetch(jdbcTemplate.queryForList(query, par));
        return kravList;
    }

    @Override
    public List<Krav> findByLov(String lov) {
        return findBy(KravFilter.builder().lov(lov).build());
    }

    @Override
    public List<Krav> findBy(KravFilter filter) {
        var query = "select id from krav k where true ";
        var par = new MapSqlParameterSource();
        List<String> kravIdSafeList = new ArrayList<>();

        if (filter.getNummer() != null) {
            query += " and krav_nummer = :kravNummer ";
            par.addValue("kravNummer", filter.getNummer());
        }

        if (filter.getEtterlevelseDokumentasjonId() != null ) {
            kravIdSafeList.addAll(convert(etterlevelseDokumentasjonRepo.findKravIdsForEtterlevelseDokumentasjon(filter.getEtterlevelseDokumentasjonId()), KravId::kravId));
            if (!filter.isEtterlevelseDokumentasjonIrrevantKrav()) {
                query += """
                        and (
                          exists(select 1
                                 from etterlevelse ettlev
                                 where ettlev.krav_nummer = k.krav_nummer
                                   and ettlev.krav_versjon = k.krav_versjon
                                   and ettlev.etterlevelse_dokumentasjon_id = :etterlevelseDokumentasjonId
                          ) 
                          or jsonb_array_length(data -> 'relevansFor') = 0
                          or jsonb_array_length((data -> 'relevansFor') - array(
                            select jsonb_array_elements_text(data -> 'irrelevansFor') 
                            from etterlevelse_dokumentasjon where id = :etterlevelseDokumentasjonId)
                            ) > 0
                        )
                        """;
            } else {
                query += """
                        and data -> 'relevansFor' ??| array(
                         select jsonb_array_elements_text(data -> 'irrelevansFor')
                         from etterlevelse_dokumentasjon
                         where id = :etterlevelseDokumentasjonId
                        )
                        """;
            }
            par.addValue("etterlevelseDokumentasjonId", filter.getEtterlevelseDokumentasjonId());
        }

        if (filter.getUnderavdeling() != null) {
            query += " and data ->> 'underavdeling' = :underavdeling ";
            par.addValue("underavdeling", filter.getUnderavdeling());
        }
        if (!filter.getStatus().isEmpty()) {
            query += "and data ->> 'status' in (:status)";
            par.addValue("status", filter.getStatus());
        }
        if (!filter.getRelevans().isEmpty()) {
            query += " and data -> 'relevansFor' ??| array[ :relevans ] ";
            par.addValue("relevans", filter.getRelevans());
        }
        if (!filter.getLover().isEmpty()) {
            var loverQuery = new ArrayList<String>();
            for (int i = 0, loverSize = filter.getLover().size(); i < loverSize; i++) {
                loverQuery.add(" data #> '{regelverk}' @> :lov_%d::jsonb ".formatted(i));
                par.addValue("lov_" + i, String.format("[{\"lov\": \"%s\"}]", filter.getLover().get(i)));
            }
            query += " and ( " + String.join(" or ", loverQuery) + " ) ";
        }
        if (filter.getLov() != null) {
            query += " and data #> '{regelverk}' @> :lov::jsonb ";
            par.addValue("lov", String.format("[{\"lov\": \"%s\"}]", filter.getLov()));
        }
        if (filter.isGjeldendeKrav()) {
            query += " and data ->> 'status' in (:gjeldendeStatuser) ";
            par.addValue("gjeldendeStatuser", convert(KravStatus.gjeldende(), Enum::name));
        }
        if (filter.getSistRedigert() != null) {
            query += """
                     and cast(id as text) in (
                       select table_id
                       from (
                           select distinct on (table_id) table_id, time
                           from audit_version
                           where table_name in ('Krav', 'KRAV')
                             and user_id like :user_id
                             and exists (select 1 from krav where id = cast(table_id as uuid))
                           order by time desc
                       ) sub
                       order by time desc
                       limit :limit
                    ) 
                    """;
            par.addValue("limit", filter.getSistRedigert())
                    .addValue("user_id", SecurityUtils.getCurrentIdent() + "%");
        }

        List<Krav> kravList = fetch(jdbcTemplate.queryForList(query, par));
        List<Krav> filtered = StreamUtils.filter(kravList, krav -> filterStateAndStatus(kravList, krav, filter, kravIdSafeList));
        sort(filter, filtered);
        return filtered;
    }

    private void sort(KravFilter filter, List<Krav> filtered) {
        if (filter.getSistRedigert() != null) {
            Comparator<Krav> comparator = comparing(k -> k.getLastModifiedDate());
            filtered.sort(comparator.reversed());
        }
    }

    private List<Krav> fetch(List<Map<String, Object>> resp) {
        List<UUID> ids = convert(resp, i -> (UUID) i.values().iterator().next());
        if (ids.isEmpty()) {
            return List.of();
        }

        return entityManager.createQuery("select k from Krav k where k.id in :ids", Krav.class)
                .setParameter("ids", ids)
                .getResultList();
    }

    /**
     * true = keep
     */
    private boolean filterStateAndStatus(List<Krav> all, Krav krav, KravFilter filter, List<String> kravIdSafeList) {
        if (kravIdSafeList.contains(krav.kravId())) {
            return true;
        }

        // Filtrering for krav relevant for etterlevelseDokumentasjon
        if (filter.getEtterlevelseDokumentasjonId() != null) {
            var succeeded = exists(all, k2 -> k2.supersedes(krav));
            return !succeeded && krav.getStatus().kanEtterleves();
        }

        if (filter.isGjeldendeKrav()) {
            return !exists(all, k2 -> k2.supersedes(krav));
        }

        return true;
    }
}
