package it.smartcommunitylab.gamification.gameengineapi.model.mapper;

import it.smartcommunitylab.gamification.gameengineapi.model.dto.ValidationMessageDTO;
import org.drools.drl.parser.MessageImpl;
import org.mapstruct.Mapper;
import org.mapstruct.ObjectFactory;

@Mapper(config = EntityMapper.class)
public interface ValidationMessageMapper extends EntityMapper<ValidationMessageDTO, MessageImpl> {

    @ObjectFactory
    default MessageImpl newMessageImpl(ValidationMessageDTO dto) {
        return new MessageImpl(dto.getId(), dto.getLevel(), null, dto.getText());
    }

}
