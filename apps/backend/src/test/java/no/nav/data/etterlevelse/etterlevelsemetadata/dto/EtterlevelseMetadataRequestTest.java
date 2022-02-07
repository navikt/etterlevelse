package no.nav.data.etterlevelse.etterlevelsemetadata.dto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class EtterlevelseMetadataRequestTest {

    private EtterlevelseMetadataRequest etterlevelseMetadataRequest;

    @BeforeEach
    public void initializeEtterlevelseMetadata() {
        etterlevelseMetadataRequest = EtterlevelseMetadataRequest.builder().id("testtest").build();
    }

    @Test
    void callFormat_correctId_noChange() {
        assertNotNull(etterlevelseMetadataRequest.getId());
        etterlevelseMetadataRequest.format();
        assertEquals("testtest", etterlevelseMetadataRequest.getId());
    }


    @Test
    void callFormat_idSurroundedBySpace_noSpace() {
        etterlevelseMetadataRequest.setId(" test ");
        etterlevelseMetadataRequest.format();
        assertEquals("test", etterlevelseMetadataRequest.getId());
    }

    @Test
    void callFormat_emptyId_nullValue() {
        etterlevelseMetadataRequest.setId("     ");
        etterlevelseMetadataRequest.format();
        assertEquals(null, etterlevelseMetadataRequest.getId());
    }

}