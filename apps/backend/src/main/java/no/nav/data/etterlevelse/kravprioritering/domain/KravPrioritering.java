package no.nav.data.etterlevelse.kravprioritering.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringRequest;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringResponse;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KravPrioritering implements DomainObject, KravId {
    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;
    private Integer kravNummer;
    private Integer kravVersjon;
    private String prioriteringsId;


    public KravPrioritering convert(KravPrioriteringRequest request) {
        kravNummer = request.getKravNummer();
        kravVersjon = request.getKravVersjon();
        prioriteringsId = request.getPrioriteringsId();
        return this;
    }

    public KravPrioriteringResponse toResponse() {
        return KravPrioriteringResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)

                .kravNummer(kravNummer)
                .kravVersjon(kravVersjon)
                .prioriteringsId(prioriteringsId)
                .build();
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), kravId(), "");
    }
}
