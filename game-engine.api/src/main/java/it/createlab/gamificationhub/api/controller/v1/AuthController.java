package it.createlab.gamificationhub.api.controller.v1;

import it.createlab.gamificationhub.api.common.Origins;
import it.createlab.gamificationhub.api.config.security.AuthTokenResolver;
import it.createlab.gamificationhub.api.model.dto.LoginResponseDTO;
import it.createlab.gamificationhub.api.model.dto.LoginRequestDTO;
import it.createlab.gamificationhub.api.model.dto.UserDTO;
import it.createlab.gamificationhub.api.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Login, logout, registration and account management")
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

    @Operation(summary = "Get current user", description = "Returns the currently authenticated user.")
    @GetMapping("/user")
    public ResponseEntity<UserDTO> getAuthenticatedUser() {
        log.info("Request to get authenticated user info");
        return ResponseEntity.ok(authenticationService.getAuthUser());
    }

    @Operation(summary = "Log in", description = "Authenticates a user and issues a JWT as an httpOnly cookie; for GAME-origin logins the token is also returned in the body.")
    @PostMapping
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        log.info("Login Request: {}", loginRequestDTO);
        String token = authenticationService.createToken(loginRequestDTO.getUsername(), loginRequestDTO.getPassword());
        UserDTO user = authenticationService.getAuthUser();
        LoginResponseDTO loginResponseDTO = new LoginResponseDTO();
        loginResponseDTO.setUser(user);
        if(loginRequestDTO.getOrigin().equals(Origins.GAME)) {
            loginResponseDTO.setToken(token);
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie(token, expiration).toString())
                .body(loginResponseDTO);
    }

    @Operation(summary = "Log out", description = "Clears the authentication cookie.")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        log.info("Logout Request");
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie("", 0).toString())
                .build();
    }

    @Operation(summary = "Register", description = "Creates a new user account.")
    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody LoginRequestDTO signupRequestDTO) {
        log.info("REST request to register user {}", signupRequestDTO.getUsername());
        UserDTO userDTO = authenticationService.registerUser(signupRequestDTO.getUsername(), signupRequestDTO.getPassword());
        log.info("User {} registered successfully", userDTO.getUsername());
        return ResponseEntity.ok(userDTO);
    }

    @Operation(summary = "Deactivate account", description = "Deactivates the currently authenticated user's account.")
    @DeleteMapping("/deactivate")
    public ResponseEntity<Void> deactivateUser() {
        UserDTO loggedUser = authenticationService.getAuthUser();
        log.info("REST request to deactivate user [{}] {}", loggedUser.getId(), loggedUser.getUsername());
        authenticationService.deactivateUser(loggedUser.getId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update account", description = "Updates the currently authenticated user's username and/or password.")
    @PutMapping("/update-user")
    public ResponseEntity<UserDTO> updateUser(@RequestBody LoginRequestDTO requestDTO) {
        log.info("REST request to update currently logged user");
        UserDTO userDTO = authenticationService.updateUser(requestDTO);
        return ResponseEntity.ok(userDTO);
    }

    private ResponseCookie buildAuthCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from(AuthTokenResolver.AUTH_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite(cookieSameSite)
                .build();
    }

}
