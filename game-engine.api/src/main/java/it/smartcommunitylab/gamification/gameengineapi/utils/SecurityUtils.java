package it.smartcommunitylab.gamification.gameengineapi.utils;

import it.smartcommunitylab.gamification.gameengineapi.config.security.DomainUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.Objects;

public class SecurityUtils {

    private SecurityUtils(){}


    public static DomainUserDetails getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(Objects.isNull(authentication) || Objects.isNull(authentication.getPrincipal())) {
            return null;
        }
        System.out.println("Hello");
        Object principal = authentication.getPrincipal();
        if(principal instanceof UserDetails) {
            return (DomainUserDetails) principal;
        }
        if(principal instanceof Jwt jwt) {
            String username = jwt.getSubject();
            String id = jwt.getClaimAsString("userId");
            return new DomainUserDetails(id, username, "", List.of());
        }
        return null;
    }

}
