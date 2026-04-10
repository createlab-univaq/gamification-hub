package it.smartcommunitylab.gamification.gameengineapi.model.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@Document(collection = "test-entities")
@Data
public class TestEntity extends BaseEntity<String> {

    @Id
    private String id;

    private String value;

    public boolean equals(Object other) {
        if (Objects.isNull(other) || !(other instanceof TestEntity entity)) {
            return false;
        }
        return Objects.deepEquals(this.id, entity.id);
    }

}
