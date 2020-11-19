package no.nav.data.common.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.GATEWAY_TIMEOUT)
public class TimeoutException extends RuntimeException {

    public TimeoutException(String message, Throwable cause) {
        super(message, cause);
    }
}
