package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KravImage implements DomainObject {

    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;

    private UUID kravId;
    private String name;
    private String type;
    private byte[] content;

}
