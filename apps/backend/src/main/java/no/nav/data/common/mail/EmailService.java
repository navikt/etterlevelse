package no.nav.data.common.mail;

public interface EmailService {

    void sendMail(MailTask mailTask);

    void scheduleMail(MailTask mailTask);
}
