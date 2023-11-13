package no.nav.data.etterlevelse.kravprioritering.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.domain.KravStatus;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "kravNummer", "kravVersjon", "prioriteringsId"})
public class KravPrioriteringResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;
    private Integer kravNummer;
    private Integer kravVersjon;
    private String prioriteringsId;

    // GraphQL only
    @JsonIgnore
    private String kravNavn;
    @JsonIgnore
    private List<EtterlevelseResponse> etterlevelser;
    @JsonIgnore
    private KravStatus kravStatus;
}
