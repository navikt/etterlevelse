package no.nav.data.etterlevelse.behandlingensLivslop.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface BehandlingensLivslopRepo extends JpaRepository<BehandlingensLivslop, UUID> {

    @Query(value = "select * from behandlingens_livslop where etterlevelse_dokumentasjon_id = ?1", nativeQuery = true)
    Optional<BehandlingensLivslop> findByEtterlevelseDokumentasjonId(String etterlevelseDokumentasjonId);

}
