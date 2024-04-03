package no.nav.data.common.security.azure.support;

import com.microsoft.graph.http.GraphServiceException;
import com.microsoft.graph.logger.ILogger;
import com.microsoft.graph.logger.LoggerLevel;
import lombok.extern.slf4j.Slf4j;

import java.net.SocketTimeoutException;

@Slf4j
public class GraphLogger implements ILogger {

    @Override
    public void setLoggingLevel(LoggerLevel level) {

    }

    @Override
    public LoggerLevel getLoggingLevel() {
        return null;
    }

    @Override
    public void logDebug(String message) {
        log.debug(message);
    }

    @Override
    public void logError(String message, Throwable throwable) {
        if (isNotError(throwable)) {
            log.debug(message, throwable);
            return;
        } else if (isWarning(throwable)) {
            log.warn(message, throwable);
            return;
        }
        log.error(message, throwable);
    }

    private boolean isWarning(Throwable throwable) {
        return throwable.getCause() instanceof SocketTimeoutException;
    }

    private boolean isNotError(Throwable throwable) {
        return throwable instanceof GraphServiceException e && isNotError(e);
    }

    public static boolean isNotError(GraphServiceException e) {
        if (e.getResponseCode() == 404) {
            return true;
        } else if ("MailboxNotHostedInExchangeOnline".equals(e.getServiceError().code)) {
            log.warn("MailboxNotHostedInExchangeOnline");
            return true;
        }
        return false;
    }
}