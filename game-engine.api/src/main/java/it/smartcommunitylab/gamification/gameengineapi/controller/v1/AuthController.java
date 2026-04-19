package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.LoginRequestDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.UserDTO;
import it.smartcommunitylab.gamification.gameengineapi.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authenticationService;

    @GetMapping("/user")
    public ResponseEntity<UserDTO> getAuthenticatedUser() {
        log.info("Request to get authenticated user info");
        UserDTO userDTO = authenticationService.getAuthUser();
        log.info("Retrieved info for current authentcated user: {}", userDTO);
        return ResponseEntity.ok(userDTO);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        log.info("Login Request: {}", loginRequestDTO.getUsername());
        String token = authenticationService.createToken(loginRequestDTO.getUsername(), loginRequestDTO.getPassword());
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

}
