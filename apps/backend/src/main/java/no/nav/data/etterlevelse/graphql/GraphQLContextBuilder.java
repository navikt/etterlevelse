package no.nav.data.etterlevelse.graphql;

import graphql.kickstart.execution.context.GraphQLKickstartContext;
import graphql.kickstart.servlet.context.GraphQLServletContextBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.websocket.Session;
import javax.websocket.server.HandshakeRequest;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GraphQLContextBuilder implements GraphQLServletContextBuilder {

    private final DataLoaderReg dataLoaderReg;

    @Override
    public GraphQLKickstartContext build(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) {
        Map<Object, Object> map = new HashMap();
        map.put(HttpServletRequest.class, httpServletRequest);
        map.put(HttpServletResponse.class, httpServletResponse);
        return GraphQLKickstartContext.of(dataLoaderReg.create(), map);

    }

    @Override
    public GraphQLKickstartContext build(Session session, HandshakeRequest handshakeRequest) {
        throw new UnsupportedOperationException();
    }

    @Override
    public GraphQLKickstartContext build() {
        throw new UnsupportedOperationException();
    }
}
