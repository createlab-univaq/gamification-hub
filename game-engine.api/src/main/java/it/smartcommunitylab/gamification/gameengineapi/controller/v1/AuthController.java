package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import it.smartcommunitylab.gamification.gameengineapi.config.security.CookieTokenResolver;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.LoginRequestDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.UserDTO;
import it.smartcommunitylab.gamification.gameengineapi.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authenticationService;

    @Value("${custom.jwt.expiration:86400}")
    private long expiration;

    @Value("${custom.jwt.cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${custom.jwt.cookie.same-site:Strict}")
    private String cookieSameSite;

    @GetMapping("/user")
    public ResponseEntity<UserDTO> getAuthenticatedUser() {
        log.info("Request to get authenticated user info");
        return ResponseEntity.ok(authenticationService.getAuthUser());
    }

    @PostMapping
    public ResponseEntity<UserDTO> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        log.info("Login Request: {}", loginRequestDTO.getUsername());
        String token = authenticationService.createToken(loginRequestDTO.getUsername(), loginRequestDTO.getPassword());
        UserDTO user = authenticationService.getAuthUser();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie(token, expiration).toString())
                .body(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        log.info("Logout Request");
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie("", 0).toString())
                .build();
    }

    private ResponseCookie buildAuthCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from(CookieTokenResolver.AUTH_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite(cookieSameSite)
                .build();
    }

}
