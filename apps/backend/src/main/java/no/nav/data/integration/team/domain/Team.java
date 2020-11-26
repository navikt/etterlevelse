package no.nav.data.integration.team.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.integration.team.dto.TeamResponse;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Team {

    private String id;
    private String name;
    private String description;
    private String slackChannel;
    private String productAreaId;
    private List<String> tags;
    private List<Member> members;

    public TeamResponse convertToResponseWithMembers() {
        var resp = convertToResponse();
        resp.setMembers(convert(members, Member::convertToResponse));
        return resp;
    }

    public TeamResponse convertToResponse() {
        return TeamResponse.builder()
                .id(id)
                .name(name)
                .description(description)
                .slackChannel(slackChannel)
                .productAreaId(productAreaId)
                .tags(tags)
                .build();
    }
}
