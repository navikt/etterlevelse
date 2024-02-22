package no.nav.data.etterlevelse.codelist;

import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.codelist.codeusage.CodeUsageService;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodeUsage;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodeUsageRequest;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistNotErasableException;
import no.nav.data.etterlevelse.codelist.dto.CodelistNotFoundException;
import no.nav.data.etterlevelse.codelist.dto.CodelistRequest;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
@RequiredArgsConstructor
public class CodelistService implements InitializingBean {

    private static final String FIELD_NAME_LIST = "list";
    private final CodelistRepository codelistRepository;
    private final CodeUsageService codeUsageService;

    public static Codelist getCodelist(ListName listName, String code) {
        return CodelistCache.getCodelist(listName, code);
    }

    public static CodelistResponse getCodelistResponse(ListName listName, String code) {
        if (code == null) {
            return null;
        }
        Codelist codelist = getCodelist(listName, code);
        if (codelist == null) {
            return new CodelistResponse(listName, code, null, null, null);
        }
        return codelist.toResponse();
    }

    public static List<CodelistResponse> getCodelistResponseList(ListName listName) {
        return convert(CodelistCache.getCodelist(listName), Codelist::toResponse);
    }

    public static List<CodelistResponse> getCodelistResponseList(ListName listName, Collection<String> codes) {
        return convert(codes, code -> getCodelistResponse(listName, code));
    }

    public static List<Codelist> getCodelist(ListName name) {
        return CodelistCache.getCodelist(name);
    }

    public static List<Codelist> getAll() {
        return CodelistCache.getAll();
    }

    @Scheduled(initialDelayString = "PT1M", fixedRateString = "PT1M")
    public void refreshCache() {
        log.info("Refreshing codelist cache");
        List<Codelist> allCodelists = codelistRepository.findAll();
        CodelistCache.init(cache -> allCodelists.forEach(cache::setCode));
    }

    public List<Codelist> save(List<CodelistRequest> requests) {
        List<Codelist> codelists = requests.stream()
                .map(CodelistRequest::convert)
                .collect(Collectors.toList());
        List<Codelist> saved = codelistRepository.saveAll(codelists);
        saved.forEach(CodelistCache::set);
        return saved;
    }

    public List<Codelist> update(List<CodelistRequest> requests) {
        List<Codelist> codelists = requests.stream()
                .map(this::updateDescriptionInRepository)
                .collect(Collectors.toList());

        List<Codelist> saved = codelistRepository.saveAll(codelists);
        saved.forEach(CodelistCache::set);
        return saved;
    }

    public void replaceDataField(Codelist codelist, String fieldName, String oldVal, String newVal) {
        var fresh = codelistRepository.findByListAndCode(codelist.getList(), codelist.getCode()).orElseThrow();
        var field = fresh.getData().get(fieldName);
        if (field == null || !oldVal.equals(field.asText())) {
            return;
        }
        ((ObjectNode) fresh.getData()).put(fieldName, newVal);
        codelistRepository.save(fresh);
    }

    private Codelist updateDescriptionInRepository(CodelistRequest request) {
        Optional<Codelist> byListAndCode = codelistRepository.findByListAndCode(request.getListAsListName(), request.getCode());
        Assert.isTrue(byListAndCode.isPresent(), "item not found, should be validated");
        Codelist codelist = byListAndCode.get(); // All request are validated at this point
        codelist.setShortName(request.getShortName());
        codelist.setDescription(request.getDescription());
        codelist.setData(request.getData());
        return codelist;
    }


    @Transactional(propagation = Propagation.REQUIRED)
    public void delete(ListName name, String code) {
        Optional<Codelist> toDelete = codelistRepository.findByListAndCode(name, code);
        if (toDelete.isEmpty()) {
            log.warn("Cannot find a codelist to delete with code={} and listName={}", code, name);
            throw new CodelistNotFoundException(
                    String.format("Cannot find a codelist to delete with code=%s and listName=%s", code, name));
        }
        validateNonImmutableTypeOfCodelist(name);
        validateCodelistIsNotInUse(name, code);
        codelistRepository.delete(toDelete.get());
        CodelistCache.remove(name, code);
    }

    private void validateCodelistIsNotInUse(ListName name, String code) {
        CodeUsage codeUsage = codeUsageService.findCodeUsage(name, code);
        if (codeUsage.isInUse()) {
            log.warn("The code {} in list {} cannot be erased. {}", code, name, codeUsage.toString());
            throw new CodelistNotErasableException(String.format("The code %s in list %s cannot be erased. %s", code, name, codeUsage.toString()));
        }
    }

    public void validateNonImmutableTypeOfCodelist(ListName listName) {
        Validator.checkIfCodelistIsOfImmutableType(listName);
    }

    public void validateListNameAndCode(String listName, String code) {
        new CodeUsageRequest(listName, code).validate();
    }

    public void validateListNameAndCodes(String listName, List<String> code) {
        for (String c : code) {
            new CodeUsageRequest(listName, c).validate();
        }
    }

    public void validateRequest(List<CodelistRequest> requests) {
        Set<String> requestIds = new HashSet<>();
        requests.forEach(CodelistRequest::format);
        requests.forEach(r -> {
            r.validate();
            if (!requestIds.add(r.getId())) {
                throw new ValidationException("Duplicate request for " + r.getId());
            }
            if (!r.isUpdate() && getCodelist(r.getListAsListName(), r.getCode()) != null) {
                throw new ValidationException("Code already exists " + r.getId());
            }
        });
    }

    @Override
    public void afterPropertiesSet() {
        log.info("Init codelist cache");
        refreshCache();
    }

    @Value
    public static class ListReq implements Validated {

        String listName;

        @Override
        public void validateFieldValues(Validator<?> validator) {
            validator.checkRequiredEnum(FIELD_NAME_LIST, listName, ListName.class);
        }
    }

}