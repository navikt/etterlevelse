package no.nav.data.pvk.pvotilbakemelding.domain;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.pvk.pvotilbakemelding.dto.PvoTilbakemeldingFilter;
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
public class PvoTilbakemeldingRepoCustom {

    private final JpaRepository<PvoTilbakemelding, UUID> repository;
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public List<PvoTilbakemelding> findBy(PvoTilbakemeldingFilter filter) {
        var query = "select id from pvo_tilbakemelding where true";
        var par = new MapSqlParameterSource();

        if (filter.getSistRedigert() != null) {
            query += """
                     and id in (
                       select pvoTilbakemeldingId
                         from (
                                  select distinct on (data #>> '{data,id}') data #>> '{data,id}' pvoTilbakemeldingId, time
                                  from audit_version
                                  where table_name = 'PVO_TILBAKEMELDING'
                                    and user_id like :user_id
                                    and data #>> '{data,id}' is not null -- old data that lacks this field, probably only dev
                                    and exists (select 1 from pvo_tilbakemelding where id = cast(table_id as uuid))
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

    private List<PvoTilbakemelding> fetch(List<Map<String, Object>> resp) {
        return repository.findAllById(convert(resp, i -> (UUID) i.values().iterator().next()));
    }
}
