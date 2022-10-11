package no.nav.data.common.security.jwt;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.extern.slf4j.Slf4j;

import java.net.MalformedURLException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;

@Slf4j
public class JwtValidator {

    public static DecodedJWT isJwtTokenValid(String token) throws JwkException{
        DecodedJWT jwt = JWT.decode(token);
        try {
            URL azureOpenIdConfig = new URL(System.getenv("AZURE_OPENID_CONFIG_JWKS_URI"));
            JwkProvider provider = new UrlJwkProvider(azureOpenIdConfig);
            log.info("Validating token from: " + jwt.getClaim("azp"));
            Jwk jwk = provider.get(jwt.getKeyId());

            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(System.getenv("AZURE_OPENID_CONFIG_ISSUER"))
                    .withArrayClaim("roles", "arkiv-admin", "access_as_application")
                    .build();
            return verifier.verify(token);
        } catch (MalformedURLException e) {
            log.error("Invalid azure openid config url for jwks uri");
            throw new RuntimeException("Invalid url: " + e);
        }
    }
}
