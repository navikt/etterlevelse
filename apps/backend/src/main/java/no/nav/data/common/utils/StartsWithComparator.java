package no.nav.data.common.utils;

import org.apache.commons.lang3.StringUtils;

import java.util.Comparator;

import static java.lang.String.CASE_INSENSITIVE_ORDER;

/**
 * String comparator that first sorts strings that start with a given prefix, then alphabetically
 */
public class StartsWithComparator implements Comparator<String> {

    private final String prefix;

    public static Comparator<String> startsWith(String prefix) {
        return new StartsWithComparator(prefix).thenComparing(CASE_INSENSITIVE_ORDER);
    }

    private StartsWithComparator(String prefix) {
        this.prefix = prefix;
    }

    @Override
    public int compare(String o1, String o2) {
        return start(o1) - start(o2);
    }

    private int start(String string) {
        int start = StringUtils.indexOfIgnoreCase(string, prefix);
        return start < 0 ? Integer.MAX_VALUE : start;
    }
}
