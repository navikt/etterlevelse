package no.nav.data.common.security.azure.support;

import com.microsoft.graph.models.BodyType;
import com.microsoft.graph.models.EmailAddress;
import com.microsoft.graph.models.ItemBody;
import com.microsoft.graph.models.Message;
import com.microsoft.graph.models.Recipient;
import lombok.experimental.UtilityClass;

import java.util.List;

@UtilityClass
public class MailMessage {

    public static Message compose(String to, String subject, String messageBody) {
        Message message = new Message();
        message.toRecipients = List.of(recipient(to));
        message.subject = subject;
        message.body = new ItemBody();
        message.body.contentType = BodyType.HTML;
        message.body.content = messageBody;

        return message;
    }

    private static Recipient recipient(String to) {
        Recipient recipient = new Recipient();
        recipient.emailAddress = new EmailAddress();
        recipient.emailAddress.address = to;

        return recipient;
    }

}
