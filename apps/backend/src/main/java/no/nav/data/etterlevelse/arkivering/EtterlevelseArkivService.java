package no.nav.data.etterlevelse.arkivering;


import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkivRepo;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkivStatus;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivRequest;
import no.nav.data.etterlevelse.common.domain.DomainService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.storage.domain.GenericStorage.convertToDomaionObject;

@Service
@Slf4j
public class EtterlevelseArkivService extends DomainService<EtterlevelseArkiv> {
    private final EtterlevelseArkivRepo repo;


    public EtterlevelseArkivService(EtterlevelseArkivRepo repo) {
        this.repo = repo;
    }

    public Page<EtterlevelseArkiv> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::getDomainObjectData);
    }

    public List<EtterlevelseArkiv> getByWebsakNummer(String websakNummer) {
        return convertToDomaionObject(repo.findByWebsakNummer(websakNummer));
    }

    public List<EtterlevelseArkiv> getByStatus(String status) {
        return convertToDomaionObject(repo.findByStatus(status));
    }

    public List<EtterlevelseArkiv> getByEtterlevelseDokumentasjon(String etterlevelseDokumentasjonId) {
        return convertToDomaionObject(repo.findByEtterlevelseDokumentsjonId(etterlevelseDokumentasjonId));
    }

    public List<EtterlevelseArkiv> setStatusToArkivert() {
        LocalDateTime arkiveringDato = LocalDateTime.now();
        List<EtterlevelseArkiv> tilArkivertStatus = getByStatus(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING.name());
        List<EtterlevelseArkiv> arkivert = new ArrayList<>();
        tilArkivertStatus.forEach(e -> {
            EtterlevelseArkiv etterlevelseArkiv =  save(EtterlevelseArkivRequest.builder()
                    .id(e.getId().toString())
                    .behandlingId(e.getBehandlingId())
                    .etterlevelseDokumentasjonId(e.getEtterlevelseDokumentasjonId())
                    .status(EtterlevelseArkivStatus.ARKIVERT)
                    .arkiveringDato(arkiveringDato)
                    .tilArkiveringDato(e.getTilArkiveringDato())
                    .arkiveringAvbruttDato(e.getArkiveringAvbruttDato())
                    .webSakNummer(e.getWebSakNummer())
                    .update(true)
                    .build());
            arkivert.add(etterlevelseArkiv);
        });

        return arkivert;
    }

    public List<EtterlevelseArkiv> setStatusToBehandler_arkivering() {
        List<EtterlevelseArkiv> tilArkivering = getByStatus(EtterlevelseArkivStatus.TIL_ARKIVERING.name());
        List<EtterlevelseArkiv> behandlerArkivering = new ArrayList<>();
        tilArkivering.forEach(e -> {
            EtterlevelseArkiv etterlevelseArkiv = save(EtterlevelseArkivRequest.builder()
                    .id(e.getId().toString())
                    .behandlingId(e.getBehandlingId())
                    .etterlevelseDokumentasjonId(e.getEtterlevelseDokumentasjonId())
                    .status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING)
                    .arkiveringDato(e.getArkiveringDato())
                    .tilArkiveringDato(e.getTilArkiveringDato())
                    .arkiveringAvbruttDato(e.getArkiveringAvbruttDato())
                    .webSakNummer(e.getWebSakNummer())
                    .update(true)
                    .build());
            behandlerArkivering.add(etterlevelseArkiv);
        });
        return behandlerArkivering;
    }

    public void setStatusWithEtterlevelseDokumentasjonId(EtterlevelseArkivStatus newStatus, String etterlevelseDokumentasjonId) {
        List<EtterlevelseArkiv> arkiveringTilNyStatus = getByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId);
        arkiveringTilNyStatus.forEach(e ->
            save(EtterlevelseArkivRequest.builder()
                    .id(e.getId().toString())
                    .behandlingId(e.getBehandlingId())
                    .etterlevelseDokumentasjonId(e.getEtterlevelseDokumentasjonId())
                    .status(newStatus)
                    .arkiveringDato(e.getArkiveringDato())
                    .tilArkiveringDato(e.getTilArkiveringDato())
                    .arkiveringAvbruttDato(e.getArkiveringAvbruttDato())
                    .webSakNummer(e.getWebSakNummer())
                    .update(true)
                    .build())
        );
    }

    public EtterlevelseArkiv save(EtterlevelseArkivRequest request) {
        var etterlevelseArkiv = request.isUpdate() ? storage.get(request.getIdAsUUID()) : new EtterlevelseArkiv();
        etterlevelseArkiv.convert(request);

        return storage.save(etterlevelseArkiv);
    }

    public void  deleteByEtterlevelseDokumentsjonId(String etterlevelseDokumentasjonId){
        List<EtterlevelseArkiv> etterlevelseArkiver = convertToDomaionObject(repo.findByEtterlevelseDokumentsjonId(etterlevelseDokumentasjonId));
        etterlevelseArkiver.forEach(ea -> log.info("deleting etterlevelse arkiv with id={}, connected to etterlevelse dokumentasjon with id={}", ea.getId(), etterlevelseDokumentasjonId));
        storage.deleteAll(etterlevelseArkiver);

        //return convertToDomaionObject(repo.deleteByEtterlevelseDokumentsjonId(etterlevelseDokumentasjonId));
    }

    public EtterlevelseArkiv delete(UUID id) {
        return storage.delete(id);
    }
}
