package no.nav.data.integration.team.teamcat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.integration.team.domain.ProductArea;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TeamKatProductArea {

    private String id;
    private String name;
    private String description;
    private List<String> tags;
    private List<TeamKatMember> members;

    public ProductArea convertToProductArea() {
        return ProductArea.builder()
                .id(id)
                .name(name)
                .description(description)
                .tags(tags)
                .members(convert(members, TeamKatMember::convertToMember))
                .build();
    }
}
