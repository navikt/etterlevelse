package no.nav.data.integration.team.teamcat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.integration.team.domain.Team;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TeamKatTeam {

    private String id;
    private String name;
    private String description;
    private String slackChannel;
    private String productAreaId;
    private List<String> tags;
    private List<TeamKatMember> members;

    public Team convertToTeam() {
        return Team.builder()
                .id(id)
                .name(name)
                .description(description)
                .slackChannel(slackChannel)
                .productAreaId(productAreaId)
                .tags(tags)
                .members(convert(members, TeamKatMember::convertToMember))
                .build();
    }
}
