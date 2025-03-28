package no.nav.data.etterlevelse.etterlevelse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;
import static no.nav.data.common.utils.StringUtils.formatList;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseRequest implements RequestElement, KravId {

    private UUID id;

    private String behandlingId;
    private UUID etterlevelseDokumentasjonId;
    private Integer kravNummer;
    private Integer kravVersjon;

    private boolean etterleves;
    private String statusBegrunnelse;
    private List<String> dokumentasjon;
    private LocalDate fristForFerdigstillelse;
    private EtterlevelseStatus status;
    private List<SuksesskriterieBegrunnelseRequest> suksesskriterieBegrunnelser;

    private Boolean update;
    private boolean prioritised;

    @Override
    public void format() {
        setBehandlingId(trimToNull(behandlingId));
        setStatusBegrunnelse(trimToNull(statusBegrunnelse));
        setDokumentasjon(formatList(dokumentasjon));
        setSuksesskriterieBegrunnelser(copyOf(suksesskriterieBegrunnelser));

        if (status == null) {
            status = EtterlevelseStatus.UNDER_REDIGERING;
        }
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkNull(Fields.kravNummer, kravNummer);
        validator.checkNull(Fields.kravVersjon, kravVersjon);
    }
    
    // Updates all fields from the request except id, version and changestamp
    public Etterlevelse mergeInto(Etterlevelse etterlevelse) {
        etterlevelse.setBehandlingId(behandlingId);
        etterlevelse.setEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId);
        etterlevelse.setKravNummer(kravNummer);
        etterlevelse.setKravVersjon(kravVersjon);

        etterlevelse.setEtterleves(etterleves);
        etterlevelse.setStatusBegrunnelse(statusBegrunnelse);
        etterlevelse.setDokumentasjon(copyOf(dokumentasjon));
        etterlevelse.setFristForFerdigstillelse(fristForFerdigstillelse);
        etterlevelse.setStatus(status);
        etterlevelse.setSuksesskriterieBegrunnelser(StreamUtils.convert(suksesskriterieBegrunnelser, SuksesskriterieBegrunnelseRequest::convertTo));
        return etterlevelse;
    }

}
