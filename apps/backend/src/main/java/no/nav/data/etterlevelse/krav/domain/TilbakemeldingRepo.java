package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TilbakemeldingRepo extends JpaRepository<GenericStorage<Tilbakemelding>, UUID> {

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and type = 'Tilbakemelding'", nativeQuery = true)
    List<GenericStorage<Tilbakemelding>> findByKravNummer(int nummer);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and data -> 'kravVersjon' = to_jsonb(?2) and type = 'Tilbakemelding'", nativeQuery = true)
    List<GenericStorage<Tilbakemelding>> findByKravNummerAndVersion(int nummer, int versjon);

}
