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

    private String navIdent;
    private String name;
    private String email;

    public MemberResponse toResponse() {
        return MemberResponse.builder()
                .navIdent(navIdent)
                .name(name)
                .email(email)
                .build();
    }
}
