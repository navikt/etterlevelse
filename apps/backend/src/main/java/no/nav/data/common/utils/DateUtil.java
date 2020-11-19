package no.nav.data.common.utils;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.Locale;

public final class DateUtil {

    public static final String DEFAULT_START = "0001-01-01";
    public static final String DEFAULT_END = "9999-12-31";
    public static final Locale LOCALE_NB = Locale.forLanguageTag("nb");
    public static final DateTimeFormatter NORWEGIAN_FORMAT = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM).withLocale(LOCALE_NB);

    private DateUtil() {
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(DateTimeFormatter.ISO_DATE_TIME);
    }

    public static String formatDateTimeHumanReadable(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(NORWEGIAN_FORMAT);
    }

    public static String formatDate(LocalDate date) {
        return date == null ? null : date.format(DateTimeFormatter.ISO_DATE);
    }

    public static boolean isNow(LocalDate start, LocalDate end) {
        return (start == null || start.minusDays(1).isBefore(LocalDate.now())) &&
                (end == null || end.plusDays(1).isAfter(LocalDate.now()));
    }

    public static LocalDate parse(String date) {
        return date == null ? null : LocalDate.parse(date);
    }

    public static LocalDate parseStart(String start) {
        return start == null ? parse(DEFAULT_START) : parse(start);
    }

    public static LocalDate parseEnd(String end) {
        return end == null ? parse(DEFAULT_END) : parse(end);
    }

    public static Duration uptime() {
        return Duration.ofMillis(ManagementFactory.getRuntimeMXBean().getUptime());
    }
}
