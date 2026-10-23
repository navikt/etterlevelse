package no.nav.data;

import java.util.TimeZone;

public class LocalAppStarter {

    public static void main(String[] args) {
        // Timestamps are stored as UTC LocalDateTime and serialized with 'Z', like on NAIS where the JVM runs in UTC.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        System.setProperty("user.timezone", "UTC");
        System.setProperty("spring.profiles.active", "local");
        wiremock();
        AppStarter.main(args);
    }

    private static void wiremock() {
        var wiremock = new WiremockExtension();
        wiremock.beforeAll(null);
        System.setProperty("wiremock.server.port", String.valueOf(WiremockExtension.getWiremock().port()));
        wiremock.beforeEach(null);
    }
}
