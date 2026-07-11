package it.smartcommunitylab.gamification.gameengineapi.model.entity;


import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Persistable;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.Instant;
import java.util.Objects;

public abstract class BaseEntity<ID> implements Persistable<ID> {

    @CreatedDate
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant createdAt;

    @LastModifiedDate
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant updatedAt = Instant.now();

    public abstract ID getId();

    public boolean isNew() {
        return Objects.isNull(getId());
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        BaseEntity<?> that = (BaseEntity<?>) o;
        return Objects.equals(getId(), that.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), createdAt, updatedAt);
    }
}
