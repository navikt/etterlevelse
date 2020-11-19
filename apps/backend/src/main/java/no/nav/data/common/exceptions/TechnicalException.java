package no.nav.data.common.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
@Getter
public class TechnicalException extends RuntimeException {

    private final HttpStatus httpStatus;

    public TechnicalException(String message) {
        super(message);
        this.httpStatus = HttpStatus.OK;
    }

    public TechnicalException(String message, Throwable cause) {
        super(message, cause);
        this.httpStatus = HttpStatus.OK;
    }

    public TechnicalException(String message, Throwable cause, HttpStatus httpStatus) {
        super(message, cause);
        this.httpStatus = httpStatus;
    }
}
