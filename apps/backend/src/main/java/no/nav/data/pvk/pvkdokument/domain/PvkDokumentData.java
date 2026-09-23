package no.nav.data.pvk.pvkdokument.domain;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class PvkDokumentData {

    @Builder.Default
    private Integer antallInnsendingTilPvo = 0;
    private boolean dpProcessProfilering;
    private boolean dpProcessHelautomatiskBehandling;
    private List<String> ytterligereEgenskaper;

    @Enumerated(EnumType.STRING)
    private PvkVurdering pvkVurdering;
    private String pvkVurderingsBegrunnelse;
    private Boolean berOmNyVurderingFraPvo;

    private Boolean harInvolvertRepresentant;
    private String representantInvolveringsBeskrivelse;

    private Boolean harDatabehandlerRepresentantInvolvering;
    private String dataBehandlerRepresentantInvolveringBeskrivelse;

    private String merknadTilRisikoeier;
    private String merknadFraRisikoeier;

    private List<MeldingTilPvo> meldingerTilPvo;

    private LocalDateTime godkjentAvRisikoeierDato;
    private String godkjentAvRisikoeier;

    public List<CodelistResponse> ytterligereEgenskaperAsCodes() {
        return CodelistService.getCodelistResponseList(ListName.YTTERLIGERE_EGENSKAPER, ytterligereEgenskaper);
    }

    /**
     * The {@code @Builder.Default} initializer is not applied when Jackson deserializes existing jsonb rows, so this
     * can be {@code null} for legacy/never-sent documents. Treat a missing value as 0 to avoid NPEs where callers
     * unbox the value (e.g. {@code == innsendingId} / {@code > innsendingId}).
     * <p>
     * Note: this is handled per-field rather than by coercing null->0 globally in the Jackson mapper, because the
     * persistence mapper backs Hibernate's dirty-checking and coercing stored nulls to defaults on read would
     * trigger spurious updates.
     */
    public Integer getAntallInnsendingTilPvo() {
        return antallInnsendingTilPvo == null ? 0 : antallInnsendingTilPvo;
    }

}
