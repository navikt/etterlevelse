package no.nav.data.common.security.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.security.Encryptor;
import org.hibernate.annotations.Type;
import org.springframework.util.Assert;

import java.time.LocalDateTime;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "AUTH")
public class Auth {

    @Id
    @Type(type = "pg-uuid")
    @Column(name = "ID")
    private UUID id;

    @Column(name = "USER_ID")
    private String userId;
    @Column(name = "REFRESH_TOKEN")
    // Doubles as CodeVerifier before session is created
    private String encryptedRefreshToken;
    @Column(name = "INITIATED")
    private LocalDateTime initiated;
    @Column(name = "LAST_ACTIVE")
    private LocalDateTime lastActive;

    @Transient
    private transient Encryptor encryptor;
    @Transient
    private transient String sessionKey;
    @Transient
    private transient String accessToken;

    public Auth addSecret(Encryptor encryptor, String sessionKey) {
        this.encryptor = encryptor;
        this.sessionKey = sessionKey;
        return this;
    }

    public void addAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String decryptRefreshToken() {
        Assert.notNull(encryptor, "not initialized");
        Assert.notNull(sessionKey, "not initialized");
        return encryptor.decrypt(sessionKey + encryptedRefreshToken);
    }

    public String session() {
        return getId().toString().replace("-", "") + sessionKey;
    }

    public String getCodeVerifier() {
        Assert.isTrue(encryptedRefreshToken.length() <= 128, "This session does not contain a CodeVerifier");
        return encryptedRefreshToken;
    }

    public static class AuthBuilder {

        public AuthBuilder generateId() {
            id = UUID.randomUUID();
            return this;
        }
    }
}
