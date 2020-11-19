package no.nav.data.common.utils;

import org.apache.logging.log4j.util.Strings;
import org.springframework.util.Assert;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.safeStream;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

public final class StringUtils {

    private StringUtils() {
    }

    public static String toUpperCaseAndTrim(String field) {
        return field == null ? null : field.toUpperCase().trim();
    }

    public static List<String> formatList(List<String> strings) {
        return safeStream(strings).map(Strings::trimToNull).filter(Objects::nonNull).collect(Collectors.toList());
    }

    public static List<String> formatListToUppercase(List<String> strings) {
        return safeStream(strings).map(Strings::trimToNull).filter(Objects::nonNull).map(String::toUpperCase).collect(Collectors.toList());
    }

    public static boolean isUUID(String uuid) {
        if (isBlank(uuid)) {
            return false;
        }
        try {
            //noinspection ResultOfMethodCallIgnored
            UUID.fromString(uuid);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public static String insertUuidDashes(String uuid) {
        return uuid.replaceFirst(
                "(\\p{XDigit}{8})(\\p{XDigit}{4})(\\p{XDigit}{4})(\\p{XDigit}{4})(\\p{XDigit}+)",
                "$1-$2-$3-$4-$5"
        );
    }

    public static UUID toUUID(String id) {
        Assert.isTrue(isNotBlank(id) && id.length() >= 32, "invalid id");
        if (!id.contains("-")) {
            id = insertUuidDashes(id);
        }
        Assert.isTrue(StringUtils.isUUID(id), "invalid id");
        return UUID.fromString(id);
    }
}
