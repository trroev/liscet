import type { SpecialRequirement } from "@repo/rules-engine/types/RuleSet"

type IsRequirementEffectiveArgs = {
  readonly requirement: SpecialRequirement
  readonly asOf: Date
}

/**
 * Whether a special requirement is in force as of `asOf`. A requirement with no
 * `effectiveFrom` is always effective; otherwise it applies only when `asOf` is
 * on or after the trigger date. `effectiveFrom` is parsed as UTC midnight,
 * matching the rules engine's UTC date convention.
 */
export function isRequirementEffective({
  requirement,
  asOf,
}: IsRequirementEffectiveArgs): boolean {
  if (requirement.effectiveFrom === undefined) {
    return true
  }
  return asOf.getTime() >= new Date(requirement.effectiveFrom).getTime()
}
