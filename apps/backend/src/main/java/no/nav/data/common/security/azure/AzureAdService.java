package no.nav.data.common.security.azure;

import com.microsoft.graph.models.UserSendMailParameterSet;
import com.microsoft.graph.requests.GraphServiceClient;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.mail.EmailProvider;
import no.nav.data.common.mail.MailTask;
import no.nav.data.common.security.azure.support.MailLog;
import no.nav.data.common.storage.StorageService;
import okhttp3.Request;
import org.springframework.stereotype.Service;

import static no.nav.data.common.security.azure.support.MailMessage.compose;

@Slf4j
@Service
public class AzureAdService implements EmailProvider {

    private final AzureTokenProvider azureTokenProvider;
    private final StorageService<MailLog> storage;

    public AzureAdService(AzureTokenProvider azureTokenProvider, StorageService<MailLog> storage) {
        this.azureTokenProvider = azureTokenProvider;
        this.storage = storage;
    }

    @Override
    public void sendMail(MailTask mailTask) {
        log.info("Sending mail {} to {}", mailTask.getSubject(), mailTask.getTo());
        getMailGraphClient().me()
                .sendMail(UserSendMailParameterSet.newBuilder()
                        .withMessage(compose(mailTask.getTo(), mailTask.getSubject(), mailTask.getBody()))
                        .withSaveToSentItems(false)
                        .build())
                .buildRequest()
                .post();

        storage.save(mailTask.toMailLog());
    }

    private GraphServiceClient<Request> getMailGraphClient() {
        return azureTokenProvider.getGraphClient(azureTokenProvider.getMailAccessToken());
    }

}
