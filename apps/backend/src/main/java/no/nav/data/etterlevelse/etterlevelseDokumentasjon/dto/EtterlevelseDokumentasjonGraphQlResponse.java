package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonData;

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
        EtterlevelseDokumentasjonData eDokData = etterlevelseDokumentasjon.getEtterlevelseDokumentasjonData();
        return EtterlevelseDokumentasjonGraphQlResponse.builder()
                .id(etterlevelseDokumentasjon.getId())
                .changeStamp(ChangeStampResponse.buildFrom(etterlevelseDokumentasjon))
                .version(etterlevelseDokumentasjon.getVersion())
                .etterlevelseNummer(eDokData.getEtterlevelseNummer())
                .title(eDokData.getTitle())
                .beskrivelse(eDokData.getBeskrivelse())
                .gjenbrukBeskrivelse(eDokData.getGjenbrukBeskrivelse())
                .tilgjengeligForGjenbruk(eDokData.isTilgjengeligForGjenbruk())
                .behandlingIds(eDokData.getBehandlingIds() != null ? copyOf(eDokData.getBehandlingIds()) : List.of())
                .irrelevansFor(etterlevelseDokumentasjon.irrelevantForAsCodes())
                .prioritertKravNummer(eDokData.getPrioritertKravNummer() != null ? copyOf(etterlevelseDokumentasjon.getPrioritertKravNummer()) : List.of())
                .forGjenbruk(eDokData.isForGjenbruk())
                .teams(eDokData.getTeams() != null ? copyOf(eDokData.getTeams()) : List.of())
                .resources(eDokData.getResources() != null ? copyOf(eDokData.getResources()) : List.of())
                .behandlerPersonopplysninger(eDokData.isBehandlerPersonopplysninger())
                .nomAvdelingId(eDokData.getNomAvdelingId())
                .avdelingNavn(eDokData.getAvdelingNavn())
                .seksjoner(eDokData.getSeksjoner() != null ? copyOf(eDokData.getSeksjoner()) : List.of())
                .varslingsadresser(eDokData.getVarslingsadresser() != null ? copyOf(eDokData.getVarslingsadresser()): List.of())
                .build();
    }
}
