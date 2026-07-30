package it.createlab.gamificationhub.api.model.mapper;

import eu.trentorise.game.model.ChallengeInvitation;
import eu.trentorise.game.model.ChallengeInvitation.Player;
import it.createlab.gamificationhub.api.model.dto.ChallengeInvitationDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = EntityMapper.class, uses = {RewardMapper.class, TimeMapper.class})
public interface ChallengeInvitationMapper extends EntityMapper<ChallengeInvitationDTO, ChallengeInvitation> {

    @Override
    @Mapping(target = "proposer", source = "proposerId")
    @Mapping(target = "guests", source = "guestIds")
    @Mapping(target = "challengePointConcept.name", source = "pointConceptName")
    @Mapping(target = "challengePointConcept.period", source = "periodName")
    ChallengeInvitation toEntity(ChallengeInvitationDTO dto);

    default Player toPlayer(String playerId) {
        if (playerId == null) {
            return null;
        }
        Player player = new Player();
        player.setPlayerId(playerId);
        return player;
    }

}
