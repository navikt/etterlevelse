package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonFilter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@Slf4j
@RequiredArgsConstructor
public class EtterlevelseDokumentasjonRepoImpl implements EtterlevelseDokumentasjonRepoCustom {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final GenericStorageRepository repository;

    @Override
    public List<GenericStorage> findByIrrelevans(List<String> codes) {
        var query = "select id from generic_storage where type = 'EtterlevelseDokumentasjon' and data -> 'irrelevansFor' ??| array[ :irrelevans ] ";
        var par = new MapSqlParameterSource();
        par.addValue("irrelevans", codes);
        return fetch(jdbcTemplate.queryForList(query, par));
    }

    @Override
    public List<GenericStorage> findBy(EtterlevelseDokumentasjonFilter filter) {
        var query = "select id from generic_storage where type = 'EtterlevelseDokumentasjon' ";
        var par = new MapSqlParameterSource();
        if (filter.getRelevans() != null && !filter.getRelevans().isEmpty()) {
            query += " and NOT data -> 'irrelevansFor' ??| array[ :relevans ] ";
            par.addValue("relevans", filter.getRelevans());
        } if (filter.getSistRedigert() != null) {
            query += """
                     and data ->> 'etterlevelseDokumentasjonId' in (
                       select etterlevelseDokumentasjonId
                         from (
                                  select distinct on (data #>> '{data,etterlevelseDokumentasjonId}') data #>> '{data,etterlevelseDokumentasjonId}' etterlevelseDokumentasjonId, time
                                   from audit_version
                                   where table_name = 'Etterlevelse'
                                     and user_id like :user_id
                                     and data #>> '{data,etterlevelseDokumentasjonId}' is not null -- old data that lacks this field, probably only dev
                                     and exists(select 1 from generic_storage where id = cast(table_id as uuid))
                                   order by data #>> '{data,etterlevelseDokumentasjonId}', time desc
                              ) sub
                         order by time desc
                         limit :limit
                    )
                    """;

            log.debug("Using get last modified by");
            log.debug("limit set to: " +  filter.getSistRedigert().toString());
            log.debug("user: " + SecurityUtils.getCurrentIdent());
            par.addValue("limit", filter.getSistRedigert())
                    .addValue("user_id", SecurityUtils.getCurrentIdent() + "%");
        }
        return fetch(jdbcTemplate.queryForList(query, par));
    }

    private List<GenericStorage> fetch(List<Map<String, Object>> resp) {
        List<UUID> ids = resp.stream().map(i -> ((UUID) i.values().iterator().next())).collect(Collectors.toList());
        return repository.findAllById(ids);
    }
}
