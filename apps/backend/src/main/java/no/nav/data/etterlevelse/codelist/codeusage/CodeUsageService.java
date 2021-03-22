package no.nav.data.etterlevelse.codelist.codeusage;

import io.prometheus.client.Summary;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.validator.Validated;
import no.nav.data.etterlevelse.behandling.domain.BehandlingData;
import no.nav.data.etterlevelse.behandling.domain.BehandlingRepo;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.CodelistService.ListReq;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodeUsage;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodeUsageRequest;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Stream;

import static java.util.Collections.replaceAll;
import static java.util.stream.Collectors.toList;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.safeStream;

@Service
@Transactional
public class CodeUsageService {

    private final KravRepo kravRepo;
    private final BehandlingRepo behandlingRepo;
    private final Summary summary;

    public CodeUsageService(KravRepo kravRepo, BehandlingRepo behandlingRepo) {
        this.kravRepo = kravRepo;
        this.behandlingRepo = behandlingRepo;
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

    /**
     * TODO usage of code on code data? lov -> tema $ underavdeling
     */
    public CodeUsage findCodeUsage(ListName listName, String code) {
        return summary.labels(listName.name()).time(() -> {
            CodeUsage codeUsage = new CodeUsage(listName, code);
            codeUsage.setKrav(findKrav(listName, code));
            codeUsage.setBehandlinger(findBehandlinger(listName, code));
            return codeUsage;
        });
    }

    @SuppressWarnings({"ResultOfMethodCallIgnored"})
    public CodeUsage replaceUsage(ListName listName, String oldCode, String newCode) {
        var usage = findCodeUsage(listName, oldCode);
        if (usage.isInUse()) {
            switch (listName) {
                case RELEVANS -> {
                    usage.getKrav().forEach(gs -> gs.asType(k -> replaceAll(k.getRelevansFor(), oldCode, newCode), Krav.class));
                    usage.getBehandlinger().forEach(gs -> gs.asType(bd -> replaceAll(bd.getRelevansFor(), oldCode, newCode), BehandlingData.class));
                }
                case AVDELING -> usage.getKrav().forEach(gs -> gs.asType(k -> k.setAvdeling(newCode), Krav.class));
                case UNDERAVDELING -> usage.getKrav().forEach(gs -> gs.asType(k -> k.setUnderavdeling(newCode), Krav.class));
                case LOV -> usage.getKrav().forEach(gs -> gs.asType(k -> replaceLov(oldCode, newCode, k.getRegelverk()), Krav.class));
            }
        }
        return usage;
    }

    private void replaceLov(String oldCode, String newCode, List<Regelverk> regelverk) {
        safeStream(regelverk)
                .filter(lb -> lb.getLov().equals(oldCode))
                .forEach(lb -> lb.setLov(newCode));
    }

    private List<GenericStorage> findKrav(ListName listName, String code) {
        return switch (listName) {
            case RELEVANS -> kravRepo.findByRelevans(code);
            case AVDELING -> kravRepo.findByAvdeling(code);
            case UNDERAVDELING -> kravRepo.findByUnderavdeling(code);
            case LOV -> kravRepo.findByLov(code);
            case TEMA -> List.of();
        };
    }

    private List<GenericStorage> findBehandlinger(ListName listName, String code) {
        return switch (listName) {
            case RELEVANS -> behandlingRepo.findByRelevans(code);
            case AVDELING, UNDERAVDELING, LOV, TEMA -> List.of();
        };
    }

}
