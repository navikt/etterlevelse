package no.nav.data.etterlevelse.krav.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Repository
@RequiredArgsConstructor
public class KravRepoImpl implements KravRepoCustom {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final GenericStorageRepository repository;
    private final BehandlingService behandlingService;

    @Override
    public List<GenericStorage> findByRelevans(String code) {
        return findBy(KravFilter.builder().relevans(List.of(code)).build());
    }

    @Override
    public List<GenericStorage> findBy(KravFilter filter) {
        var query = "select id from generic_storage where type = 'Krav' ";
        var par = new MapSqlParameterSource();

        if (!filter.getRelevans().isEmpty()) {
            query += " and data -> 'relevansFor' ??| array[ :relevans ] ";
            par.addValue("relevans", filter.getRelevans());
        }
        if (filter.getNummer() != null) {
            query += " and data -> 'kravNummer' = to_jsonb(:kravNummer) ";
            par.addValue("kravNummer", filter.getNummer());
        }
        if (filter.getBehandlingId() != null) {
            var behandling = behandlingService.getBehandling(filter.getBehandlingId());
            if (behandling != null) {
                var behandlingQuery = """
                         data ->> 'kravNummer' in (
                            select data ->> 'kravNummer' from generic_storage where type = 'Etterlevelse' and data ->> 'behandlingId' = :behandlingId
                          ) 
                        """;
                if (behandling.getRelevansFor().isEmpty()) {
                    query += " and %s ".formatted(behandlingQuery);
                } else {
                    query += "and ( %s or data -> 'relevansFor' ??| array[ :relevans ] ) ".formatted(behandlingQuery);
                    par.addValue("relevans", convert(behandling.getRelevansFor(), CodelistResponse::getCode));
                }
                par.addValue("behandlingId", filter.getBehandlingId());
            }
        }
        if (filter.getUnderavdeling() != null) {
            query += " and data ->> 'underavdeling' = :underavdeling ";
            par.addValue("underavdeling", filter.getUnderavdeling());
        }

        return fetch(jdbcTemplate.queryForList(query, par));
    }

    private List<GenericStorage> fetch(List<Map<String, Object>> resp) {
        return repository.findAllById(convert(resp, i -> (UUID) i.values().iterator().next()));
    }
}
