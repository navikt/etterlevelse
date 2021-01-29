package no.nav.data.etterlevelse.varsel.domain;

public enum AdresseType {
    EPOST,
    SLACK,
    /**
     * uses userId
     * - a user has a slackId that people can use to create conversationId ('channelId') is person/bot specific
     * - slack urls use userId for linking
     */
    SLACK_USER

}
