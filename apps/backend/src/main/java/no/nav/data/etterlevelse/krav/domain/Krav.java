package no.nav.data.etterlevelse.krav.domain;

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
import lombok.experimental.SuperBuilder;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "KRAV")
public class Krav extends Auditable implements KravId {

    @Id
    @Column(name = "ID")
    private UUID id;

    @Column(name = "KRAV_NUMMER", nullable = false)
    private Integer kravNummer;

    @Column(name = "KRAV_VERSJON", nullable = false)
    @Builder.Default
    private Integer kravVersjon = 1;

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private KravData data = new KravData();

    // Updates all fields from the request except id, kravNummer, kravVersjon, version and changestamp
    public Krav merge(KravRequest request) {
        data.setNavn(request.getNavn());
        data.setBeskrivelse(request.getBeskrivelse());
        data.setHensikt(request.getHensikt());
        data.setUtdypendeBeskrivelse(request.getUtdypendeBeskrivelse());
        data.setVersjonEndringer(request.getVersjonEndringer());

        data.setDokumentasjon(copyOf(request.getDokumentasjon()));
        data.setImplementasjoner(request.getImplementasjoner());
        data.setBegrepIder(copyOf(request.getBegrepIder()));
        data.setVirkemiddelIder(copyOf(request.getVirkemiddelIder()));
        data.setVarslingsadresser(copyOf(request.getVarslingsadresser()));
        data.setRettskilder(copyOf(request.getRettskilder()));
        data.setTagger(copyOf(request.getTagger()));
        data.setRegelverk(StreamUtils.convert(request.getRegelverk(), Regelverk::convert));

        data.setAvdeling(request.getAvdeling());
        data.setUnderavdeling(request.getUnderavdeling());
        data.setRelevansFor(copyOf(request.getRelevansFor()));
        data.setStatus(request.getStatus());
        data.setNotat(request.getNotat());
        data.setVarselMelding(request.getVarselMelding());

        data.setSuksesskriterier(StreamUtils.convert(request.getSuksesskriterier(), Suksesskriterie::fromRequest));
        data.setKravIdRelasjoner(copyOf(request.getKravIdRelasjoner()));
        data.setAktivertDato(request.getAktivertDato());

        return this;
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), data.getNavn(), "K" + kravNummer + "." + kravVersjon);
    }
    
    public boolean supersedes(Krav other) {
        return other.getKravNummer().equals(getKravNummer()) && (
                getStatus().supersedes(other.getStatus())
                        || (!other.getStatus().supersedes(getStatus()) && other.getKravVersjon() < getKravVersjon())
        );
    }

    // The rest is just boilerplate to delegate some getters and setters to data
    
    public KravStatus getStatus() {
        return data.getStatus();
    }

    public void setAktivertDato(LocalDateTime d) {
        data.setAktivertDato(d);
    }

    public List<String> getRelevansFor() {
        return data.getRelevansFor();
    }

    public List<Varslingsadresse> getVarslingsadresser() {
        return data.getVarslingsadresser();
    }
    
    public List<String> getBegrepIder() {
        return data.getBegrepIder();
    }

    public String getNavn() {
        return data.getNavn();
    }

    public String getBeskrivelse() {
        return data.getBeskrivelse();    }

    public String getHensikt() {
        return data.getHensikt();
    }

    public String getUtdypendeBeskrivelse() {
        return data.getUtdypendeBeskrivelse();
    }

    public String getVersjonEndringer() {
        return data.getVersjonEndringer();
    }

    public List<String> getDokumentasjon() {
        return data.getDokumentasjon();
    }

    public String getImplementasjoner() {
        return data.getImplementasjoner();
    }

    public List<String> getVirkemiddelIder() {
        return data.getVirkemiddelIder();
    }

    public List<String> getRettskilder() {
        return data.getRettskilder();
    }

    public List<String> getTagger() {
        return data.getTagger();
    }

    public List<Regelverk> getRegelverk() {
        return data.getRegelverk();
    }

    public String getNotat() {
        return data.getNotat();
    }

    public String getVarselMelding() {
        return data.getVarselMelding();
    }

    public List<Suksesskriterie> getSuksesskriterier() {
          return data.getSuksesskriterier();
    }

    public String getAvdeling() {
        return data.getAvdeling();
    }

    public String getUnderavdeling() {
        return data.getUnderavdeling();
    }

    public List<String> getKravIdRelasjoner() {
        return data.getKravIdRelasjoner();
    }

    public LocalDateTime getAktivertDato() {
        return data.getAktivertDato();
    }

    public void setAvdeling(String avdeling) {
        data.setAvdeling(avdeling);
    }

    public void setUnderavdeling(String avdeling) {
        data.setUnderavdeling(avdeling);
    }

    public void setHensikt(String hensikt) {
        data.setHensikt(hensikt);
    }

    public void setNavn(String navn) {
        data.setNavn(navn);
    }

    public void setRelevansFor(List<String> relevansFor) {
        data.setRelevansFor(relevansFor);
    }

    public void setVarslingsadresser(List<Varslingsadresse> adresser) {
        data.setVarslingsadresser(adresser);
    }

}
