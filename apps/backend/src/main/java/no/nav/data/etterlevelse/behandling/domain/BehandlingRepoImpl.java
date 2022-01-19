package no.nav.data.etterlevelse.behandling.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.etterlevelse.behandling.dto.BehandlingFilter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class BehandlingRepoImpl implements BehandlingRepoCustom {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final GenericStorageRepository repository;

    @Override
    public List<GenericStorage> findByRelevans(String code) {
        return findBy(BehandlingFilter.builder().relevans(List.of(code)).build());
    }

    @Override
    public List<GenericStorage> findByRelevans(List<String> codes) {
        return findBy(BehandlingFilter.builder().relevans(codes).build());
    }

    @Override
    public List<GenericStorage> findByIrrelevans(List<String> codes) {
        var query = "select id from generic_storage where type = 'BehandlingData' and data -> 'irrelevansFor' ??| array[ :irrelevans ] ";
        var par = new MapSqlParameterSource();
        par.addValue("irrelevans", codes);
        return fetch(jdbcTemplate.queryForList(query, par));
    }

    @Override
    public List<GenericStorage> findBy(BehandlingFilter filter) {
        var query = "select id from generic_storage where type = 'BehandlingData' ";
        var par = new MapSqlParameterSource();
        if (!filter.getRelevans().isEmpty() && filter.getIrelevans().equals(Boolean.FALSE)) {
            query += " and NOT data -> 'irrelevansFor' ??| array[ :relevans ] ";
            par.addValue("relevans", filter.getRelevans());
        } else if (!filter.getRelevans().isEmpty() && filter.getIrelevans().equals(Boolean.TRUE)) {
            query += " and data -> 'irrelevansFor' ??| array[ :relevans ] ";
            par.addValue("relevans", filter.getRelevans());
        }
        if (filter.getSistRedigert() != null) {
            query += """
                     and data ->> 'behandlingId' in (
                       select behandlingId
                         from (
                                  select distinct on (data #>> '{data,behandlingId}') data #>> '{data,behandlingId}' behandlingId, time
                                   from audit_version
                                   where table_name = 'Etterlevelse'
                                     and user_id like :user_id
                                     and data #>> '{data,behandlingId}' is not null -- old data that lacks this field, probably only dev
                                     and exists(select 1 from generic_storage where id = cast(table_id as uuid))
                                   order by data #>> '{data,behandlingId}', time desc
                              ) sub
                         order by time desc
                         limit :limit
                    )
                    """;
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
