package no.nav.data;


public class LocalAppStarter {

    public static void main(String[] args) {
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
