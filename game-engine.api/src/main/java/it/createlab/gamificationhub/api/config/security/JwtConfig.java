package it.createlab.gamificationhub.api.config.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

@Configuration
public class JwtConfig {

    @Value("${custom.jwt.secret-key}")
    private String secretKey;

    public final static MacAlgorithm ALGORITHM = MacAlgorithm.HS512;

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(getSecretKey()).macAlgorithm(ALGORITHM).build();
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(getSecretKey()));
    }

    @Bean
    public SecretKey getSecretKey() {
        byte[] keyBytes = Base64.decodeBase64(secretKey);
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, ALGORITHM.getName());
    }

}
