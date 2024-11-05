package no.nav.data.etterlevelse.etterlevelse.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.common.domain.KravId;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ETTERLEVELSE")
public class Etterlevelse extends Auditable implements KravId {

    @Id
    @Builder.Default
    @Column(name = "ID")
    private UUID id = UUID.randomUUID();

    @Column(name = "BEHANDLING_ID")
    private String behandlingId;

    @Column(name = "ETTERLEVELSE_DOKUMENTASJON_ID", nullable = false)
    private String etterlevelseDokumentasjonId;

    @Column(name = "KRAV_NUMMER", nullable = false)
    private Integer kravNummer;
    
    @Column(name = "KRAV_VERSJON", nullable = false)
    private Integer kravVersjon;

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private EtterlevelseData etterlevelseData = new EtterlevelseData();
    
    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), behandlingId + "-" + kravId(), "");
    }

    // The rest is just boilerplate to delegate some getters and setters to etterlevelseData
    
    public boolean isEtterleves() {
        return etterlevelseData.isEtterleves();
    }
    
    public void setEtterleves(boolean etterleves) {
        etterlevelseData.setEtterleves(etterleves);
    }
    
    public String getStatusBegrunnelse() {
        return etterlevelseData.getStatusBegrunnelse();
    }
    
    public void setStatusBegrunnelse(String statusBegrunnelse) {
        etterlevelseData.setStatusBegrunnelse(statusBegrunnelse);
    }

    public List<String> getDokumentasjon() {
        return etterlevelseData.getDokumentasjon();
    }
    
    public void setDokumentasjon (List<String> dokumentasjon) {
        etterlevelseData.setDokumentasjon(dokumentasjon);
    }
    
    public LocalDate getFristForFerdigstillelse() {
        return etterlevelseData.getFristForFerdigstillelse();
    }
    
    public void setFristForFerdigstillelse(LocalDate fristForFerdigstillelse) {
        etterlevelseData.setFristForFerdigstillelse(fristForFerdigstillelse);
    }
    
    public EtterlevelseStatus getStatus() {
        return etterlevelseData.getStatus();
    }
    
    public void setStatus (EtterlevelseStatus status) {
        etterlevelseData.setStatus(status);
    }
    
    public List<SuksesskriterieBegrunnelse> getSuksesskriterieBegrunnelser() {
        return etterlevelseData.getSuksesskriterieBegrunnelser();
    }
    
    public void setSuksesskriterieBegrunnelser (List<SuksesskriterieBegrunnelse> suksesskriterieBegrunnelser) {
        etterlevelseData.setSuksesskriterieBegrunnelser(suksesskriterieBegrunnelser);
    }
    
}
