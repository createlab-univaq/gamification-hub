package it.createlab.gamificationhub.api.model.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@EqualsAndHashCode(callSuper = true)
@Document("users")
@Data
public class User extends BaseEntity<String> {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String password;

    private boolean active;

}
