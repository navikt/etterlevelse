package no.nav.data.etterlevelse.codelist.dto;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class CodelistNotErasableException extends IllegalStateException {

    public CodelistNotErasableException(String message) {
        super(message);
    }
}
