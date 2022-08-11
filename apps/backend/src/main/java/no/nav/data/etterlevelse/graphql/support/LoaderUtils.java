package no.nav.data.etterlevelse.graphql.support;

import graphql.schema.DataFetchingEnvironment;
import lombok.experimental.UtilityClass;
import lombok.val;
import org.dataloader.DataLoader;

import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;

@UtilityClass
public class LoaderUtils {

    public static <K, V> DataLoader<K, V> get(DataFetchingEnvironment env, String loaderName) {
        val registry = env.getDataLoaderRegistry();
        return registry.getDataLoader(loaderName);
    }

    public static <K, V> CompletableFuture<V> get(DataFetchingEnvironment env, String loaderName, K key) {
        var loader = LoaderUtils.<K, V>get(env, loaderName);
        return loader.load(key, env);
    }

    public static <K, V, R> CompletableFuture<R> get(DataFetchingEnvironment env, String loaderName, K key, Function<V, R> transformer) {
        var result = LoaderUtils.<K, V>get(env, loaderName, key);
        return result.thenApply(r -> Optional.ofNullable(r).map(transformer).orElse(null));
    }

}
