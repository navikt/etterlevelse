package no.nav.data.etterlevelse.virkemiddel.dto;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class VirkemiddelNotErasableException extends IllegalStateException{
    public VirkemiddelNotErasableException(String message) {
        super(message);
    }
}
