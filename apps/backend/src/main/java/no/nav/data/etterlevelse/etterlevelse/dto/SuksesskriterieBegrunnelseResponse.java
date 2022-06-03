package no.nav.data.etterlevelse.etterlevelse.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "begrunnelse", "suksesskriterieStatus"})
public class SuksesskriterieBegrunnelseResponse {
    private int suksesskriterieId;
    private String begrunnelse;

    private SuksesskriterieStatus suksesskriterieStatus;
}
