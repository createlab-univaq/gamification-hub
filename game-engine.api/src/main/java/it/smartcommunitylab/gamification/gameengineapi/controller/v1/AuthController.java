package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.LoginRequestDTO;
import it.smartcommunitylab.gamification.gameengineapi.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping
    public ResponseEntity<String> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        log.info("Login Request: {}", loginRequestDTO.getUsername());
        String token = authenticationService.createToken(loginRequestDTO.getUsername(), loginRequestDTO.getPassword());
        return new ResponseEntity<>(token, HttpStatus.OK);
    }

}
