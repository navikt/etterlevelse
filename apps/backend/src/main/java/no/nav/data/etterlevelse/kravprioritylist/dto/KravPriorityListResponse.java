package no.nav.data.etterlevelse.kravprioritylist.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "temaId"})
public class KravPriorityListResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;
    private String temaId;
    private List<Integer> priorityList;
}
