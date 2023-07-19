package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;

import java.util.List;
import java.util.UUID;

import static java.util.List.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseDokumentasjon implements DomainObject {

    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;

    private Integer etterlevelseNummer;

    private String title;
    private List<String> behandlingIds;
    @Default
    private boolean behandlerPersonopplysninger = true;
    private String virkemiddelId;
    @Default
    private boolean knyttetTilVirkemiddel = true;
    private List<String> teams;
    private List<String> irrelevansFor;

    public List<CodelistResponse> irrelevantForAsCodes() {
        return CodelistService.getCodelistResponseList(ListName.RELEVANS, irrelevansFor);
    }


    public void convert(EtterlevelseDokumentasjonRequest request) {
        etterlevelseNummer = request.getEtterlevelseNummer();
        title = request.getTitle();
        behandlingIds = copyOf(request.getBehandlingIds());
        virkemiddelId = request.getVirkemiddelId();
        irrelevansFor = copyOf(request.getIrrelevansFor());
        teams = copyOf(request.getTeams());
        behandlerPersonopplysninger = request.isBehandlerPersonopplysninger();
        knyttetTilVirkemiddel = request.isKnyttetTilVirkemiddel();
    }

    public EtterlevelseDokumentasjonResponse toResponse() {
        return EtterlevelseDokumentasjonResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .etterlevelseNummer(etterlevelseNummer)
                .title(title)
                .behandlingIds(behandlingIds != null ? copyOf(behandlingIds) : List.of())
                .virkemiddelId(virkemiddelId)
                .irrelevansFor(irrelevantForAsCodes())
                .teams(teams != null ? copyOf(teams) : List.of())
                .behandlerPersonopplysninger(behandlerPersonopplysninger)
                .knyttetTilVirkemiddel(knyttetTilVirkemiddel)
                .build();
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), title);
    }
}
