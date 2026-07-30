package it.createlab.gamificationhub.api.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class BadgeCollectionDTO {
    private String id;
    private String name;
    private boolean hidden;
    private List<String> badges;
}
