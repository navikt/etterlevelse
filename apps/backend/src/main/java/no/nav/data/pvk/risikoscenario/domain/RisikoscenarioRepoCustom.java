package no.nav.data.pvk.risikoscenario.domain;

import lombok.RequiredArgsConstructor;
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
public class RisikoscenarioRepoCustom {
    private final JpaRepository<Risikoscenario, UUID> repository;
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public List<Risikoscenario> findByKravNummer(String kravNummer) {
        var query = "select id from risikoscenario where data #> '{relvanteKravNummerList}' @> :kravnummerList::jsonb";
        var par = new MapSqlParameterSource();
        par.addValue("kravnummerList", String.format("[\"%s\"]", kravNummer));
        return fetch(jdbcTemplate.queryForList(query, par));
    }

    private List<Risikoscenario> fetch(List<Map<String, Object>> resp) {
        return repository.findAllById(convert(resp, i -> (UUID) i.values().iterator().next()));
    }
}
