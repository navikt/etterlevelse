package no.nav.data.common.varsel;

/**
 * Validates a queued varsel just before it is sent. Queued Slack/mail messages hold a frozen
 * recipient snapshot and may sit in the work table for days before being flushed, so the target
 * document may have been deleted or had its varslingsadresser changed in the meantime.
 */
public interface QueuedVarselValidator {

    /**
     * @return true if the message should still be sent, false if the target document no longer
     * exists or the recipient is no longer among the document's current varslingsadresser.
     */
    boolean shouldStillSend(String etterlevelseDokumentasjonId, String recipient);
}
