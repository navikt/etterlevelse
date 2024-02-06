package no.nav.data.etterlevelse.melding.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface MeldingRepo extends JpaRepository<GenericStorage<Melding>, UUID> {

    @Override
    @Query(value = "select * from generic_storage where type = 'Melding'",
            countQuery = "select count(1) from generic_storage where type = 'Melding'",
            nativeQuery = true)
    Page<GenericStorage<Melding>> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where type = 'Melding' and data ->> 'meldingType' = ?1", nativeQuery = true)
    List<GenericStorage<Melding>> findByMeldingtype(String meldingType);

    @Query(value = "select * from generic_storage where type = 'Melding' and data ->> 'meldingStatus' = ?1", nativeQuery = true)
    List<GenericStorage<Melding>> findByMeldingStatus(String meldingStatus);
}
