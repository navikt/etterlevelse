package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EtterlevelseFieldResolver implements GraphQLResolver<EtterlevelseResponse> {

    private final BehandlingService behandlingService;

    public Behandling behandling(EtterlevelseResponse etterlevelse) {
        return behandlingService.getBehandling(etterlevelse.getBehandlingId());
    }
}
