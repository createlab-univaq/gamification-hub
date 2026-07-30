package it.createlab.gamificationhub.api.config.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;

import java.util.Objects;

public class AuthTokenResolver implements BearerTokenResolver {

    public static final String AUTH_COOKIE_NAME = "token";

    @Override
    public String resolve(HttpServletRequest request) {
        String token = getTokenFromCookies(request.getCookies());
        if (Objects.isNull(token)) {
            return getTokenFromHeaders(request);
        }
        return token;
    }

    private String getTokenFromCookies(Cookie[] cookies) {
        if (Objects.isNull(cookies)) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (AUTH_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String getTokenFromHeaders(HttpServletRequest request) {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (Objects.isNull(authorization) || authorization.isBlank()) {
            return null;
        }
        return authorization.replaceFirst("Bearer", "").trim();
    }

}
