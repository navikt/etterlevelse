package no.nav.data.common.auditing.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.Action;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "action", "table", "tableId", "time", "user", "data"})
public class AuditResponse {

    private String id;
    private Action action;
    private String table;
    private String tableId;
    private LocalDateTime time;
    private String user;
    private JsonNode data;

}
