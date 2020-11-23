package no.nav.data.etterlevelse.etterlevelse.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Etterlevelse implements DomainObject {

    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;

    private String behandling;
    private boolean etterleves;
    private String begrunnelse;
    private List<String> dokumentasjon;
    private EtterlevelseStatus status;
    private LocalDate fristForFerdigstillelse;
    private Integer kravNr;
    private Integer kravVersjon;

    public enum EtterlevelseStatus {
        UNDER_REDIGERING,
        FERDIG
    }
}
