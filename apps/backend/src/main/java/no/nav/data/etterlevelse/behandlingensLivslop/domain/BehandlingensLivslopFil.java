package no.nav.data.etterlevelse.behandlingensLivslop.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class BehandlingensLivslopFil {
    
    private String filnavn;

    private String filtype;

    @Builder.Default
    private byte[] fil = new byte[0];

}
