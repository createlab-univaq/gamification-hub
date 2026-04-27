package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.BadgeCollectionConcept;
import eu.trentorise.game.model.ChallengeConcept;
import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.model.PointConcept;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.BadgeCollectionDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.ChallengeConceptDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.PlayerStateDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.PointConceptDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.ArrayList;
import java.util.List;

@Mapper(config = EntityMapper.class)
public abstract class PlayerStateMapper implements EntityMapper<PlayerStateDTO, PlayerState> {

    @Mapping(target = "pointConcepts", expression = "java(extractPointConcepts(state))")
    @Mapping(target = "badgeCollections", expression = "java(extractBadgeCollections(state))")
    @Mapping(target = "challenges", expression = "java(extractChallenges(state))")
    public abstract PlayerStateDTO toDTO(PlayerState state);

    protected List<PointConceptDTO> extractPointConcepts(PlayerState state) {
        if (state.getState() == null) return new ArrayList<>();
        List<PointConceptDTO> result = new ArrayList<>();
        state.getState().stream()
                .filter(gc -> gc instanceof PointConcept)
                .map(gc -> (PointConcept) gc)
                .forEach(pc -> {
                    PointConceptDTO dto = new PointConceptDTO();
                    dto.setName(pc.getName());
                    dto.setScore(pc.getScore());
                    result.add(dto);
                });
        return result;
    }

    protected List<BadgeCollectionDTO> extractBadgeCollections(PlayerState state) {
        if (state.getState() == null) return new ArrayList<>();
        List<BadgeCollectionDTO> result = new ArrayList<>();
        state.getState().stream()
                .filter(gc -> gc instanceof BadgeCollectionConcept)
                .map(gc -> (BadgeCollectionConcept) gc)
                .forEach(bc -> {
                    BadgeCollectionDTO dto = new BadgeCollectionDTO();
                    dto.setName(bc.getName());
                    dto.setBadges(new ArrayList<>(bc.getBadgeEarned()));
                    result.add(dto);
                });
        return result;
    }

    protected List<ChallengeConceptDTO> extractChallenges(PlayerState state) {
        if (state.getState() == null) return new ArrayList<>();
        List<ChallengeConceptDTO> result = new ArrayList<>();
        state.getState().stream()
                .filter(gc -> gc instanceof ChallengeConcept)
                .map(gc -> (ChallengeConcept) gc)
                .forEach(cc -> {
                    ChallengeConceptDTO dto = new ChallengeConceptDTO();
                    dto.setName(cc.getName());
                    dto.setModelName(cc.getModelName());
                    dto.setState(cc.getState() != null ? cc.getState().toString() : null);
                    result.add(dto);
                });
        return result;
    }
}
