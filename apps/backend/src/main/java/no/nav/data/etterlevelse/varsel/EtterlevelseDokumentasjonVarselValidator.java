package no.nav.data.etterlevelse.varsel;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.varsel.QueuedVarselValidator;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EtterlevelseDokumentasjonVarselValidator implements QueuedVarselValidator {

    private final EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;
    private final SecurityProperties securityProperties;
    private final TeamcatResourceClient teamcatResourceClient;

    @Value("${client.pvo.address}")
    private String pvoEmail;

    @Override
    public boolean shouldStillSend(String etterlevelseDokumentasjonId, String recipient) {
        EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonRepo.findById(UUID.fromString(etterlevelseDokumentasjonId)).orElse(null);
        if (etterlevelseDokumentasjon == null) {
            log.info("Dropping queued varsel: etterlevelse dokumentasjon id={} no longer exists", etterlevelseDokumentasjonId);
            return false;
        }

        if (!securityProperties.isDev()) {
            if (pvoEmail.equals(recipient)) {
                return true;
            }

            if (isRisikoeier(etterlevelseDokumentasjon, recipient)) {
                return true;
            }

            List<Varslingsadresse> varslingsadresser = etterlevelseDokumentasjon.getVarslingsadresser();
            boolean stillValid = varslingsadresser != null && varslingsadresser.stream()
                    .anyMatch(varslingsadresse -> recipient != null && recipient.equals(varslingsadresse.getAdresse()));
            if (!stillValid) {
                log.info("Dropping queued varsel: recipient={} no longer a varslingsadresse on etterlevelse dokumentasjon id={}", recipient, etterlevelseDokumentasjonId);
            }
            return stillValid;
        } else {
            return true;
        }
    }

    private boolean isRisikoeier(EtterlevelseDokumentasjon etterlevelseDokumentasjon, String recipient) {
        if (recipient == null) {
            return false;
        }
        List<String> risikoeiere = etterlevelseDokumentasjon.getEtterlevelseDokumentasjonData().getRisikoeiere();
        if (risikoeiere == null || risikoeiere.isEmpty()) {
            return false;
        }
        return risikoeiere.stream()
                .map(teamcatResourceClient::getResource)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .anyMatch(resource -> recipient.equals(resource.getEmail()));
    }
}