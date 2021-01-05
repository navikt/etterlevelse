package no.nav.data.integration.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Resource {

    private String navIdent;
    private String givenName;
    private String familyName;
    private String fullName;
    private String email;
    private ResourceType resourceType;

    public Resource(String navIdent) {
        this.navIdent = navIdent;
    }
}
