package no.nav.data.common.utils;

public final class UtcDateTimeUtil {

    private UtcDateTimeUtil() {
    }

    public static String stripTrailingZ(String timestamp) {
        if (timestamp == null || !timestamp.endsWith("Z")) {
            return timestamp;
        }
        return timestamp.substring(0, timestamp.length() - 1);
    }
}

