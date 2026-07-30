package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.PlayerState;
import it.createlab.gamificationhub.api.model.dto.BadgeCollectionDTO;
import it.createlab.gamificationhub.api.model.dto.PointConceptDTO;
import it.createlab.gamificationhub.api.model.dto.simulation.ChallengeConceptDTO;
import it.createlab.gamificationhub.api.model.dto.simulation.PlayerStateDTO;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(config = EntityMapper.class, uses={InventoryMapper.class})
public abstract class PlayerStateMapper implements EntityMapper<PlayerStateDTO, PlayerState> {

    @Autowired
    protected PointConceptMapper pointConceptMapper;

    @Autowired
    protected BadgeCollectionMapper badgeCollectionMapper;

    @Autowired
    protected ChallengeConceptMapper challengeConceptMapper;

    @AfterMapping
    protected void mapConcepts(@MappingTarget PlayerStateDTO playerStateDTO, PlayerState playerState) {
        List<PointConceptDTO> pointConcepts = pointConceptMapper.toDTO(playerState.pointConcepts());
        List<ChallengeConceptDTO> challengeConcepts = challengeConceptMapper.toDTO(playerState.challenges());
        List<BadgeCollectionDTO> badgeCollections = badgeCollectionMapper.toDTO(playerState.badgeCollectionConcepts());
        playerStateDTO.setPointConcepts(pointConcepts);
        playerStateDTO.setChallenges(challengeConcepts);
        playerStateDTO.setBadgeCollections(badgeCollections);
    }

}
