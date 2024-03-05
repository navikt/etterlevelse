package no.nav.data.etterlevelse.kravprioritering.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringRequest;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringResponse;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class KravPrioritering extends DomainObject implements KravId {

    private Integer kravNummer;
    private Integer kravVersjon;
    private String prioriteringsId;

    // Updates all fields from the request except id, version and changestamp
    public KravPrioritering merge(KravPrioriteringRequest request) {
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
