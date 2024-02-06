package no.nav.data.etterlevelse.virkemiddel.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface VirkemiddelRepo extends JpaRepository<GenericStorage<Virkemiddel>, UUID> {

    @Override
    @Query(value = "select * from generic_storage where type = 'Virkemiddel' order by data -> 'navn'",
            countQuery = "select count(1) from generic_storage where type = 'Virkemiddel'",
            nativeQuery = true)
    Page<GenericStorage<Virkemiddel>> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where data ->> 'navn' ilike %?1% and type = 'Virkemiddel'", nativeQuery = true)
    List<GenericStorage<Virkemiddel>> findByNameContaining(String name);

    @Query(value = "select * from generic_storage where data ->> 'virkemiddelType' = ?1 and type = 'Virkemiddel'", nativeQuery = true)
    List<GenericStorage<Virkemiddel>> findByVirkemiddelType(String code);
}
