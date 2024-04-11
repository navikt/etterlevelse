package no.nav.data.common.utils;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Comparator;
import java.util.List;

/**
 * See {@link StreamUtils#difference(List, List, Comparator)}
 */
@Data
@AllArgsConstructor
public class CollectionDifference<T> {

    private List<T> before;
    private List<T> after;

    private List<T> removed;
    private List<T> shared;
    private List<T> added;

}
