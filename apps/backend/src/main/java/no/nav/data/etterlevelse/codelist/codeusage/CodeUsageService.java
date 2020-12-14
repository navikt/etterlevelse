package no.nav.data.etterlevelse.codelist.codeusage;

import io.prometheus.client.Summary;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.validator.Validated;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.CodelistService.ListReq;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodeUsage;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodeUsageRequest;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Stream;

import static java.util.Collections.replaceAll;
import static java.util.stream.Collectors.toList;
import static no.nav.data.common.utils.StreamUtils.convert;

@Service
@Transactional
public class CodeUsageService {

    private final KravRepo kravRepo;
    private final Summary summary;

    public CodeUsageService(KravRepo kravRepo) {
        this.kravRepo = kravRepo;
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
        return summary.labels(listName.name()).time(() -> {
            CodeUsage codeUsage = new CodeUsage(listName, code);
            codeUsage.setKrav(findKrav(listName, code));
            return codeUsage;
        });
    }

    @SuppressWarnings({"ResultOfMethodCallIgnored"})
    public CodeUsage replaceUsage(ListName listName, String oldCode, String newCode) {
        var usage = findCodeUsage(listName, oldCode);
        if (usage.isInUse()) {
            switch (listName) {
                case RELEVANS -> usage.getKrav().forEach(gs -> gs.asKrav(k -> replaceAll(k.getRelevansFor(), oldCode, newCode)));
                case AVDELING -> usage.getKrav().forEach(gs -> gs.asKrav(k -> k.setAvdeling(newCode)));
                case UNDERAVDELING -> usage.getKrav().forEach(gs -> gs.asKrav(k -> k.setUnderavdeling(newCode)));
            }
        }
        return usage;
    }

    private List<GenericStorage> findKrav(ListName listName, String code) {
        return switch (listName) {
            case RELEVANS -> kravRepo.findByRelevans(code);
            case AVDELING -> kravRepo.findByAvdeling(code);
            case UNDERAVDELING -> kravRepo.findByUnderavdeling(code);
        };
    }

}
