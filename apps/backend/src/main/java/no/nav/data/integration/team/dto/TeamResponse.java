package no.nav.data.integration.team.dto;


import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "name", "description", "slackChannel", "productAreaId", "tags", "members"})
public class TeamResponse {

    private String id;
    private String name;
    private String description;
    private String slackChannel;
    private String productAreaId;
    private String productAreaName;
    private List<String> tags;
    private List<MemberResponse> members;

    public TeamResponse(String id) {
        this.id = id;
    }
}
