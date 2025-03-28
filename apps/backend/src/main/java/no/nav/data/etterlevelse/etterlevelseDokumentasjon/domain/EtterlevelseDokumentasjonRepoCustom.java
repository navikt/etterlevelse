package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonFilter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Repository
@RequiredArgsConstructor
@Slf4j
public class EtterlevelseDokumentasjonRepoCustom {

    private final JpaRepository<EtterlevelseDokumentasjon, UUID> repository;
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public List<EtterlevelseDokumentasjon> findByIrrelevans(List<String> codes) {
        var query = "select id from etterlevelse_dokumentasjon where data -> 'irrelevansFor' ??| array[ :irrelevans ] ";
        var par = new MapSqlParameterSource();
        par.addValue("irrelevans", codes);
        return fetch(jdbcTemplate.queryForList(query, par));
    }

    public List<EtterlevelseDokumentasjon> getEtterlevelseDokumentasjonerForTeam(List<String> teamIds) {
        var query = "select id from etterlevelse_dokumentasjon where data -> 'teams' ??| array[ :teamIds ] ";
        var par = new MapSqlParameterSource();
        par.addValue("teamIds", teamIds);
        return fetch(jdbcTemplate.queryForList(query, par));
    }

    public List<EtterlevelseDokumentasjon> findByBehandlingIds(List<String> ids) {
        var query = "select id from etterlevelse_dokumentasjon where data -> 'behandlingIds' ??| array[ :behandlingIds ]";
        var par = new MapSqlParameterSource();
        par.addValue("behandlingIds", ids);
        return fetch(jdbcTemplate.queryForList(query, par));
    }

    public List<EtterlevelseDokumentasjon> findByKravRelevans(List<String> kravRelevans) {
        var query = "select id from etterlevelse_dokumentasjon where not data -> 'irrelevansFor' @> to_jsonb(array[ :kravRelevans ])";
        var par = new MapSqlParameterSource();
        if (kravRelevans.isEmpty()) {
            par.addValue("kravRelevans", "");
        } else {
            par.addValue("kravRelevans", kravRelevans);
        }
        return fetch(jdbcTemplate.queryForList(query, par));
    }

    public List<EtterlevelseDokumentasjon> findBy(EtterlevelseDokumentasjonFilter filter) {
        var query = "select id from etterlevelse_dokumentasjon where true";
        var par = new MapSqlParameterSource();

        if (filter.getRelevans() != null && !filter.getRelevans().isEmpty()) {
            query += " and NOT data -> 'irrelevansFor' @> to_jsonb(array[ :relevans ]) ";
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
                                  where table_name in ('Etterlevelse', 'ETTERLEVELSE')
                                    and user_id like :user_id
                                    and data #>> '{data,etterlevelseDokumentasjonId}' is not null -- old data that lacks this field, probably only dev
                                    and exists (select 1 from etterlevelse_dokumentasjon where id = cast(table_id as uuid))
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
                                  where table_name in ('EtterlevelseDokumentasjon', 'ETTERLEVELSE_DOKUMENTASJON')
                                    and user_id like :user_id
                                    and data #>> '{data,id}' is not null -- old data that lacks this field, probably only dev
                                    and exists (select 1 from etterlevelse_dokumentasjon where id = cast(table_id as uuid))
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

    private List<EtterlevelseDokumentasjon> fetch(List<Map<String, Object>> resp) {
        return repository.findAllById(convert(resp, i -> (UUID) i.values().iterator().next()));
    }

}
