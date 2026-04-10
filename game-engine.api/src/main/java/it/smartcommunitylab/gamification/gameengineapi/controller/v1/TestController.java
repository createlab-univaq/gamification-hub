package it.smartcommunitylab.gamification.gameengineapi.controller.v1;

import it.smartcommunitylab.gamification.gameengineapi.exception.EntityNotFoundException;
import it.smartcommunitylab.gamification.gameengineapi.model.dto.TestEntityDTO;
import it.smartcommunitylab.gamification.gameengineapi.model.entity.TestEntity;
import it.smartcommunitylab.gamification.gameengineapi.model.mapper.TestMapper;
import it.smartcommunitylab.gamification.gameengineapi.model.repository.TestRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@Slf4j
@RequiredArgsConstructor
public class TestController {

    private final TestRepository testRepository;

    private final TestMapper testMapper;

    @GetMapping("/{id}")
    public ResponseEntity<TestEntityDTO> getTest(@PathVariable("id") final String id) {
        log.info("Test Endpoint. Requested: {}", id);
        TestEntity entity = testRepository.findById(id).orElseThrow(()->new EntityNotFoundException(id));
        return ResponseEntity.ok(testMapper.toDTO(entity));
    }

    @PostMapping
    public ResponseEntity<TestEntityDTO> postTest(@RequestBody @Valid TestEntityDTO entityDTO) {
        log.info("Post Entity: {}", entityDTO);
        TestEntity entity = testMapper.toEntity(entityDTO);
        entity = testRepository.save(entity);
        return ResponseEntity.ok(testMapper.toDTO(entity));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TestEntityDTO> patchTest(@PathVariable final String id, @RequestBody @Valid TestEntityDTO entityDTO) {
        log.info("Patch Entity: {}", entityDTO);
        entityDTO.setId(id);
        TestEntity entity = testRepository.findById(id).orElseThrow(()->new EntityNotFoundException("Test", id));
        testMapper.updateEntity(entity, entityDTO);
        return ResponseEntity.ok(testMapper.toDTO(testRepository.save(entity)));
    }


}
