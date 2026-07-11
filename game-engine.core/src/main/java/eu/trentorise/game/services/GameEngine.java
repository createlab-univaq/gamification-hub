/**
 *    Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package eu.trentorise.game.services;

import java.util.List;
import java.util.Map;

import org.kie.api.builder.Message;
import org.springframework.stereotype.Service;

import eu.trentorise.game.model.PlayerState;
import eu.trentorise.game.model.simulation.SimulationResult;

public interface GameEngine {

	public PlayerState execute(String gameId, PlayerState state, String action, Map<String, Object> data,
			String executionId, long executionMoment, List<Object> factObjects);

	public SimulationResult simulate(String gameId, PlayerState state, String action,
			Map<String, Object> data, String executionId, long executionMoment,
			List<Object> factObjects, boolean showDetailedChanges);

	/**
	 * Rule syntax validation
	 *
	 * @param gameId
	 *            gameId
	 * @param content
	 *            the rule content
	 *
	 *
	 * @return the list of syntax errors, or an empty list if validation gone
	 *         fine
	 */
	public Map<String, Message> validateRule(String gameId, String content);

	/**
	 * Like {@link #validateRule}, but compiles the candidate rule together with
	 * the game's other saved rules. The constants file and any peer with the
	 * same name as ruleName are skipped (so an in-flight edit isn't compiled
	 * twice). Only errors attributed to the candidate's resource are returned —
	 * a broken peer doesn't fail the candidate.
	 *
	 * @param gameId   gameId
	 * @param content  the rule content being validated
	 * @param ruleName the candidate's name — peers with the same name are skipped
	 */
	public Map<String, Message> validateGame(String gameId, String content, String excludeRuleUrl);
}
