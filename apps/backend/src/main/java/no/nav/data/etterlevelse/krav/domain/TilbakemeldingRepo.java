package no.nav.data.etterlevelse.krav.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TilbakemeldingRepo extends JpaRepository<Tilbakemelding, UUID> {

    List<Tilbakemelding> findByKravNummer(int nummer);

    List<Tilbakemelding> findByKravNummerAndKravVersjon(int nummer, int versjon);

}
