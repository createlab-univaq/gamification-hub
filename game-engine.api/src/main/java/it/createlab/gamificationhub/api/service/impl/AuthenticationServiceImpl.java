package it.createlab.gamificationhub.api.service.impl;

import it.createlab.gamificationhub.api.config.security.DomainUserDetails;
import it.createlab.gamificationhub.api.config.security.JwtConfig;
import it.createlab.gamificationhub.api.exception.ErrorCodes;
import it.createlab.gamificationhub.api.exception.RequestException;
import it.createlab.gamificationhub.api.model.dto.LoginRequestDTO;
import it.createlab.gamificationhub.api.model.dto.UserDTO;
import it.createlab.gamificationhub.api.model.entity.User;
import it.createlab.gamificationhub.api.model.mapper.UserMapper;
import it.createlab.gamificationhub.api.model.repository.UserRepository;
import it.createlab.gamificationhub.api.service.AuthenticationService;
import it.createlab.gamificationhub.api.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final JwtEncoder jwtEncoder;

    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    private final UserRepository userRepository;

    private final UserMapper userMapper;

    private final PasswordEncoder passwordEncoder;

    @Value("${custom.jwt.expiration:86400}")
    private Long expiration;

    private String createToken(Authentication authentication) {
        Instant now = Instant.now();
        Instant expireAt = now.plusSeconds(expiration);
        DomainUserDetails userDetails = (DomainUserDetails) authentication.getPrincipal();
        JwtClaimsSet jwtClaimsSet = JwtClaimsSet.builder()
                .issuedAt(Instant.now())
                .expiresAt(expireAt)
                .subject(authentication.getName())
                .claim("userId", userDetails.getId())
                .build();
        JwsHeader jwsHeader = JwsHeader.with(JwtConfig.ALGORITHM).build();
        return this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, jwtClaimsSet)).getTokenValue();
    }

    private User findUserOrThrow(String id) {
        return userRepository.findUserByIdAndActive(id, true).orElseThrow(()->new UsernameNotFoundException("User not found"));
    }

    @Override
    public String createToken(String username, String password) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, password);
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return this.createToken(authentication);
    }

    @Override
    public UserDTO getAuthUser() {
        DomainUserDetails userDetails = SecurityUtils.getCurrentUser();
        if (Objects.isNull(userDetails)) {
            throw new RequestException("User not authenticated", "User is currently not authenticated", ErrorCodes.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
        }
        User user = findUserOrThrow(userDetails.getId());
        return userMapper.toDTO(user);
    }

    @Override
    public UserDTO registerUser(String username, String password) {
        log.info("Request to create user {}", username);
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RequestException("User already exists", "Username already taken", ErrorCodes.USERNAME_ALREADY_TAKEN, HttpStatus.BAD_REQUEST);
        }
        User user = new User();
        user.setActive(true);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    public void deactivateUser(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setActive(false);
        userRepository.save(user);
        log.info("User {} successfully deactivated", user.getUsername());
    }

    @Override
    public UserDTO updateUser(LoginRequestDTO requestDTO) {
        DomainUserDetails userDetails = SecurityUtils.getCurrentUser();
        if (Objects.isNull(userDetails)) {
            throw new RequestException("User not authenticated", "User is currently not authenticated", ErrorCodes.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
        }
        log.info("Request to update current user {}", userDetails.getUsername());
        User currentUser = findUserOrThrow(userDetails.getId());
        if(userRepository.findByUsername(requestDTO.getUsername()).isPresent() && !currentUser.getUsername().equals(requestDTO.getUsername())) {
            throw new RequestException("User already exists", "Username already taken", ErrorCodes.USERNAME_ALREADY_TAKEN, HttpStatus.BAD_REQUEST);
        }
        String password = Objects.isNull(requestDTO.getPassword()) || requestDTO.getPassword().isBlank() ? currentUser.getPassword() : passwordEncoder.encode(requestDTO.getPassword());
        currentUser.setUsername(Objects.requireNonNullElse(requestDTO.getUsername(), currentUser.getUsername()));
        currentUser.setPassword(password);
        return userMapper.toDTO(userRepository.save(currentUser));
    }

}
