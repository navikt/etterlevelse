package no.nav.data.etterlevelse.graphql.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.UUID;
@Slf4j
@RequiredArgsConstructor
@Controller
public class EtterlevelseGraphQlController {
    private final EtterlevelseService etterlevelseService;
    @QueryMapping
    public EtterlevelseResponse etterlevelseById(@Argument UUID id) {
        log.info("etterlevelse {}", id);

        return etterlevelseService.get(id).toResponse();
    }
}
