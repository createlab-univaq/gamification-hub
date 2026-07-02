package it.smartcommunitylab.gamification.gameengineapi.service.impl;

import it.smartcommunitylab.gamification.gameengineapi.config.security.DomainUserDetails;
import it.smartcommunitylab.gamification.gameengineapi.config.security.JwtConfig;
import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.exception.ErrorCodes;
import it.smartcommunitylab.gamification.gameengineapi.exception.RequestException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.UserDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.UserMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.repository.UserRepository;
import it.smartcommunitylab.gamification.gameengineapi.service.AuthenticationService;
import it.smartcommunitylab.gamification.gameengineapi.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
        if(Objects.isNull(userDetails)) {
            throw new RequestException("User not authenticated", "User is currently not authenticated", ErrorCodes.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
        }
        String id = userDetails.getId();
        return userMapper.toDTO(userRepository.findById(id).orElseThrow(()->new UsernameNotFoundException("User not found.")));
    }

}
