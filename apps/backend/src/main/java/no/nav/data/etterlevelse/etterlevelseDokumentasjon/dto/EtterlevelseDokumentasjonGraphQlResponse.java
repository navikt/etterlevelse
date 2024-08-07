package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;

import java.time.LocalDateTime;
import java.util.List;

import static java.util.List.copyOf;


@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "etterlevelseNummer", "title", "behandlingId"})
public class EtterlevelseDokumentasjonGraphQlResponse extends EtterlevelseDokumentasjonResponse {
    private List<EtterlevelseResponse> etterlevelser;
    private LocalDateTime sistEndretEtterlevelse;
    private LocalDateTime sistEndretEtterlevelseAvMeg;
    private LocalDateTime sistEndretDokumentasjon;
    private LocalDateTime sistEndretDokumentasjonAvMeg;
    private EtterlevelseDokumentasjonStats stats;

    public static EtterlevelseDokumentasjonGraphQlResponse buildFrom(EtterlevelseDokumentasjon etterlevelseDokumentasjon) {
        return EtterlevelseDokumentasjonGraphQlResponse.builder()
                .id(etterlevelseDokumentasjon.getId())
                .changeStamp(etterlevelseDokumentasjon.convertChangeStampResponse())
                .version(etterlevelseDokumentasjon.getVersion())
                .etterlevelseNummer(etterlevelseDokumentasjon.getEtterlevelseNummer())
                .title(etterlevelseDokumentasjon.getTitle())
                .beskrivelse(etterlevelseDokumentasjon.getBeskrivelse())
                .gjenbrukBeskrivelse(etterlevelseDokumentasjon.getGjenbrukBeskrivelse())
                .tilgjengeligForGjenbruk(etterlevelseDokumentasjon.isTilgjengeligForGjenbruk())
                .behandlingIds(etterlevelseDokumentasjon.getBehandlingIds() != null ? copyOf(etterlevelseDokumentasjon.getBehandlingIds()) : List.of())
                .virkemiddelId(etterlevelseDokumentasjon.getVirkemiddelId())
                .irrelevansFor(etterlevelseDokumentasjon.irrelevantForAsCodes())
                .prioritertKravNummer(etterlevelseDokumentasjon.getPrioritertKravNummer() != null ? copyOf(etterlevelseDokumentasjon.getPrioritertKravNummer()) : List.of())
                .forGjenbruk(etterlevelseDokumentasjon.isForGjenbruk())
                .teams(etterlevelseDokumentasjon.getTeams() != null ? copyOf(etterlevelseDokumentasjon.getTeams()) : List.of())
                .resources(etterlevelseDokumentasjon.getResources() != null ? copyOf(etterlevelseDokumentasjon.getResources()) : List.of())
                .behandlerPersonopplysninger(etterlevelseDokumentasjon.isBehandlerPersonopplysninger())
                .knyttetTilVirkemiddel(etterlevelseDokumentasjon.isKnyttetTilVirkemiddel())
                .avdeling(CodelistService.getCodelistResponse(ListName.AVDELING, etterlevelseDokumentasjon.getAvdeling()))
                .varslingsadresser(etterlevelseDokumentasjon.getVarslingsadresser() != null ? copyOf(etterlevelseDokumentasjon.getVarslingsadresser()): List.of())
                .build();
    }
}
