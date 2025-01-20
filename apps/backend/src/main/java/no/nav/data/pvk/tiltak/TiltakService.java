package no.nav.data.pvk.tiltak;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakRepo;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class TiltakService {

    private TiltakRepo repo;
    
    public Tiltak get(UUID uuid) {
        return repo.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find behandlingens livsløp with id " + uuid));
    }

}
