package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.codelist.CodelistService;
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
    private String behandlingId;
    private List<String> teams;
    private List<String> irrelevansFor;

    public List<CodelistResponse> irrelevantForAsCodes() {
        return CodelistService.getCodelistResponseList(ListName.RELEVANS, irrelevansFor);
    }


    public void convert(EtterlevelseDokumentasjonRequest request) {
        etterlevelseNummer = request.getEtterlevelseNummer();
        title = request.getTitle();
        behandlingId = request.getBehandlingId();
        irrelevansFor = copyOf(request.getIrrelevansFor());
        teams = copyOf(request.getTeams());
    }

    public EtterlevelseDokumentasjonResponse toResponse() {
        return EtterlevelseDokumentasjonResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .etterlevelseNummer(etterlevelseNummer)
                .title(title)
                .behandlingId(behandlingId)
                .irrelevansFor(irrelevantForAsCodes())
                .teams(copyOf(teams))
                .build();
    }
}
