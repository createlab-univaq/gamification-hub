package eu.trentorise.game.core;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.trentorise.game.managers.DroolsEngine;

public class Utility {
	private String gameId;

	private long executionMoment;

	private Logger logger = LoggerFactory.getLogger(DroolsEngine.class);

	public Utility(String gameId) {
		this.gameId = gameId;
		this.executionMoment = System.currentTimeMillis();
	}

	public Utility(String gameId, long executionMoment) {
		this.gameId = gameId;
		this.executionMoment = executionMoment;
	}

	/*
	 * The moment the run is considered to happen at, which is what a rule should use
	 * instead of the wall clock: a simulation may be run at any moment, and an
	 * execution may be submitted for one.
	 */
	public Instant getExecutionTime() {
		return Instant.ofEpochMilli(executionMoment);
	}

	public void log(Object msg) {
		LogHub.info(gameId, logger, String.valueOf(msg));
	}

	public Double getDouble(Object o) {
		return Double.valueOf(o.toString());
	}

	public Integer getInteger(Object o) {
		return Integer.valueOf(o.toString());
	}
}
