package no.nav.data.common.security.jwt;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.extern.slf4j.Slf4j;

import java.security.interfaces.RSAPublicKey;

@Slf4j
public class JwtValidator {

    public static boolean isJwtTokenValid(String token) {
        DecodedJWT jwt = JWT.decode(token);
        JwkProvider provider = new UrlJwkProvider(System.getenv("AZURE_OPENID_CONFIG_JWKS_URI"));
        try {
            log.info("Validating token from: " + jwt.getClaim("azp"));
            Jwk jwk = provider.get(jwt.getKeyId());
            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer("auth0")
                    .build();
            DecodedJWT decodedJwt = verifier.verify(token);

            Claim roles = decodedJwt.getClaim("roles");
            if(roles.asList(String.class).isEmpty()){
                throw new RuntimeException("roles are empty");
            } else if(roles.asList(String.class).contains("Arkiv-Admin")){
                return false;
            }

        }catch (JwkException e){
            log.error("Invalid token: " + e);
            return false;
        }

        return true;

    }



}
