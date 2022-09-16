package no.nav.data.etterlevelse.etterlevelsearkiv.dto;

import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class EtterlevelseArkivRequestTest {

    private EtterlevelseArkivRequest etterlevelseArkivRequest;

    @BeforeEach
    public void initializeEtterlevelseMetadata() {
        etterlevelseArkivRequest = EtterlevelseArkivRequest.builder().id("testtest").build();
    }

    @Test
    void callFormat_correctId_noChange() {
        assertNotNull(etterlevelseArkivRequest.getId());
        etterlevelseArkivRequest.format();
        assertEquals("testtest", etterlevelseArkivRequest.getId());
    }


    @Test
    void callFormat_idSurroundedBySpace_noSpace() {
        etterlevelseArkivRequest.setId(" test ");
        etterlevelseArkivRequest.format();
        assertEquals("test", etterlevelseArkivRequest.getId());
    }

    @Test
    void callFormat_emptyId_nullValue() {
        etterlevelseArkivRequest.setId("     ");
        etterlevelseArkivRequest.format();
        assertEquals(null, etterlevelseArkivRequest.getId());
    }
}
