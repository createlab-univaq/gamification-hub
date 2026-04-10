package it.smartcommunitylab.gamification.gameengineapi.model.repository;

import it.smartcommunitylab.gamification.gameengineapi.model.entity.TestEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRepository extends MongoRepository<TestEntity, String> {
}
