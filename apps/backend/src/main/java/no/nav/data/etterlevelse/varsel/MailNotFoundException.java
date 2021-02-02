package no.nav.data.etterlevelse.varsel;

import no.nav.data.common.exceptions.NotFoundException;

public class MailNotFoundException extends NotFoundException {

    public MailNotFoundException(String message) {
        super(message);
    }
}
