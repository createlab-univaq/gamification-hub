package it.smartcommunitylab.gamification.gameengineapi.config.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;

import java.util.Objects;

public class CookieTokenResolver implements BearerTokenResolver {

    public static final String AUTH_COOKIE_NAME = "token";
    @Override
    public String resolve(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if(Objects.isNull(cookies)) {
            return null;
        }
        for(Cookie cookie : cookies) {
            if(AUTH_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

}
