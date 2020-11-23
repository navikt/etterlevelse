package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface KravRepo extends JpaRepository<GenericStorage, UUID> {

    @Query(value = "select * from generic_storage where data ->> 'relevansFor' = ?1 and type = 'Krav'", nativeQuery = true)
    List<GenericStorage> findByRelevans(String code);

}
