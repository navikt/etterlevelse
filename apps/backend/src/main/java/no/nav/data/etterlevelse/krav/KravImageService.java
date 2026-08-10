package no.nav.data.etterlevelse.krav;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.etterlevelse.krav.domain.KravImage;
import no.nav.data.etterlevelse.krav.domain.KravImageRepo;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KravImageService {

    private final KravImageRepo repo;

    // Skal kun brukes i tester
    public List<KravImage> getAll() {
        return repo.findAll();
    }

    @Transactional
    public List<KravImage> saveAll(List<KravImage> images) {
        return repo.saveAll(images);
    }

}
