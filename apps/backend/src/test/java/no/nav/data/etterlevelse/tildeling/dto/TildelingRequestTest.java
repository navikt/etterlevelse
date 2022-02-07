package no.nav.data.etterlevelse.tildeling.dto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class TildelingRequestTest {

    private TildelingRequest tildelingRequest;

    @BeforeEach
    public void InitializeTildelt() {
        tildelingRequest = TildelingRequest.builder().id("testtest").build();
    }

    @Test
    void callFormat_correctId_noChange() {
        assertNotNull(tildelingRequest.getId());
        tildelingRequest.format();
        assertEquals("testtest", tildelingRequest.getId());
    }


    @Test
    void callFormat_idSurroundedBySpace_noSpace() {
        tildelingRequest.setId(" test ");
        tildelingRequest.format();
        assertEquals("test", tildelingRequest.getId());
    }

    @Test
    void callFormat_emptyId_nullValue() {
        tildelingRequest.setId("     ");
        tildelingRequest.format();
        assertEquals(null, tildelingRequest.getId());
    }

}