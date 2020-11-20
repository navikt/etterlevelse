package no.nav.data.etterlevelse.common.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.utils.DateUtil;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Periode {

    private LocalDate start;
    private LocalDate slutt;

    public boolean isActive() {
        return DateUtil.isNow(start, slutt);
    }
}
