package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import eu.trentorise.game.model.BadgeCollectionConcept;
import eu.trentorise.game.model.ChallengeConcept;
import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.model.PointConcept;
import eu.trentorise.game.model.core.GameConcept;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.BadgeCollectionDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.ChallengeConceptDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.PlayerStateDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.simulation.PointConceptDTO;
import org.mapstruct.Mapper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Mapper(config = EntityMapper.class, uses = {GameConceptMapper.class})
public abstract class PlayerStateMapper implements EntityMapper<PlayerStateDTO, PlayerState>{

}
