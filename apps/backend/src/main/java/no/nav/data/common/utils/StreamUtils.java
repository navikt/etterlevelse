package no.nav.data.common.utils;

import no.nav.data.common.exceptions.NotFoundException;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static java.util.Comparator.comparing;
import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toList;

public final class StreamUtils {

    private StreamUtils() {
    }

    /**
     * Get change in two collections based on predicate to match equality
     *
     * @param before collection before
     * @param after collection after
     * @param comparator function to compare if elements are equal
     * @param <T> the type of the collections
     */
    public static <T> CollectionDifference<T> difference(Collection<T> before, Collection<T> after, Comparator<? super T> comparator) {
        List<T> removed = new ArrayList<>(before);
        List<T> shared = new ArrayList<>();
        List<T> added = new ArrayList<>(after);
        removed.removeIf(beforeElement -> {
            for (T afterElement : after) {
                if (comparator.compare(beforeElement, afterElement) == 0) {
                    shared.add(afterElement);
                    added.remove(afterElement);
                    return true;
                }
            }
            return false;
        });
        return new CollectionDifference<>(new ArrayList<>(before), new ArrayList<>(after), removed, shared, added);
    }

    public static <T extends Comparable<T>> CollectionDifference<T> difference(Collection<T> before, Collection<T> after) {
        return difference(before, after, comparing(identity()));
    }

    public static <T> Stream<T> safeStream(Iterable<T> iterable) {
        return iterable == null ? Stream.empty() : StreamSupport.stream(iterable.spliterator(), false);
    }

    public static <T> List<T> nullToEmptyList(Collection<T> list) {
        return list == null ? Collections.emptyList() : new ArrayList<>(list);
    }

    public static <T> List<T> copyOf(List<T> list) {
        return list == null ? Collections.emptyList() : new ArrayList<>(list);
    }

    public static <T> List<T> union(Collection<? extends T> listA, Collection<? extends T> listB) {
        ArrayList<T> list = new ArrayList<>(listA);
        list.addAll(listB);
        return list;
    }

    public static <K, V> Map<K, V> toMap(Iterable<V> from, Function<? super V, K> keyExtractor) {
        return safeStream(from).collect(Collectors.toMap(keyExtractor, Function.identity()));
    }

    public static <K, V> Map<K, List<V>> groupBy(Iterable<V> from, Function<? super V, K> keyExtractor) {
        return safeStream(from).collect(Collectors.groupingBy(keyExtractor));
    }

    public static <T> List<T> distinctByKey(Iterable<T> from, Function<? super T, ?> keyExtractor) {
        return filter(from, distinctByKey(keyExtractor));
    }

    public static <T> Predicate<T> distinctByKey(Function<? super T, ?> keyExtractor) {
        Set<Object> seen = ConcurrentHashMap.newKeySet();
        return t -> seen.add(keyExtractor.apply(t));
    }

    public static <T, F> List<T> convert(Collection<F> from, Function<F, T> converter) {
        return safeStream(from).map(converter).filter(Objects::nonNull).collect(toList());
    }

    public static <T, F> List<T> convertFlat(Collection<F> from, Function<F, Collection<T>> converter) {
        return safeStream(from).map(converter).filter(Objects::nonNull).flatMap(Collection::stream).collect(toList());
    }

    @SafeVarargs
    public static <T, F> List<T> applyAll(Collection<F> from, Function<F, Collection<T>>... converters) {
        return Stream.of(converters)
                .map(f -> convert(from, f))
                .flatMap(Collection::stream)
                .flatMap(Collection::stream)
                .collect(toList());
    }

    @SafeVarargs
    public static <T, F> List<T> applyAll(F from, Function<F, Collection<T>>... converters) {
        return Stream.of(converters)
                .map(f -> f.apply(from))
                .flatMap(Collection::stream)
                .collect(toList());
    }

    public static <T> List<T> filter(Iterable<T> objects, Predicate<T> filter) {
        return safeStream(objects).filter(filter).collect(toList());
    }

    public static <T, U extends Comparable<? super U>> List<T> filterCommonElements(Iterable<T> objects, Iterable<T> compareToObjects,
            Function<? super T, ? extends U> keyExtractor) {
        var comparator = Comparator.comparing(keyExtractor);
        return filter(objects, object -> safeStream(compareToObjects).noneMatch(other -> comparator.compare(object, other) == 0));
    }

    public static <T> T find(Iterable<T> objects, Predicate<T> filter) {
        return safeStream(objects).filter(filter).findFirst().orElseThrow(() -> new NotFoundException("could not find item"));
    }

    public static <T> Optional<T> tryFind(Iterable<T> objects, Predicate<T> filter) {
        return safeStream(objects).filter(filter).findFirst();
    }

    public static <T> boolean exists(Iterable<T> objects, Predicate<T> filter) {
        return tryFind(objects, filter).isPresent();
    }

    public static <T> boolean duplicates(Collection<T> items, Function<? super T, ?> keyExctactor) {
        var distinct = distinctByKey(items, keyExctactor);
        return distinct.size() != items.size();
    }
}
