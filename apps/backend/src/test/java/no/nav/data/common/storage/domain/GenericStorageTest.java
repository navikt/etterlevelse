package no.nav.data.common.storage.domain;

import no.nav.data.common.security.azure.support.MailLog;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class GenericStorageTest {
    
    @Test()
    public void testJsonSerialization() {
        UUID uuid = UUID.randomUUID();
        int version = 666;
        String subj = "777";
        MailLog mlog = new MailLog();
        mlog.setId(uuid);
        mlog.setVersion(version);
        mlog.setSubject(subj);
        GenericStorage<MailLog> gs = new GenericStorage<>();
        gs.setId(uuid);
        gs.setDomainObjectData(mlog);
        String json = gs.getData().toString();
        // Sjekk at attributt fra superklassen blir serialisert...
        assertThat(json).contains("id\":\"" + uuid);
        // Sjekk at attributt fra subklasse blir serialisert...
        assertThat(json).contains("subject\":\"" + subj);
        // Sjekk at attributt fra superklassen ikke blir serialisert når den ikke skal det...
        assertThat(json).doesNotContain("version");
    }

}
