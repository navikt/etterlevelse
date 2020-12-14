package no.nav.data.etterlevelse.behandling.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.GenericStorageRepository;
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
        var resp = jdbcTemplate.queryForList("select id from generic_storage where data #> '{relevansFor}' ?? :code and type = 'BehandlingData'",
                new MapSqlParameterSource().addValue("code", code));
        return fetch(resp);
    }

    private List<GenericStorage> fetch(List<Map<String, Object>> resp) {
        List<UUID> ids = resp.stream().map(i -> ((UUID) i.values().iterator().next())).collect(Collectors.toList());
        return repository.findAllById(ids);
    }
}
