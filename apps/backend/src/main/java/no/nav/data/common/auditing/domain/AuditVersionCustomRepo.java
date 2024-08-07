package no.nav.data.common.auditing.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.security.SecurityUtils;
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

        return fetch(jdbcTemplate.queryForList(query, par));
    }


    @Transactional()
    public List<AuditVersion> findLatestEtterlevelseByEtterlevelseDokumentIdAndTimestamp(String dokumentasjonId, String timestamps) {
        String query = """
                With query as (
                                   select * ,   RANK () OVER (
                                        PARTITION BY table_id
                                   		ORDER BY time DESC
                                   	) table_rank
                                   
                                    from audit_version where 
                                    table_name= 'Etterlevelse' and 
                                    data -> 'data' ->> 'etterlevelseDokumentasjonId' = :dokumentasjonId and 
                                    time <= :timestamps ::timestamp
                                   )
                                    Select * from query where table_rank = 1;             
                """;

        var par = new MapSqlParameterSource();

        par.addValue("dokumentasjonId", dokumentasjonId);
        par.addValue("timestamps", timestamps);


        return fetch(jdbcTemplate.queryForList(query, par));

    }

    @Transactional()
    public List<AuditVersion> findLatestEtterlevelseByEtterlevelseDokumentIdAndCurrentUser(String dokumentasjonId) {
        String query = """
                With query as (
                                   select * ,   RANK () OVER (
                                        PARTITION BY table_id
                                   		ORDER BY time DESC
                                   	) table_rank
                                   
                                    from audit_version where 
                                    table_name = 'Etterlevelse' and
                                    user_id like :currentUser and
                                    data -> 'data' ->> 'etterlevelseDokumentasjonId' = :dokumentasjonId
                                   )
                                    Select * from query where table_rank = 1;             
                """;

        var par = new MapSqlParameterSource();

        par.addValue("dokumentasjonId", dokumentasjonId);
        par.addValue("currentUser", SecurityUtils.getCurrentIdent() + "%");


        return fetch(jdbcTemplate.queryForList(query, par));

    }

    private List<AuditVersion> fetch(List<Map<String, Object>> resp) {
        return repository.findAllById(convert(resp, i -> (UUID) i.values().iterator().next()));
    }
}
