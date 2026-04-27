/** Ensures a binding variable always starts with $ */
export const normalizeBinding = (value: string): string => {
  if (!value) return value
  return value.startsWith('$') ? value : `$${value}`
}

export const KNOWN_FACT_TYPES: string[] = [
  'Action',
  'InputData',
  'PointConcept',
  'BadgeCollectionConcept',
  'ChallengeConcept',
  'CustomData',
  'Player',
  'Game',
  'GroupChallenge',
  'Reward',
]

// Maps known fact types to their fully qualified Java class names.
export const KNOWN_IMPORTS: Record<string, string> = {
  Action:                  'eu.trentorise.game.model.Action',
  InputData:               'eu.trentorise.game.model.InputData',
  PointConcept:            'eu.trentorise.game.model.PointConcept',
  BadgeCollectionConcept:  'eu.trentorise.game.model.BadgeCollectionConcept',
  ChallengeConcept:        'eu.trentorise.game.model.ChallengeConcept',
  CustomData:              'eu.trentorise.game.model.CustomData',
  Player:                  'eu.trentorise.game.model.Player',
  Game:                    'eu.trentorise.game.model.Game',
  GroupChallenge:          'eu.trentorise.game.model.GroupChallenge',
  Reward:                  'eu.trentorise.game.model.Reward',
}
