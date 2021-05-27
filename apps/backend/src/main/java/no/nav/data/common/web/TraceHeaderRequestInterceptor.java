package no.nav.data.common.web;

import no.nav.data.common.utils.Constants;
import no.nav.data.common.utils.MdcUtils;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

import java.io.IOException;
import java.util.Optional;

public class TraceHeaderRequestInterceptor implements ClientHttpRequestInterceptor {

    private final boolean includeAllHeaders;

    private TraceHeaderRequestInterceptor(boolean includeAllHeaders) {
        this.includeAllHeaders = includeAllHeaders;
    }

    public static TraceHeaderRequestInterceptor fullInterceptor() {
        return new TraceHeaderRequestInterceptor(true);
    }

    public static TraceHeaderRequestInterceptor correlationInterceptor() {
        return new TraceHeaderRequestInterceptor(false);
    }

    @Override
    public ClientHttpResponse intercept(HttpRequest req, byte[] body, ClientHttpRequestExecution execution) throws IOException {
        var correlationIdPrev = MdcUtils.getCorrelationId();
        String correlationId = MdcUtils.getOrGenerateCorrelationId();
        req.getHeaders().set(Constants.HEADER_CORRELATION_ID, correlationId);

        if (includeAllHeaders) {
            String callId = Optional.ofNullable(MdcUtils.getCallId()).orElse(correlationId);
            req.getHeaders().set(Constants.HEADER_CALL_ID, callId);
            req.getHeaders().set(Constants.HEADER_CONSUMER_ID, no.nav.data.Constants.APP_ID);
        }
        try {
            return execution.execute(req, body);
        } finally {
            if (correlationIdPrev == null) {
                MdcUtils.clearCorrelationId();
            }
        }
    }
}
