package no.nav.data.etterlevelse.etterlevelse.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseData {

    private boolean etterleves;
    private String statusBegrunnelse;
    private List<String> dokumentasjon;
    private LocalDate fristForFerdigstillelse;
    private EtterlevelseStatus status;
    private List<SuksesskriterieBegrunnelse> suksesskriterieBegrunnelser;
    
}
