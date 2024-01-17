package no.nav.data.etterlevelse.krav.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static java.util.Comparator.comparing;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.exists;

@Repository
@RequiredArgsConstructor
public class KravRepoImpl implements KravRepoCustom {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final GenericStorageRepository<Krav> repository;

    private final EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;

    @Override
    public List<GenericStorage<Krav>> findByRelevans(String code) {
        return findBy(KravFilter.builder().relevans(List.of(code)).build());
    }

    @Override
    public List<GenericStorage<Krav>> findByVirkemiddelIder(String virkemiddelId){
        var query = "select id from generic_storage where type = 'Krav' and data->'virkemiddelIder' ??| array[ :virkemiddelId ]";
        var par = new MapSqlParameterSource();

        par.addValue("virkemiddelId", List.of(virkemiddelId));

        List<GenericStorage<Krav>> kravList = fetch(jdbcTemplate.queryForList(query, par));
        return kravList;
    }

    @Override
    public List<GenericStorage<Krav>> findByLov(String lov) {
        return findBy(KravFilter.builder().lov(lov).build());
    }

    @Override
    public List<GenericStorage<Krav>> findBy(KravFilter filter) {
        var query = "select id from generic_storage krav where type = 'Krav' ";
        var par = new MapSqlParameterSource();

        List<String> kravIdSafeList = new ArrayList<>();
        if (filter.getNummer() != null) {
            query += " and data -> 'kravNummer' = to_jsonb(:kravNummer) ";
            par.addValue("kravNummer", filter.getNummer());
        }

        if (filter.getEtterlevelseDokumentasjonId() != null ) {
            kravIdSafeList.addAll(convert(etterlevelseDokumentasjonRepo.findKravIdsForEtterlevelseDokumentasjon(filter.getEtterlevelseDokumentasjonId()), KravId::kravId));
            if (!filter.isEtterlevelseDokumentasjonIrrevantKrav()) {
                query += """
                        and (
                         exists(select 1
                                   from generic_storage ettlev
                                   where ettlev.data ->> 'kravNummer' = krav.data ->> 'kravNummer'
                                     and ettlev.data ->> 'kravVersjon' = krav.data ->> 'kravVersjon'
                                     and type = 'Etterlevelse'
                                     and data ->> 'etterlevelseDokumentasjonId' = :etterlevelseDokumentasjonId
                                ) 
                        or jsonb_array_length(data -> 'relevansFor') = 0
                        or jsonb_array_length((data -> 'relevansFor') - array(select jsonb_array_elements_text(data -> 'irrelevansFor') 
                            from generic_storage where data ->> 'id' = :etterlevelseDokumentasjonId
                            and type = 'EtterlevelseDokumentasjon')) > 0
                        )
                        """;
                par.addValue("etterlevelseDokumentasjonId", filter.getEtterlevelseDokumentasjonId());
            } else {
                query += """
                        and data -> 'relevansFor' ??| array(
                         select jsonb_array_elements_text(data -> 'irrelevansFor')
                          from generic_storage
                          where data ->> 'id' = :etterlevelseDokumentasjonId
                            and type = 'EtterlevelseDokumentasjon')
                        """;
                par.addValue("etterlevelseDokumentasjonId", filter.getEtterlevelseDokumentasjonId());
            }
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
                                  where table_name = 'Krav'
                                    and user_id like :user_id
                                    and exists(select 1 from generic_storage where id = cast(table_id as uuid))
                                  order by table_id, time desc
                              ) sub
                         order by time desc
                         limit :limit
                    )
                    """;
            par.addValue("limit", filter.getSistRedigert())
                    .addValue("user_id", SecurityUtils.getCurrentIdent() + "%");
        }

        List<GenericStorage<Krav>> kravList = fetch(jdbcTemplate.queryForList(query, par));
        List<GenericStorage<Krav>> filtered = StreamUtils.filter(kravList, krav -> filterStateAndStatus(kravList, krav, filter, kravIdSafeList));
        sort(filter, filtered);
        return filtered;
    }

    private void sort(KravFilter filter, List<GenericStorage<Krav>> filtered) {
        if (filter.getSistRedigert() != null) {
            Comparator<GenericStorage<Krav>> comparator = comparing(gs -> gs.getDomainObjectData().getChangeStamp().getLastModifiedDate());
            filtered.sort(comparator.reversed());
        }
    }

    private List<GenericStorage<Krav>> fetch(List<Map<String, Object>> resp) {
        return repository.findAllById(convert(resp, i -> (UUID) i.values().iterator().next()));
    }

    /**
     * true = keep
     */
    private boolean filterStateAndStatus(List<GenericStorage<Krav>> all, GenericStorage<Krav> test, KravFilter filter, List<String> kravIdSafeList) {
        Krav krav = test.getDomainObjectData();

        if (krav.getStatus() == KravStatus.UTKAST && !SecurityUtils.isKravEier()) {
            return false;
        }

        if (kravIdSafeList.contains(krav.kravId())) {
            return true;
        }

        // Filtrering for krav relevant for etterlevelseDokumentasjon
        if (filter.getEtterlevelseDokumentasjonId() != null) {
            var succeeded = exists(all, k2 -> k2.getDomainObjectData().supersedes(krav));
            return !succeeded && krav.getStatus().kanEtterleves();
        }

        if (filter.isGjeldendeKrav()) {
            return !exists(all, k2 -> k2.getDomainObjectData().supersedes(krav));
        }

        return true;
    }
}
