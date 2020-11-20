package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface KravRepo extends JpaRepository<GenericStorage, UUID> {

}
