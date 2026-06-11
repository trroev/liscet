import { RiCheckLine } from "@remixicon/react"
import { cn } from "@repo/ui/utils/cn"

const VIEWBOX = 32
const RADIUS = 14
const STROKE = 4
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const COMPLETE_RATIO = 1
const CHECK_SCALE = 0.7

export type ProgressCircleProps = {
  /** Completion ratio in the range 0–1; values outside are clamped. */
  value: number
  /** Accessible label describing what the progress represents. */
  label: string
  /** Rendered width/height in pixels. */
  size?: number
  /** Force the completed treatment regardless of `value`. */
  isComplete?: boolean
  className?: string
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

/**
 * Linear-style pie/arc progress glyph: a track ring with a foreground arc that
 * fills clockwise with completion, resolving to a filled disc with a check at
 * 100%. Completion is encoded by shape (arc length, check icon), not color
 * alone.
 */
export const ProgressCircle = ({
  value,
  label,
  size = 16,
  isComplete = false,
  className,
}: ProgressCircleProps): React.JSX.Element => {
  const ratio = clamp01(value)
  const complete = isComplete || ratio >= COMPLETE_RATIO
  return (
    <span
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(ratio * 100)}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className
      )}
      role="progressbar"
      style={{ height: size, width: size }}
    >
      <svg
        aria-hidden="true"
        className="-rotate-90"
        height={size}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        width={size}
      >
        <title>{label}</title>
        {complete ? (
          <circle
            className="text-success"
            cx={VIEWBOX / 2}
            cy={VIEWBOX / 2}
            fill="currentColor"
            r={RADIUS + STROKE / 2}
          />
        ) : (
          <>
            <circle
              className="text-border"
              cx={VIEWBOX / 2}
              cy={VIEWBOX / 2}
              fill="none"
              r={RADIUS}
              stroke="currentColor"
              strokeWidth={STROKE}
            />
            <circle
              className="text-accent"
              cx={VIEWBOX / 2}
              cy={VIEWBOX / 2}
              fill="none"
              r={RADIUS}
              stroke="currentColor"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
              strokeLinecap="round"
              strokeWidth={STROKE}
            />
          </>
        )}
      </svg>
      {complete && (
        <RiCheckLine
          aria-hidden="true"
          className="absolute text-success-foreground"
          size={Math.round(size * CHECK_SCALE)}
        />
      )}
    </span>
  )
}
