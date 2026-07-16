package eu.trentorise.game.model.core;

public class ClassificationPosition {
	private double score;
	private String playerId;
	private boolean team;

	public ClassificationPosition(double score, String playerId) {
		this.score = score;
		this.playerId = playerId;
	}

	public ClassificationPosition(double score, String playerId, boolean team) {
		this.score = score;
		this.playerId = playerId;
		this.team = team;
	}

	public double getScore() {
		return score;
	}

	public void setScore(double score) {
		this.score = score;
	}

	public String getPlayerId() {
		return playerId;
	}

	public void setPlayerId(String playerId) {
		this.playerId = playerId;
	}

	public boolean isTeam() {
		return team;
	}

	public void setTeam(boolean team) {
		this.team = team;
	}

}
