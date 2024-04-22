package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class EtterlevelseDokumentasjonRepoImpl implements EtterlevelseDokumentasjonRepoCustom {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final GenericStorageRepository<EtterlevelseDokumentasjon> repository;

    @Override
    public List<GenericStorage<EtterlevelseDokumentasjon>> findByIrrelevans(List<String> codes) {
        var query = "select id from generic_storage where type = 'EtterlevelseDokumentasjon' and data -> 'irrelevansFor' ??| array[ :irrelevans ] ";
        var par = new MapSqlParameterSource();
        par.addValue("irrelevans", codes);
        return fetch(jdbcTemplate.queryForList(query, par));
    }

    @Override
    public List<GenericStorage<EtterlevelseDokumentasjon>> getEtterlevelseDokumentasjonerForTeam(List<String> teamIds) {
        var query = "select id from generic_storage where type = 'EtterlevelseDokumentasjon' and data -> 'teams' ??| array[ :teamIds ] ";
        var par = new MapSqlParameterSource();
        par.addValue("teamIds", teamIds);
        return fetch(jdbcTemplate.queryForList(query, par));
    }

    @Override
    public List<GenericStorage<EtterlevelseDokumentasjon>> findByBehandlingIds(List<String> ids) {
        var query = "select * from generic_storage where type = 'EtterlevelseDokumentasjon' and data -> 'behandlingIds' ??| array[ :behandlingIds ]";
        var par = new MapSqlParameterSource();
        par.addValue("behandlingIds", ids);
        return fetch(jdbcTemplate.queryForList(query, par));
    }

    @Override
    public List<GenericStorage<EtterlevelseDokumentasjon>> findBy(EtterlevelseDokumentasjonFilter filter) {
        var query = "select id from generic_storage where type = 'EtterlevelseDokumentasjon' ";
        var par = new MapSqlParameterSource();

        if (filter.getRelevans() != null && !filter.getRelevans().isEmpty()) {
            query += " and NOT data -> 'irrelevansFor' ??| array[ :relevans ] ";
            par.addValue("relevans", filter.getRelevans());
        }

        if (filter.getBehandlerPersonopplysninger() != null) {
            query += " and data -> 'behandlerPersonopplysninger' = :behandlerPersonopplysninger";
            par.addValue("behandlerPersonopplysninger", filter.getBehandlerPersonopplysninger());
        }

        if (filter.getKnyttetTilVirkemiddel() != null) {
            query += " and data -> 'knyttetTilVirkemiddel' = :knyttetTilVirkemiddel";
            par.addValue("knyttetTilVirkemiddel", filter.getKnyttetTilVirkemiddel());
        }

        if (filter.getSistRedigert() != null) {
            query += """
                     and (data ->> 'id' in (
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
                    
                    or data ->> 'id' in (
                       select etterlevelseDokumentasjonId
                         from (
                                  select distinct on (data #>> '{data,id}') data #>> '{data,id}' etterlevelseDokumentasjonId, time
                                   from audit_version
                                   where table_name = 'EtterlevelseDokumentasjon'
                                   and user_id like :user_id
                                   and data #>> '{data,id}' is not null -- old data that lacks this field, probably only dev
                                   and exists(select 1 from generic_storage where id = cast(table_id as uuid))
                                   order by data #>> '{data,id}', time desc
                              ) sub
                         order by time desc
                         limit :limit
                    ))
                    """;
            par.addValue("limit", filter.getSistRedigert() -1)
                    .addValue("user_id", SecurityUtils.getCurrentIdent() + "%");
        }

        return fetch(jdbcTemplate.queryForList(query, par));
    }

    private List<GenericStorage<EtterlevelseDokumentasjon>> fetch(List<Map<String, Object>> resp) {
        List<UUID> ids = resp.stream().map(i -> ((UUID) i.values().iterator().next())).collect(Collectors.toList());
        return repository.findAllById(ids);
    }
}
