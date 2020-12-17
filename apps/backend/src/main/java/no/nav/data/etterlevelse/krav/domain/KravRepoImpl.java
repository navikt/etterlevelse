package no.nav.data.etterlevelse.krav.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class KravRepoImpl implements KravRepoCustom {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final GenericStorageRepository repository;

    @Override
    public List<GenericStorage> findByRelevans(String code) {
        return findBy(KravFilter.builder().relevans(code).build());
    }

    @Override
    public List<GenericStorage> findBy(KravFilter filter) {
        var query = "select id from generic_storage where type = 'Krav' ";
        var par = new MapSqlParameterSource();

        if (filter.getRelevans() != null) {
            query += " and data #> '{relevansFor}' ?? :relevans ";
            par.addValue("relevans", filter.getRelevans());
        }

        return fetch(jdbcTemplate.queryForList(query, par));
    }

    private List<GenericStorage> fetch(List<Map<String, Object>> resp) {
        List<UUID> ids = resp.stream().map(i -> ((UUID) i.values().iterator().next())).collect(Collectors.toList());
        return repository.findAllById(ids);
    }
}
