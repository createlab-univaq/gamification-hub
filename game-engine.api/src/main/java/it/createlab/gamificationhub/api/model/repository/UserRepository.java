package it.createlab.gamificationhub.api.model.repository;

import it.createlab.gamificationhub.api.model.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByUsername(String username);

    Optional<User> findUserByIdAndActive(String id, boolean active);

}
