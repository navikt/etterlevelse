package no.nav.data.common.utils;

import lombok.experimental.UtilityClass;

import java.util.List;

@UtilityClass
public class ListUtils {

    public static <V> List<V> nullsafeCopyOf(List<V> source) {
        if (source == null) {
            return List.of();
        } else {
            return List.copyOf(source);
        }
    }

}
