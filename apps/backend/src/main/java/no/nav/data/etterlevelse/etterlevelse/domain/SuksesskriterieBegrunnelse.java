package no.nav.data.etterlevelse.etterlevelse.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuksesskriterieBegrunnelse {
    private int suksesskriterieId;
    private String begrunnelse;

    private SuksesskriterieStatus suksesskriterieStatus;

    @Builder.Default
    private boolean veiledning = false;
    private String veiledningsTekst;
    private String veiledningsTekst2;

}
