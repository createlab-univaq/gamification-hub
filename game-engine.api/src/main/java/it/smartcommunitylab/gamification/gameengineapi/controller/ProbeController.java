package it.smartcommunitylab.gamification.gameengineapi.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class ProbeController {

    @Value("${spring.application.name}")
    private String applicationName;


    @GetMapping
    public ResponseEntity<String> readinessProbe() {
        return ResponseEntity.ok("%s: READY".formatted(applicationName));
    }

}
