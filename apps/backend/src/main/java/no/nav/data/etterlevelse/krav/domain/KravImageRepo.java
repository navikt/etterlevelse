package no.nav.data.etterlevelse.krav.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface KravImageRepo extends JpaRepository<KravImage, UUID> {

    @Override
    @Query(value = "select * from krav_image",
            countQuery = "select count(1) from krav_image",
            nativeQuery = true)
    Page<KravImage> findAll(Pageable pageable);

    List<KravImage> findByKravId(UUID kravId);

}
