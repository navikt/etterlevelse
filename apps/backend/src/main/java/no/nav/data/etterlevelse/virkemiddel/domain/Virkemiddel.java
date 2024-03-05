package no.nav.data.etterlevelse.virkemiddel.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelRequest;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelResponse;

import java.util.List;



@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Virkemiddel extends DomainObject {

    private String navn;
    // Codelist VIRKEMIDDELTYPE
    private String virkemiddelType;
    private List<Regelverk> regelverk;
    private String livsSituasjon;

    // Updates all fields from the request except id, version and changestamp
    public Virkemiddel merge(VirkemiddelRequest request) {
        navn = request.getNavn();
        virkemiddelType = request.getVirkemiddelType();
        regelverk = StreamUtils.convert(request.getRegelverk(), Regelverk::convert);
        livsSituasjon = request.getLivsSituasjon();

        return this;
    }

    public VirkemiddelResponse toResponse() {
        return VirkemiddelResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .navn(navn)
                .virkemiddelType(CodelistService.getCodelistResponse(ListName.VIRKEMIDDELTYPE, virkemiddelType))
                .regelverk(StreamUtils.convert(regelverk, Regelverk::toResponse))
                .livsSituasjon(livsSituasjon)
                .build();

    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), navn, "");
    }

}
