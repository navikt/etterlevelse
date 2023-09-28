package no.nav.data.etterlevelse.statistikk.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.dto.RegelverkResponse;
import no.nav.data.etterlevelse.krav.dto.SuksesskriterieResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"UUID", "navn", "kravNummer", "kravVersjon"})
public class KravStatistikkResponse {
    private UUID id;
    private LocalDateTime lastModifiedDate;
    private LocalDateTime createdDate;
    private Integer kravNummer;
    private Integer kravVersjon;
    private String navn;
    private List<RegelverkResponse> regelverk;
    private List<String> tagger;
    private List<SuksesskriterieResponse> suksesskriterier;
    private List<String> kravIdRelasjoner;
    private CodelistResponse avdeling;
    private CodelistResponse underavdeling;
    private List<CodelistResponse> relevansFor;
    private KravStatus status;
    private LocalDateTime aktivertDato;
    private String tema;
    private List<LocalDateTime> oppdateringsTidsPunkter;
    private Boolean harNyVersjon;
}