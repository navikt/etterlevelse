package no.nav.data.common.auditing.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Repository
@RequiredArgsConstructor
public class AuditVersionCustomRepo {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final AuditVersionRepository repository;

    @Transactional()
    public List<AuditVersion> findLatestByTableIdAndTimeStamp(String tableId, String timestamps){
        String query = "select audit_id as id from audit_version where table_id = :tableId and time <= :timestamps::timestamp order by time desc limit 1";
        var par = new MapSqlParameterSource();

        par.addValue("tableId", tableId);
        par.addValue("timestamps", timestamps);

        List<AuditVersion> auditVersionList = fetch(jdbcTemplate.queryForList(query, par));
        return auditVersionList;
    }


    @Transactional()
    public List<AuditVersion> findLatestEtterlevelseByEtterlevelseDokumentIdAndTimestamp(String dokumentasjonId, String timestamps) {
        String query = """
                select *
                from audit_version av
                where av.table_name= 'Etterlevelse'
                	and av.data -> 'data' ->> 'etterlevelseDokumentasjonId' = :dokumentasjonId
                	and av.time <= :timestamps ::timestamp
                	and not exists (
                		select 1
                		from audit_version av2
                		where av2.audit_id != av.audit_id
                			and av2.table_id = av.table_id
                			and av2.time <= :timestamps ::timestamp
                			and av2.time > av.time
                    )
                                
                order by time desc;
                """;

        var par = new MapSqlParameterSource();

        par.addValue("dokumentasjonId", dokumentasjonId);
        par.addValue("timestamps", timestamps);

        List<AuditVersion> auditVersionList = fetch(jdbcTemplate.queryForList(query, par));
        return auditVersionList;

    }

    private List<AuditVersion> fetch(List<Map<String, Object>> resp) {
        return repository.findAllById(convert(resp, i -> (UUID) i.values().iterator().next()));
    }
}
