package no.nav.data.etterlevelse.varsel;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.varsel.QueuedVarselValidator;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

@Slf4j
@Service
@RequiredArgsConstructor
public class EtterlevelseDokumentasjonVarselValidator implements QueuedVarselValidator {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    @Override
    public boolean shouldStillSend(String etterlevelseDokumentasjonId, String recipient) {
        EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(etterlevelseDokumentasjonId));
        if (etterlevelseDokumentasjon == null) {
            log.info("Dropping queued varsel: etterlevelse dokumentasjon id={} no longer exists", etterlevelseDokumentasjonId);
            return false;
        }
        List<Varslingsadresse> varslingsadresser = etterlevelseDokumentasjon.getVarslingsadresser();
        boolean stillValid = varslingsadresser != null && varslingsadresser.stream()
                .anyMatch(varslingsadresse -> recipient != null && recipient.equals(varslingsadresse.getAdresse()));
        if (!stillValid) {
            log.info("Dropping queued varsel: recipient={} no longer a varslingsadresse on etterlevelse dokumentasjon id={}", recipient, etterlevelseDokumentasjonId);
        }
        return stillValid;
    }
}
