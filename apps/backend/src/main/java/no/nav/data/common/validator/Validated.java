package no.nav.data.common.validator;

public interface Validated {

    default void format() {
    }

    void validateFieldValues(Validator<?> validator);

    default void validate() {
        Validator.validate(this).ifErrorsThrowValidationException();
    }
}
