package no.nav.data.pvk.tiltak.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.TeamResponse;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakData;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "pvkDokumentId", "navn", "beskrivelse", "ansvarlig", "frist", "risikoscenarioIds"})
public class TiltakResponse {

    private UUID id;
    private String pvkDokumentId;
    private String navn;
    private String beskrivelse;
    private Resource ansvarlig;
    private TeamResponse ansvarligTeam;
    private LocalDate frist;
    private List<UUID> risikoscenarioIds; // Merk: Settes ikke i buildFrom
    private boolean iverksatt;
    private LocalDate iverksattDato;

    private ChangeStampResponse changeStamp;
    private Integer version;

    public static TiltakResponse buildFrom(Tiltak tiltak) {
        TiltakData td = tiltak.getTiltakData();
        return builder()
                .id(tiltak.getId())
                .changeStamp(ChangeStampResponse.builder()
                        .createdDate(tiltak.getCreatedDate() == null ? LocalDateTime.now() : tiltak.getCreatedDate())
                        .lastModifiedBy(tiltak.getLastModifiedBy())
                        .lastModifiedDate(tiltak.getLastModifiedDate() == null ? LocalDateTime.now() : tiltak.getLastModifiedDate())
                        .build())
                .version(tiltak.getVersion())
                .pvkDokumentId(tiltak.getPvkDokumentId().toString())
                .navn(td.getNavn())
                .beskrivelse(td.getBeskrivelse())
                .ansvarlig(Resource.builder().navIdent(td.getAnsvarlig()).build())
                .ansvarligTeam(TeamResponse.builder().id(td.getAnsvarligTeam()).build())
                .frist(td.getFrist())
                .iverksatt(td.isIverksatt())
                .iverksattDato(td.getIverksattDato())
                .build();
    }
    
}
