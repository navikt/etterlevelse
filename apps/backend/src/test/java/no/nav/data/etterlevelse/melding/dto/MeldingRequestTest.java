package no.nav.data.etterlevelse.melding.dto;

import no.nav.data.etterlevelse.melding.domain.MeldingType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class MeldingRequestTest {

    private MeldingRequest meldingRequest;

    @BeforeEach
    public void initializeMeldingRequest() {
        meldingRequest = MeldingRequest.builder().id("testmelding").meldingType(MeldingType.SYSTEM).build();
    }

    @Test
    void callFormat_correctId_noChange(){
        assertNotNull(meldingRequest.getId());
        meldingRequest.format();
        assertEquals("testmelding", meldingRequest.getId());
    }

    @Test
    void callFormat_idSurroundedBySpace_noSpace() {
        meldingRequest.setId(" test ");
        meldingRequest.format();
        assertEquals("test", meldingRequest.getId());
    }

    @Test
    void callFormat_emptyId_nullValue() {
        meldingRequest.setId("     ");
        meldingRequest.format();
        assertEquals(null, meldingRequest.getId());
    }
}