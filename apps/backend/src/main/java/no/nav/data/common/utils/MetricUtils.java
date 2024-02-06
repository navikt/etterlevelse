package no.nav.data.common.utils;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.LoadingCache;
import io.prometheus.client.Counter;
import io.prometheus.client.Gauge;
import io.prometheus.client.SimpleCollector;
import io.prometheus.client.Summary;
import io.prometheus.client.cache.caffeine.CacheMetricsCollector;
import no.nav.data.common.exceptions.TechnicalException;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static java.util.Objects.requireNonNull;

/**
 * Helper to create metrics - avoid registring metrics multiple times during test - instantiate labels up front to initialize them in prometheus/grafana
 */
public final class MetricUtils {

    private static final Map<String, SimpleCollector<?>> collectors = new ConcurrentHashMap<>();
    private static final CacheMetricsCollector cacheCollector = new CacheMetricsCollector().register();

    private MetricUtils() {
    }

    public static CounterBuilder counter() {
        return new CounterBuilder();
    }

    public static SummaryBuilder summary() {
        return new SummaryBuilder();
    }

    public static GaugeBuilder gauge() {
        return new GaugeBuilder();
    }

    public static <K, V> Cache<K, V> register(String name, Cache<K, V> cache) {
        cacheCollector.addCache(name, cache);
        return cache;
    }

    public static <K, V> LoadingCache<K, V> register(String name, LoadingCache<K, V> cache) {
        cacheCollector.addCache(name, cache);
        return cache;
    }

    @SuppressWarnings("unchecked")
    private static <T extends SimpleCollector<?>> T register(T collector, List<String[]> labels) {
        try {
            Field nameField = ReflectionUtils.findField(SimpleCollector.class, "fullname");
            requireNonNull(nameField).setAccessible(true);
            String name = ((String) nameField.get(collector));
            SimpleCollector<?> registeredCollector = collectors.computeIfAbsent(name, mapName -> init(collector, labels));
            if (registeredCollector.getClass().isAssignableFrom(collector.getClass())) {
                return (T) registeredCollector;
            } else {
                throw new TechnicalException("Collector allready assigned to different type " + collector);
            }
        } catch (Exception e) {
            throw new TechnicalException("failed to init collector", e);
        }
    }

    private static <T extends SimpleCollector<?>> T init(T collector, List<String[]> labels) {
        // Initialize labels
        for (String[] label : labels) {
            collector.labels(label);
        }
        return collector.register();
    }

    public static class CounterBuilder extends Counter.Builder {

        private final List<String[]> labels = new ArrayList<>();

        @Override
        public Counter register() {
            return MetricUtils.register(super.create(), labels);
        }


        public CounterBuilder labels(String... labels) {
            this.labels.add(labels);
            return this;
        }
    }

    public static class SummaryBuilder extends Summary.Builder {

        private List<String[]> labels = new ArrayList<>();

        @Override
        public Summary register() {
            return MetricUtils.register(super.create(), labels);
        }

        public SummaryBuilder labels(String... labels) {
            this.labels.add(labels);
            return this;
        }

        public SummaryBuilder labels(List<String[]> labels) {
            this.labels = labels;
            return this;
        }
    }

    public static class GaugeBuilder extends Gauge.Builder {

        private List<String[]> labels = new ArrayList<>();

        @Override
        public Gauge register() {
            return MetricUtils.register(super.create(), labels);
        }

        public GaugeBuilder labels(String... labels) {
            this.labels.add(labels);
            return this;
        }

        public GaugeBuilder labels(List<String[]> labels) {
            this.labels = labels;
            return this;
        }
    }
}
