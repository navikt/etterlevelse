package no.nav.data.etterlevelse.melding.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MeldingRepo extends JpaRepository<GenericStorage, UUID> {
}
