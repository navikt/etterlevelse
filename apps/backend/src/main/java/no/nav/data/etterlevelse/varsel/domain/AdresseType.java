package no.nav.data.etterlevelse.varsel.domain;

public enum AdresseType {
    EPOST,
    SLACK,

    // uses slackId, a user has a conversationId (channelId) based on their slackId to send messages, this conversationId is bot specific
    SLACK_USER

}
