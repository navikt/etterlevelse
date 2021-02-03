package no.nav.data.common.security.azure;

import com.microsoft.graph.models.extensions.IGraphServiceClient;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.mail.EmailProvider;
import no.nav.data.common.mail.MailTask;
import no.nav.data.common.storage.StorageService;
import org.springframework.stereotype.Service;

import static no.nav.data.common.security.azure.support.MailMessage.compose;

@Slf4j
@Service
public class AzureAdService implements EmailProvider {

    private final AzureTokenProvider azureTokenProvider;
    private final StorageService storage;

    public AzureAdService(AzureTokenProvider azureTokenProvider, StorageService storage) {
        this.azureTokenProvider = azureTokenProvider;
        this.storage = storage;
    }

    @Override
    public void sendMail(MailTask mailTask) {
        log.info("Sending mail {} to {}", mailTask.getSubject(), mailTask.getTo());
        getMailGraphClient().me()
                .sendMail(compose(mailTask.getTo(), mailTask.getSubject(), mailTask.getBody()), false)
                .buildRequest()
                .post();

        storage.save(mailTask.toMailLog());
    }

    private IGraphServiceClient getMailGraphClient() {
        return azureTokenProvider.getGraphClient(azureTokenProvider.getMailAccessToken());
    }

}
