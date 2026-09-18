package no.nav.data.common.utils;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public final class UtcDateTimeUtil {

    private UtcDateTimeUtil() {
    }

    public static String stripTrailingZ(String timestamp) {
        if (timestamp == null || !timestamp.endsWith("Z")) {
            return timestamp;
        }
        return timestamp.substring(0, timestamp.length() - 1);
    }

    public static LocalDateTime roundUpToSecond(LocalDateTime timestamp) {
        // If there are fractional seconds (nanoseconds > 0), round up
        return (timestamp.getNano() > 0)
                ? timestamp.truncatedTo(ChronoUnit.SECONDS).plusSeconds(1)
                : timestamp;
    }
}

