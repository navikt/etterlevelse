package no.nav.data.etterlevelse.export;


import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Suksesskriterie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;

@Slf4j
@ExtendWith(MockitoExtension.class)
public class KravToDocTest {

    @Mock
    KravService kravService;

    @InjectMocks
    private KravToDoc kravToDoc;

    UUID KRAV_ID = UUID.fromString("f6749fdd-5e95-4507-bd83-b1720aca534e");
    Krav krav = createKrav();

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
        lenient().when(kravService.get(KRAV_ID)).thenReturn(
                Krav.builder()
                        .kravNummer(101)
                        .kravVersjon(1)
                        .navn("Test krav")
                        .status(KravStatus.AKTIV)
                        .hensikt("test 3 **BOLD** \n\n# Header1\n\nvanlig text")
                        .suksesskriterier(List.of(Suksesskriterie.builder()
                                .id(1)
                                .navn("test suksesskriterie")
                                .beskrivelse("test beskrivelse")
                                .behovForBegrunnelse(true)
                                .build()))
                        .beskrivelse("test")
                        .dokumentasjon(List.of("test", "test2"))
                        .build()
        );
    }

    @Test
    void createDocForProcess() {
        var docx = kravToDoc.generateDocForKrav(krav);
        assertThat(docx).isNotNull();
        write(docx);
    }

    @SneakyThrows
    private void write(byte[] docx) {
        Path tempFile = Files.createTempFile("process", ".docx");
        //Path tempFile = Paths.get("/Users/s143147/process.docx");
        Files.write(tempFile, docx);
        log.info("Written to {}", tempFile.toAbsolutePath());
    }

    private Krav createKrav() {
        LocalDateTime today = LocalDateTime.now();

        return Krav.builder()
                .id(KRAV_ID)
                .kravNummer(101)
                .kravVersjon(1)
                .navn("Test krav")
                .status(KravStatus.AKTIV)
                .hensikt("test 3 **BOLD** \n\n# Header1\n\nvanlig text")
                .suksesskriterier(
                        List.of(
                        Suksesskriterie.builder()
                        .id(1)
                        .navn("test suksesskriterie")
                        .beskrivelse("test beskrivelse")
                        .behovForBegrunnelse(true)
                        .build()
                    )
                )
                .changeStamp(
                        ChangeStamp.builder()
                        .lastModifiedBy("A12345 - Test bruker")
                        .lastModifiedDate(today)
                        .build()
                )
                .tagger(List.of("test tag", "test tag 2"))
                .implementasjoner("test implementasjoner")
                .beskrivelse("test")
                .dokumentasjon(List.of("test", "test2"))
                .build();
    }
}
