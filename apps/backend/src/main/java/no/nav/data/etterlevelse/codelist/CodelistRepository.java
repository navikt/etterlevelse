package no.nav.data.etterlevelse.codelist;

import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodelistRepository extends JpaRepository<Codelist, Integer> {

    Optional<Codelist> findByListAndCode(@Param("list") ListName list, @Param("code") String code);

}
