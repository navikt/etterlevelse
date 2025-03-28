package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.UUID;


@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ETTERLEVELSE_DOKUMENTASJON")
public class EtterlevelseDokumentasjon extends Auditable  {

    @Id
    @Builder.Default
    @Column(name = "ID")
    private UUID id = UUID.randomUUID();

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private EtterlevelseDokumentasjonData etterlevelseDokumentasjonData = new EtterlevelseDokumentasjonData();
    
    public List<CodelistResponse> irrelevantForAsCodes() {
        return CodelistService.getCodelistResponseList(ListName.RELEVANS, etterlevelseDokumentasjonData.getIrrelevansFor());
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), etterlevelseDokumentasjonData.getTitle(), "E" + etterlevelseDokumentasjonData.getEtterlevelseNummer());
    }

    // The rest is just boilerplate to delegate some getters and setters to data
    
    public int getEtterlevelseNummer() {
        return etterlevelseDokumentasjonData.getEtterlevelseNummer();
    }

    public void setEtterlevelseNummer(int nextEtterlevelseDokumentasjonNummer) {
        etterlevelseDokumentasjonData.setEtterlevelseNummer(nextEtterlevelseDokumentasjonNummer);
    }

    public String getTitle() {
        return etterlevelseDokumentasjonData.getTitle();
    }

    public boolean isForGjenbruk() {
        return etterlevelseDokumentasjonData.isForGjenbruk();
    }

    public List<String> getPrioritertKravNummer() {
        return etterlevelseDokumentasjonData.getPrioritertKravNummer();
    }

    public void setPrioritertKravNummer(List<String> prioritertKravNummer) {
        etterlevelseDokumentasjonData.setPrioritertKravNummer(prioritertKravNummer);
    }

    public List<String> getBehandlingIds() {
        return etterlevelseDokumentasjonData.getBehandlingIds();
    }

    public String getAvdeling() {
        return etterlevelseDokumentasjonData.getAvdeling();
    }

    public List<String> getTeams() {
        return etterlevelseDokumentasjonData.getTeams();
    }

    public List<Varslingsadresse> getVarslingsadresser() {
        return etterlevelseDokumentasjonData.getVarslingsadresser();
    }

    public String getVirkemiddelId() {
        return etterlevelseDokumentasjonData.getVirkemiddelId();
    }

    public boolean isTilgjengeligForGjenbruk() {
        return etterlevelseDokumentasjonData.isTilgjengeligForGjenbruk();
    }

    public boolean isKnyttetTilVirkemiddel() {
        return etterlevelseDokumentasjonData.isKnyttetTilVirkemiddel();
    }

    public List<String> getIrrelevansFor() {
        return etterlevelseDokumentasjonData.getIrrelevansFor();
    }

}
