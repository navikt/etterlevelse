package no.nav.data.etterlevelse.kravprioritylist.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface KravPriorityListRepo extends JpaRepository<GenericStorage<KravPriorityList>, UUID> {

    @Override
    @Query(value = "select * from generic_storage where type = 'KravPriorityList' order by data -> 'temaId'",
            countQuery = "select count(1) from generic_storage where type = 'KravPriorityList'",
            nativeQuery = true)
    Page<GenericStorage<KravPriorityList>> findAll(Pageable page);

    @Query(value = "select * from generic_storage where data ->> 'temaId' ilike %?1% and type = 'KravPriorityList'", nativeQuery = true)
    Optional<GenericStorage<KravPriorityList>>findByTema(String tema);


}
