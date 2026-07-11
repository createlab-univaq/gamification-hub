package it.smartcommunitylab.gamification.gameengineapi.config.security;

import it.smartcommunitylab.gamification.gameengineapi.exception.UserNotActiveException;
import it.smartcommunitylab.gamification.gameengineapi.model.entity.User;
import it.smartcommunitylab.gamification.gameengineapi.model.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserSecurityDetails implements UserDetailsService {

    private final UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username).orElseThrow(()->new UsernameNotFoundException("User %s not found".formatted(username)));
        return createSpringSecurityUser(user);
    }

    private DomainUserDetails createSpringSecurityUser(User user) {
        if (Objects.isNull(user) || !user.isActive()) {
            throw new UserNotActiveException();
        }
        // NO ROLES FOR NOW
        List<SimpleGrantedAuthority> authorities = List.of();
        return new DomainUserDetails(user.getId(), user.getUsername(), user.getPassword(), authorities);
    }

}
