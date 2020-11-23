package no.nav.data.common.validator;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.storage.domain.TypeRegistration;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.Assert;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.regex.Pattern;

import static no.nav.data.common.utils.StreamUtils.nullToEmptyList;
import static no.nav.data.common.utils.StreamUtils.safeStream;
import static no.nav.data.common.utils.StringUtils.isUUID;

@Slf4j
public class Validator<T extends Validated> {

    public static final Pattern NAV_IDENT_PATTERN = Pattern.compile("[A-Z][0-9]{6}");

    public static final String DOES_NOT_EXIST = "doesNotExist";
    public static final String ALREADY_EXISTS = "alreadyExist";
    private static final String ERROR_TYPE_MISSING = "fieldIsNullOrMissing";
    private static final String ERROR_TYPE_PATTERN = "fieldWrongFormat";
    private static final String ERROR_TYPE_ENUM = "fieldIsInvalidEnum";
    private static final String ERROR_TYPE_DATE = "fieldIsInvalidDate";
    private static final String ERROR_TYPE_UUID = "fieldIsInvalidUUID";
    private static final String ERROR_MESSAGE_MISSING = "null or missing";
    private static final String ERROR_MESSAGE_PATTERN = "%s is not valid for pattern '%s'";
    private static final String ERROR_MESSAGE_ENUM = "%s was invalid for type %s";
    private static final String ERROR_MESSAGE_DATE = "%s date is not a valid format";
    private static final String ERROR_MESSAGE_UUID = "%s uuid is not a valid format";

    private final List<ValidationError> validationErrors = new ArrayList<>();
    private final String parentField;
    @Getter
    private final T item;
    private DomainObject domainItem;

    public Validator(T item) {
        this.parentField = "";
        this.item = item;
    }

    public Validator(T item, String parentField) {
        this.parentField = StringUtils.appendIfMissing(parentField, ".");
        this.item = item;
    }

    public static <R extends RequestElement> Validator<R> validate(R item, StorageService storage) {
        Validator<R> validator = validate(item);
        UUID uuid = item.getIdAsUUID();
        String typeOfRequest = TypeRegistration.typeOfRequest(item);
        validator.domainItem = uuid != null && storage.exists(uuid, typeOfRequest) ? storage.get(uuid, typeOfRequest) : null;
        validator.validateRepositoryValues(item, validator.domainItem != null);
        return validator;
    }

    public static <R extends Validated> Validator<R> validate(R item) {
        item.format();
        RequestElement requestElement = item instanceof RequestElement re ? re : null;
        if (requestElement != null) {
            Assert.isTrue(requestElement.getUpdate() != null, "request not initialized");
        }
        Validator<R> validator = new Validator<>(item);
        item.validateFieldValues(validator);
        return validator;
    }

    @SuppressWarnings("unchecked")
    public <D extends DomainObject> D getDomainItem() {
        return (D) domainItem;
    }

    public void checkExists(String id, StorageService storage, Class<? extends DomainObject> aClass) {
        if (isUUID(id) && !storage.exists(UUID.fromString(id), aClass)) {
            String type = TypeRegistration.typeOf(aClass);
            addError(type, Validator.DOES_NOT_EXIST, type + " " + id + " does not exist");
        }
    }

    public boolean checkBlank(String fieldName, String fieldValue) {
        if (StringUtils.isBlank(fieldValue)) {
            validationErrors.add(new ValidationError(getFieldName(fieldName), ERROR_TYPE_MISSING, ERROR_MESSAGE_MISSING));
            return true;
        }
        return false;
    }

    public void checkNull(String fieldName, Object fieldValue) {
        if (fieldValue == null) {
            validationErrors.add(new ValidationError(getFieldName(fieldName), ERROR_TYPE_MISSING, ERROR_MESSAGE_MISSING));
        }
    }

    public void checkPatternRequired(String fieldName, String value, Pattern pattern) {
        if (checkBlank(fieldName, value)) {
            return;
        }
        checkPattern(fieldName, value, pattern);
    }

    public void checkPattern(String fieldName, String value, Pattern pattern) {
        if (StringUtils.isBlank(value)) {
            return;
        }
        if (!pattern.matcher(value).matches()) {
            validationErrors.add(new ValidationError(getFieldName(fieldName), ERROR_TYPE_PATTERN, String.format(ERROR_MESSAGE_PATTERN, value, pattern.toString())));
        }
    }

    public <E extends Enum<E>> void checkRequiredEnum(String fieldName, String fieldValue, Class<E> type) {
        if (checkBlank(fieldName, fieldValue)) {
            return;
        }
        checkEnum(fieldName, fieldValue, type);
    }

    public <E extends Enum<E>> void checkEnum(String fieldName, String fieldValue, Class<E> type) {
        if (StringUtils.isBlank(fieldValue)) {
            return;
        }
        try {
            Enum.valueOf(type, fieldValue);
        } catch (IllegalArgumentException e) {
            validationErrors.add(new ValidationError(getFieldName(fieldName), ERROR_TYPE_ENUM, String.format(ERROR_MESSAGE_ENUM, fieldValue, type.getSimpleName())));
        }
    }

    public void checkDate(String fieldName, String fieldValue) {
        if (StringUtils.isBlank(fieldValue)) {
            return;
        }
        try {
            LocalDate.parse(fieldValue);
        } catch (DateTimeParseException e) {
            validationErrors.add(new ValidationError(getFieldName(fieldName), ERROR_TYPE_DATE, String.format(ERROR_MESSAGE_DATE, fieldValue)));
        }
    }

    public void checkUUID(String fieldName, String fieldValue) {
        if (StringUtils.isBlank(fieldValue)) {
            return;
        }
        try {
            //noinspection ResultOfMethodCallIgnored
            UUID.fromString(fieldValue);
        } catch (Exception e) {
            validationErrors.add(new ValidationError(getFieldName(fieldName), ERROR_TYPE_UUID, String.format(ERROR_MESSAGE_UUID, fieldValue)));
        }
    }

    public void addError(String fieldName, String errorType, String errorMessage) {
        validationErrors.add(new ValidationError(getFieldName(fieldName), errorType, errorMessage));
    }

    public void checkId(RequestElement request) {
        boolean nullId = request.getId() == null;
        boolean update = request.isUpdate();
        if (update && nullId) {
            validationErrors
                    .add(new ValidationError(getFieldName("id"), "missingIdForUpdate", "Request is missing ID for update"));
        } else if (!update && !nullId) {
            validationErrors.add(new ValidationError(getFieldName("id"), "idForCreate", "Request has ID for create"));
        }
    }

    private String getFieldName(String fieldName) {
        return parentField + fieldName;
    }

    public void validateType(String fieldName, Collection<? extends Validated> fieldValues) {
        AtomicInteger i = new AtomicInteger(0);
        safeStream(fieldValues).forEach(fieldValue -> validateType(String.format("%s[%d]", fieldName, i.getAndIncrement()), fieldValue));
    }

    public void validateType(String fieldName, Validated fieldValue) {
        Validator<Validated> validator = new Validator<>(fieldValue, parentField + fieldName);
        fieldValue.format();
        fieldValue.validateFieldValues(validator);
        validationErrors.addAll(validator.getErrors());
    }

    void validateRepositoryValues(RequestElement request, boolean existInRepository) {
        if (creatingExistingElement(request.isUpdate(), existInRepository)) {
            validationErrors.add(new ValidationError(getFieldName("id"), "creatingExisting",
                    String.format("The %s %s already exists and therefore cannot be created", request.getRequestType(), request.getId())));
        }

        if (updatingNonExistingElement(request.isUpdate(), existInRepository)) {
            validationErrors.add(new ValidationError(getFieldName("id"), "updatingNonExisting",
                    String.format("The %s %s does not exist and therefore cannot be updated", request.getRequestType(), request.getId())));
        }
    }

    private boolean creatingExistingElement(boolean isUpdate, boolean existInRepository) {
        return !isUpdate && existInRepository;
    }

    private boolean updatingNonExistingElement(boolean isUpdate, boolean existInRepository) {
        return isUpdate && !existInRepository;
    }

    public void ifErrorsThrowValidationException() {
        if (!validationErrors.isEmpty()) {
            log.warn("The request was not accepted. The following errors occurred during validation:{}", validationErrors);
            throw new ValidationException(validationErrors, "The request was not accepted. The following errors occurred during validation:");
        }
    }

    public final <R> Validator<T> addValidations(Function<? super T, Collection<R>> extractor, BiConsumer<Validator<T>, R> consumer) {
        Collection<R> subItems = extractor.apply(item);
        nullToEmptyList(subItems).forEach(it -> consumer.accept(this, it));
        return this;
    }

    public final Validator<T> addValidations(Consumer<Validator<T>> consumer) {
        consumer.accept(this);
        return this;
    }

    public List<ValidationError> getErrors() {
        return validationErrors;
    }
}