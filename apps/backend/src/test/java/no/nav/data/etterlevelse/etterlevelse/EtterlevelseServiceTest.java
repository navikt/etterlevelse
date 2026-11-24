package no.nav.data.etterlevelse.etterlevelse;

import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieStatus;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.SuksesskriterieBegrunnelseRequest;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravData;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Suksesskriterie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EtterlevelseServiceTest {

    private final EtterlevelseRepo repo = mock(EtterlevelseRepo.class);
    private final KravRepo kravRepo = mock(KravRepo.class);
    private final EtterlevelseService service = new EtterlevelseService(repo, kravRepo);

    @ParameterizedTest
    @EnumSource(SuksesskriterieStatus.class)
    void save_rejectsEachDisabledStatus(SuksesskriterieStatus status) {
        givenKrav(List.of(status));

        assertRejected(request(status));
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void save_rejectsDisabledStatusOnCreateAndUpdate(boolean update) {
        givenKrav(List.of(SuksesskriterieStatus.IKKE_RELEVANT));
        var request = request(SuksesskriterieStatus.IKKE_RELEVANT);
        request.setUpdate(update);
        if (update) {
            request.setId(UUID.randomUUID());
            request.setVersion(1);
        }

        assertRejected(request);
    }

    @ParameterizedTest
    @EnumSource(SuksesskriterieStatus.class)
    void save_allowsEnabledStatusesAndMatchesCriteriaById(SuksesskriterieStatus status) {
        var disabledStatus = status == SuksesskriterieStatus.IKKE_RELEVANT
                ? SuksesskriterieStatus.IKKE_OPPFYLT : SuksesskriterieStatus.IKKE_RELEVANT;
        var krav = givenKrav(List.of(disabledStatus));
        krav.getData().setSuksesskriterier(List.of(
                Suksesskriterie.builder().id(2).deaktiverteSuksesskriterieStatus(List.of(status)).build(),
                krav.getSuksesskriterier().getFirst()));
        when(repo.save(any(Etterlevelse.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var saved = service.save(request(status));

        assertThat(saved.getSuksesskriterieBegrunnelser().getFirst().getSuksesskriterieStatus()).isEqualTo(status);
        verify(repo).save(saved);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void save_allowsLegacyAndEmptyDisabledStatusLists(boolean legacy) {
        givenKrav(legacy ? null : List.of());
        when(repo.save(any(Etterlevelse.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var saved = service.save(request(SuksesskriterieStatus.IKKE_RELEVANT));

        assertThat(saved.getSuksesskriterieBegrunnelser().getFirst().getSuksesskriterieStatus())
                .isEqualTo(SuksesskriterieStatus.IKKE_RELEVANT);
        verify(repo).save(saved);
    }

    @Test
    void save_allowsOmittedBegrunnelser() {
        givenKrav(List.of(SuksesskriterieStatus.IKKE_RELEVANT));
        var request = request(SuksesskriterieStatus.IKKE_RELEVANT);
        request.setSuksesskriterieBegrunnelser(null);
        when(repo.save(any(Etterlevelse.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var saved = service.save(request);

        assertThat(saved.getSuksesskriterieBegrunnelser()).isEmpty();
        verify(repo).save(saved);
    }

    private Krav givenKrav(List<SuksesskriterieStatus> disabledStatuses) {
        var krav = Krav.builder()
                .kravNummer(100)
                .kravVersjon(1)
                .data(KravData.builder()
                        .status(KravStatus.AKTIV)
                        .suksesskriterier(List.of(Suksesskriterie.builder()
                                .id(1)
                                .deaktiverteSuksesskriterieStatus(disabledStatuses)
                                .build()))
                        .build())
                .build();
        when(kravRepo.findByKravNummerAndKravVersjon(100, 1)).thenReturn(Optional.of(krav));
        return krav;
    }

    private EtterlevelseRequest request(SuksesskriterieStatus status) {
        return EtterlevelseRequest.builder()
                .update(false)
                .etterlevelseDokumentasjonId(UUID.randomUUID())
                .kravNummer(100)
                .kravVersjon(1)
                .suksesskriterieBegrunnelser(List.of(SuksesskriterieBegrunnelseRequest.builder()
                        .suksesskriterieId(1)
                        .suksesskriterieStatus(status)
                        .build()))
                .build();
    }

    private void assertRejected(EtterlevelseRequest request) {
        assertThatThrownBy(() -> service.save(request))
                .isInstanceOfSatisfying(ValidationException.class, exception -> {
                    assertThat(exception.get()).hasSize(1);
                    var error = exception.get("DEAKTIVERT_SUKSESSKRITERIE_STATUS");
                    assertThat(error).isNotNull();
                    assertThat(error.getReference()).isEqualTo("suksesskriterieBegrunnelser[0].suksesskriterieStatus");
                    assertThat(error.getErrorMessage()).contains(request.getSuksesskriterieBegrunnelser().getFirst()
                            .getSuksesskriterieStatus().name(), "1", "K100.1");
                });
        verify(repo, never()).save(any(Etterlevelse.class));
    }
}
