package it.createlab.gamificationhub.api;

import it.createlab.gamificationhub.api.config.security.AuthTokenResolver;
import it.createlab.gamificationhub.api.model.entity.User;
import it.createlab.gamificationhub.api.model.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class AuthenticationFlowTests {

    private static final String USERNAME = "tester";
    private static final String PASSWORD = "Password1!";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void seedUser() {
        if (userRepository.findByUsername(USERNAME).isEmpty()) {
            User user = new User();
            user.setActive(true);
            user.setUsername(USERNAME);
            user.setPassword(passwordEncoder.encode(PASSWORD));
            userRepository.save(user);
        }
    }

    @Test
    void unauthenticatedRequestIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/games"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidCredentialsReturnErrorCode() throws Exception {
        mockMvc.perform(post("/api/v1/auth")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"%s\",\"password\":\"wrong\"}".formatted(USERNAME)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("authentication_failed"));
    }

    @Test
    void loginIssuesCookieThatGrantsAccess() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/v1/auth")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"%s\",\"password\":\"%s\"}".formatted(USERNAME, PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value(USERNAME))
                .andReturn();

        Cookie authCookie = login.getResponse().getCookie(AuthTokenResolver.AUTH_COOKIE_NAME);
        assertThat(authCookie).isNotNull();
        assertThat(authCookie.getValue()).isNotBlank();
        assertThat(authCookie.isHttpOnly()).isTrue();

        mockMvc.perform(get("/api/v1/games").cookie(authCookie))
                .andExpect(status().isOk());
    }

}
