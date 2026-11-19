package no.nav.data.etterlevelse.krav.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TilbakemeldingRepo extends JpaRepository<Tilbakemelding, UUID> {

    List<Tilbakemelding> findByKravNummer(int kravNummer);

    List<Tilbakemelding> findByKravNummerAndKravVersjon(int kravNummer, int kravVersjon);

}
