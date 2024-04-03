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
        ItemBody body = new ItemBody();
        body.setContentType(BodyType.Html);
        body.setContent(messageBody);

        message.setToRecipients(List.of(recipient(to)));
        message.setSubject(subject);
        message.setBody(body);

        return message;
    }

    private static Recipient recipient(String to) {
        Recipient recipient = new Recipient();
        EmailAddress emailAddress = new EmailAddress();
        emailAddress.setAddress(to);

        recipient.setEmailAddress(emailAddress);

        return recipient;
    }

}
