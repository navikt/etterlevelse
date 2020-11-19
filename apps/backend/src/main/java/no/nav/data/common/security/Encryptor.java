package no.nav.data.common.security;

import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.keygen.KeyGenerators;
import org.springframework.security.crypto.keygen.StringKeyGenerator;
import org.springframework.util.Assert;

public class Encryptor {

    private final String key;
    private static final StringKeyGenerator saltGenerator = KeyGenerators.string();
    private static final int saltLength = saltGenerator.generateKey().length();

    public Encryptor(String key) {
        this.key = key;
    }

    public Enc encrypt(String text) {
        String salt = saltGenerator.generateKey();
        return new Enc(salt, Encryptors.text(key, salt).encrypt(text));
    }

    public String decrypt(String encryptedText) {
        Assert.isTrue(encryptedText != null && encryptedText.length() > saltLength, "invalid encryptionText");
        var enc = new Enc(encryptedText);
        return Encryptors.text(key, enc.salt).decrypt(enc.cipher);
    }

    static String getSalt(String encryptedText) {
        return encryptedText.substring(0, saltLength);
    }

    static String getCipher(String encryptedText) {
        return encryptedText.substring(saltLength);
    }

    public record Enc(String salt, String cipher) {

        public Enc(String saltedCipher) {
            this(getSalt(saltedCipher), getCipher(saltedCipher));
        }

        public String saltedCipher() {
            return salt + cipher;
        }
    }
}
