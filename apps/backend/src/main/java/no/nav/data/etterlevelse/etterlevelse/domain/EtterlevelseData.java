package no.nav.data.etterlevelse.etterlevelse.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;

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
    
    // FIXME: Disse er fra DomainObject. Skal de beholdes for Etterlevelse?
    // protected Integer version; // FIXME: Kræsjer med Auditable.version
    // protected ChangeStamp changeStamp; // FIXME: Holder det med det som arves fra Auditable?            


}
