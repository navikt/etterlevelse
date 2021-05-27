package no.nav.data.common.web;

import no.nav.data.common.utils.Constants;
import no.nav.data.common.utils.MdcUtils;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import reactor.core.publisher.Mono;

import java.util.Optional;

public class TraceHeaderFilter implements ExchangeFilterFunction {

    private final boolean includeAllHeaders;

    public TraceHeaderFilter(boolean includeAllHeaders) {
        this.includeAllHeaders = includeAllHeaders;
    }

    @Override
    public Mono<ClientResponse> filter(ClientRequest request, ExchangeFunction next) {
        var builder = ClientRequest.from(request);
        var correlationIdPrev = MdcUtils.getCorrelationId();
        var correlationId = MdcUtils.getOrGenerateCorrelationId();
        builder.header(Constants.HEADER_CORRELATION_ID, correlationId);

        if (includeAllHeaders) {
            String callId = Optional.ofNullable(MdcUtils.getCallId()).orElse(correlationId);
            builder.header(Constants.HEADER_CALL_ID, callId);
            builder.header(Constants.HEADER_CONSUMER_ID, no.nav.data.Constants.APP_ID);
        }
        try {
            return next.exchange(builder.build());
        } finally {
            if (correlationIdPrev == null) {
                MdcUtils.clearCorrelationId();
            }
        }
    }
}
