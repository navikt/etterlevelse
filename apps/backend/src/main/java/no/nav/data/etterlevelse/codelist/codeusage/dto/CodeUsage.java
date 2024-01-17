package no.nav.data.etterlevelse.codelist.codeusage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.virkemiddel.domain.Virkemiddel;

import java.util.ArrayList;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CodeUsage {

    private ListName listName;
    private String code;

    private String shortName;
    private List<GenericStorage<Krav>> krav = new ArrayList<>();
    private List<GenericStorage<EtterlevelseDokumentasjon>> etterlevelseDokumentasjoner = new ArrayList<>();
    private List<GenericStorage<Virkemiddel>> virkemidler = new ArrayList<>();
    private List<Codelist> codelist = new ArrayList<>();


    public CodeUsage(ListName listName, String code, String shortName) {
        this.listName = listName;
        this.code = code;
        this.shortName = shortName;
    }

    public boolean isInUse() {
        return !krav.isEmpty()
                || !etterlevelseDokumentasjoner.isEmpty()
                || !virkemidler.isEmpty()
                || !codelist.isEmpty();
    }

    public CodeUsageResponse toResponse() {
        CodeUsageResponse response = new CodeUsageResponse(listName, code, shortName);
        response.setKrav(convert(krav, k -> k.getDomainObjectData().convertToInstanceId()));
        response.setEtterlevelseDokumentasjoner(convert(etterlevelseDokumentasjoner, ed -> ed.getDomainObjectData().convertToInstanceId()));
        response.setVirkemidler(convert(virkemidler, v -> v.getDomainObjectData().convertToInstanceId()));
        response.setCodelist(convert(codelist, Codelist::toResponse));
        response.setInUse(isInUse());
        return response;
    }
}
