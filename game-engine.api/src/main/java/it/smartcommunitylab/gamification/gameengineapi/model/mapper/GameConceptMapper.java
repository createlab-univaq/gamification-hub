package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.BadgeCollectionConcept;
import eu.trentorise.game.model.ChallengeConcept;
import eu.trentorise.game.model.PointConcept;
import eu.trentorise.game.model.core.GameConcept;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.BadgeCollectionDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.PointConceptDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.ChallengeConceptDTO;
import org.mapstruct.Mapper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Mapper(config = EntityMapper.class)
public abstract class GameConceptMapper {

    public Object toDTO(GameConcept gameConcept) {
        if (gameConcept instanceof PointConcept) {
            PointConceptDTO pcDto = new PointConceptDTO();
            pcDto.setName(gameConcept.getName());
            pcDto.setScore(((PointConcept) gameConcept).getScore());
            return pcDto;
        } else if (gameConcept instanceof BadgeCollectionConcept) {
            BadgeCollectionDTO bcDto = new BadgeCollectionDTO();
            bcDto.setName(gameConcept.getName());
            bcDto.setBadges(new ArrayList<>(((BadgeCollectionConcept) gameConcept).getBadgeEarned()));
            return bcDto;
        } else if (gameConcept instanceof ChallengeConcept) {
            ChallengeConcept cc = (ChallengeConcept) gameConcept;
            ChallengeConceptDTO ccDto = new ChallengeConceptDTO();
            ccDto.setName(cc.getName());
            ccDto.setModelName(cc.getModelName());
            ccDto.setState(cc.getState() != null ? cc.getState().toString() : null);
            return ccDto;
        }
        return null;
    }

    public abstract Collection<Object> toDTO(Collection<GameConcept> gameConcepts);

}
