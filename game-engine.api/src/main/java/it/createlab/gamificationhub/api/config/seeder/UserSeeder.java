package it.createlab.gamificationhub.api.config.seeder;

import it.createlab.gamificationhub.api.model.entity.User;
import it.createlab.gamificationhub.api.model.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Executes only when the application is running locally
 */
@Configuration
@Profile("local")
@RequiredArgsConstructor
public class UserSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }
        User user = new User();
        user.setActive(true);
        user.setUsername("admin");
        user.setPassword(passwordEncoder.encode("$Admin1"));
        userRepository.save(user);
    }

}
