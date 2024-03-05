package no.nav.data.common.utils;

import jakarta.annotation.PreDestroy;
import jakarta.validation.constraints.NotNull;
import org.slf4j.MDC;
import org.springframework.scheduling.concurrent.CustomizableThreadFactory;
import org.springframework.util.concurrent.ListenableFutureCallback;

import java.util.Map;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

public class MdcExecutor extends ThreadPoolExecutor {

    public static MdcExecutor newThreadPool(int maximumPoolSize, String name) {
        return new MdcExecutor(maximumPoolSize, name);
    }

    private MdcExecutor(int maximumPoolSize, String name) {
        super(1, maximumPoolSize, 60L, TimeUnit.SECONDS, new SynchronousQueue<>(), new CustomizableThreadFactory(name + "-"));
    }

    @Override
    public void execute(Runnable command) {
        var parentContext = MDC.getCopyOfContextMap();
        super.execute(wrap(command, parentContext));
    }

    // TODO: Denne skal fjernes. Se ListenableFutureCallback for hvordan dette kallet erstattes. 
    // Se https://trello.com/c/iSysbdus/356-fjerne-bruk-av-listenablefuturecallback
    @Deprecated(forRemoval = true)
    public static <T> ListenableFutureCallback<? super T> wrap(Consumer<T> onSuccessCallback, Consumer<Throwable> onErrorCallback) {
        var parentContext = MDC.getCopyOfContextMap();
        return new ListenableFutureCallback<T>() {
            @Override
            public void onSuccess(T result) {
                wrap(() -> onSuccessCallback.accept(result), parentContext).run();
            }

            @Override
            public void onFailure(@NotNull Throwable ex) {
                wrap(() -> onErrorCallback.accept(ex), parentContext).run();
            }
        };
    }

    private static Runnable wrap(Runnable runnable, Map<String, String> parentContext) {
        return () -> {
            var previous = MDC.getCopyOfContextMap();
            if (parentContext == null) {
                MDC.clear();
            } else {
                MDC.setContextMap(parentContext);
            }
            try {
                runnable.run();
            } finally {
                if (previous == null) {
                    MDC.clear();
                } else {
                    MDC.setContextMap(previous);
                }
            }
        };
    }

    @Override
    @PreDestroy
    public void shutdown() {
        super.shutdown();
    }
}
