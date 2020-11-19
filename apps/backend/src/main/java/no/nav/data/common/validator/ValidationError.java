package no.nav.data.common.validator;

import lombok.Data;

import java.io.Serializable;

@Data
public class ValidationError implements Serializable {

    private String reference;
    private String errorType;
    private String errorMessage;

    public ValidationError(String reference, String errorType, String errorMessage) {
        this.reference = reference;
        this.errorType = errorType;
        this.errorMessage = errorMessage;
    }

    @Override
    public String toString() {
        return String.format("%s -- %s -- %s", reference, errorType, errorMessage);
    }
}