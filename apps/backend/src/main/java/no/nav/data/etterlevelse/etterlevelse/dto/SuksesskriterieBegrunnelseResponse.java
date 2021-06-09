package no.nav.data.etterlevelse.etterlevelse.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "begrunnelse", "oppfylt"})
public class SuksesskriterieBegrunnelseResponse {
    private int suksesskriterieId;
    private String begrunnelse;
    private Boolean oppfylt;
}
