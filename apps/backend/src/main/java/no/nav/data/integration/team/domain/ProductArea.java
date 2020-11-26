package no.nav.data.integration.team.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.integration.team.dto.ProductAreaResponse;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductArea {

    private String id;
    private String name;
    private String description;
    private List<String> tags;
    private List<Member> members;

    public ProductAreaResponse convertToResponseWithMembers() {
        var resp = convertToResponse();
        resp.setMembers(convert(members, Member::convertToResponse));
        return resp;
    }

    public ProductAreaResponse convertToResponse() {
        return ProductAreaResponse.builder()
                .id(id)
                .name(name)
                .description(description)
                .tags(tags)
                .build();
    }
}
