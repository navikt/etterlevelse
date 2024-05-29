package no.nav.data.common.auditing.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Repository
@RequiredArgsConstructor
public class AuditVersionRepoImp  {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final AuditVersionRepository repository;

    public List<AuditVersion> findByTableIdAndTimeStamp(String tableId, String timestamps){
        String query = "select audit_id as id from audit_version where table_id = :tableId and time <= :timestamps::timestamp order by time desc limit 1";
        var par = new MapSqlParameterSource();

        par.addValue("tableId", tableId);
        par.addValue("timestamps", timestamps);

        List<AuditVersion> auditVersionList = fetch(jdbcTemplate.queryForList(query, par));
        return auditVersionList;

    }

    private List<AuditVersion> fetch(List<Map<String, Object>> resp) {
        return repository.findAllById(convert(resp, i -> (UUID) i.values().iterator().next()));
    }
}
