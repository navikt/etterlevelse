package no.nav.data.etterlevelse.codelist.codeusage;

import com.fasterxml.jackson.databind.JsonNode;
import io.prometheus.client.Summary;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.validator.Validated;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.CodelistService.ListReq;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodeUsage;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodeUsageRequest;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.virkemiddel.domain.Virkemiddel;
import no.nav.data.etterlevelse.virkemiddel.domain.VirkemiddelRepo;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static java.util.Collections.replaceAll;
import static java.util.stream.Collectors.toList;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.safeStream;
import static no.nav.data.etterlevelse.codelist.CodelistService.getCodelist;

@Service
public class CodeUsageService {

    private final KravRepo kravRepo;
    private final EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;
    private final VirkemiddelRepo virkemiddelRepo;
    private final Summary summary;
    private final CodelistService codelistService;

    public CodeUsageService(KravRepo kravRepo, EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo, VirkemiddelRepo virkemiddelRepo, @Lazy CodelistService codelistService) {
        this.kravRepo = kravRepo;
        this.etterlevelseDokumentasjonRepo = etterlevelseDokumentasjonRepo;
        this.virkemiddelRepo = virkemiddelRepo;
        this.codelistService = codelistService;
        List<String[]> listnames = Stream.of(ListName.values()).map(e -> new String[]{e.name()}).collect(toList());
        this.summary = MetricUtils.summary()
                .labels(listnames)
                .labelNames("listname")
                .name("etterlevelse_codeusage_find_summary")
                .help("Time taken for listname usage lookup times")
                .quantile(.9, .01).quantile(.99, .001)
                .maxAgeSeconds(Duration.ofHours(6).getSeconds())
                .ageBuckets(6)
                .register();
    }

    public void validateListName(String list) {
        new ListReq(list).validate();
    }

    void validateRequests(String listName, String code) {
        validateRequests(List.of(CodeUsageRequest.builder().listName(listName).code(code).build()));
    }

    void validateRequests(List<CodeUsageRequest> requests) {
        StreamUtils.safeStream(requests).forEach(Validated::validate);
    }

    public List<CodeUsage> findCodeUsageOfList(ListName list) {
        return convert(CodelistService.getCodelist(list), c -> findCodeUsage(c.getList(), c.getCode()));
    }

    public CodeUsage findCodeUsage(ListName listName, String code) {
        Codelist codelist = CodelistService.getCodelist(listName, code);
        return summary.labels(listName.name()).time(() -> {
            CodeUsage codeUsage = new CodeUsage(listName, code, codelist.getShortName());
            codeUsage.setKrav(findKrav(listName, code));
            codeUsage.setEtterlevelseDokumentasjoner(findEtterlevelseDokumentasjoner(listName, code));
            codeUsage.setVirkemidler(findVirkemiddel(listName, code));
            codeUsage.setCodelist(findCodelists(listName, code));
            return codeUsage;
        });
    }

    @Transactional
    public CodeUsage replaceUsage(ListName listName, String oldCode, String newCode) {
        var usage = findCodeUsage(listName, oldCode);
        if (usage.isInUse()) {
            switch (listName) {
                case RELEVANS -> {
                    usage.getKrav().forEach(gs -> gs.consumeDomainObject(k -> replaceAll(k.getRelevansFor(), oldCode, newCode)));
                    usage.getEtterlevelseDokumentasjoner().forEach(gs -> gs.consumeDomainObject(ed -> replaceAll(ed.getIrrelevansFor(), oldCode, newCode)));
                }
                case AVDELING -> usage.getKrav().forEach(gs -> gs.consumeDomainObject(k -> k.setAvdeling(newCode)));
                case UNDERAVDELING -> {
                    usage.getKrav().forEach(gs -> gs.consumeDomainObject(k -> k.setUnderavdeling(newCode)));
                    usage.getCodelist().forEach(c -> codelistService.replaceDataField(c, "underavdeling", oldCode, newCode));
                }
                case LOV ->
                        usage.getKrav().forEach(gs -> gs.consumeDomainObject(k -> replaceLov(oldCode, newCode, k.getRegelverk())));
                case TEMA ->
                        usage.getCodelist().forEach(c -> codelistService.replaceDataField(c, "tema", oldCode, newCode));
                case VIRKEMIDDELTYPE ->
                        usage.getVirkemidler().forEach(gs -> gs.consumeDomainObject(v -> v.setVirkemiddelType(newCode)));
            }
        }
        if (!usage.getCodelist().isEmpty()) {
            codelistService.refreshCache();
        }
        return usage;
    }

    private void replaceLov(String oldCode, String newCode, List<Regelverk> regelverk) {
        safeStream(regelverk)
                .filter(lb -> lb.getLov().equals(oldCode))
                .forEach(lb -> lb.setLov(newCode));
    }

    private List<GenericStorage<Krav>> findKrav(ListName listName, String code) {
        return switch (listName) {
            case RELEVANS -> kravRepo.findByRelevans(code);
            case AVDELING -> kravRepo.findByAvdeling(code);
            case UNDERAVDELING -> kravRepo.findByUnderavdeling(code);
            case LOV -> kravRepo.findByLov(code);
            case TEMA, VIRKEMIDDELTYPE -> List.of();
        };
    }

    private List<GenericStorage<Virkemiddel>> findVirkemiddel(ListName listName, String code) {
        return switch (listName) {
            case VIRKEMIDDELTYPE -> virkemiddelRepo.findByVirkemiddelType(code);
            case TEMA, RELEVANS, AVDELING, UNDERAVDELING, LOV -> List.of();
        };
    }

    private List<GenericStorage<EtterlevelseDokumentasjon>> findEtterlevelseDokumentasjoner(ListName listName, String code) {
        return switch (listName) {
            case RELEVANS -> etterlevelseDokumentasjonRepo.findByIrrelevans(List.of(code));
            case AVDELING, UNDERAVDELING, LOV, TEMA, VIRKEMIDDELTYPE -> List.of();
        };
    }

    private List<Codelist> findCodelists(ListName listName, String code) {
        return switch (listName) {
            case TEMA -> filter(getCodelist(ListName.LOV), c -> code.equals(getField(c, "tema")));
            case UNDERAVDELING -> filter(getCodelist(ListName.LOV), c -> code.equals(getField(c, "underavdeling")));
            case AVDELING, LOV, RELEVANS, VIRKEMIDDELTYPE -> List.of();
        };
    }

    private String getField(Codelist c, String fieldName) {
        return Optional.ofNullable(c.getData())
                .map(cl -> cl.get(fieldName))
                .map(JsonNode::asText)
                .orElse(null);
    }

}
