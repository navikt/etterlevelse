package no.nav.data.pvk.behandlingensArtOgOmfang.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BehandlingensArtOgOmfangRepo extends JpaRepository<BehandlingensArtOgOmfang, UUID> {

    Optional<BehandlingensArtOgOmfang> findByEtterlevelseDokumentasjonId(UUID etterlevelseDokumentasjonId);
}
