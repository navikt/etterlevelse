package no.nav.data.integration.ardoq.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArdoqSystemData {

    @Singular
    private List<ArdoqSystem> values;
}
