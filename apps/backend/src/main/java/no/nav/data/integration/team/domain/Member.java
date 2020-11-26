package no.nav.data.integration.team.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.integration.team.dto.MemberResponse;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Member {

    private String name;
    private String email;

    public MemberResponse convertToResponse() {
        return MemberResponse.builder().name(name).email(email).build();
    }
}
