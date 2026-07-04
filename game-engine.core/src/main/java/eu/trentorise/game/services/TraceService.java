package eu.trentorise.game.services;

import java.util.Map;

import eu.trentorise.game.model.PlayerState;

public interface TraceService {

	public void tracePlayerMove(PlayerState old, PlayerState newOne,
			Map<String, Object> inputData, long executionTime);
}
