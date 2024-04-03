package no.nav.data.common.security.azure;

import com.microsoft.graph.serviceclient.GraphServiceClient;
import com.microsoft.graph.users.item.sendmail.SendMailPostRequestBody;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.mail.EmailProvider;
import no.nav.data.common.mail.MailTask;
import no.nav.data.common.security.azure.support.MailLog;
import no.nav.data.common.storage.StorageService;
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

        SendMailPostRequestBody sendMailPostRequestBody = new SendMailPostRequestBody();
        sendMailPostRequestBody.setMessage(compose(mailTask.getTo(), mailTask.getSubject(), mailTask.getBody()));
        sendMailPostRequestBody.setSaveToSentItems(true);

        getMailGraphClient().me().sendMail().post(sendMailPostRequestBody);

        storage.save(mailTask.toMailLog());
    }

    private GraphServiceClient getMailGraphClient() {
        return azureTokenProvider.getGraphClient(azureTokenProvider.getMailAccessToken());
    }

}
