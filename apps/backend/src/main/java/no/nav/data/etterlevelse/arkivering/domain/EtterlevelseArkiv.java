package no.nav.data.etterlevelse.arkivering.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseArkiv implements DomainObject {
    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;

    private String behandlingId;
    private boolean tilArkivering;
    private LocalDateTime arkiveringDato;
    private String webSakNummer;
}
