import styles from "./santa.module.css"

/** Deterministic pseudo-random in [0, 1), so server and client render the same flakes. */
function seeded(index: number, salt: number): number {
    const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
    return x - Math.floor(x)
}

interface SnowfallProps {
    /** Number of flakes. Kept low so phones stay smooth. */
    count?: number
}

/**
 * Ambient snow behind seasonal surfaces. CSS only, no JS per frame. Hidden from screen
 * readers, and removed entirely under prefers-reduced-motion.
 */
export function Snowfall({ count = 26 }: SnowfallProps) {
    return (
        <div className={styles.snowLayer} aria-hidden="true">
            {Array.from({ length: count }, (_, i) => {
                const size = 3 + seeded(i, 1) * 5
                const fall = 7 + seeded(i, 2) * 8
                const sway = 2 + seeded(i, 3) * 3
                return (
                    <span
                        key={i}
                        className={styles.flake}
                        style={{
                            left: `${seeded(i, 4) * 100}%`,
                            width: size,
                            height: size,
                            opacity: 0.35 + seeded(i, 5) * 0.5,
                            animationDuration: `${fall}s, ${sway}s`,
                            animationDelay: `${-seeded(i, 6) * fall}s, 0s`,
                        }}
                    />
                )
            })}
        </div>
    )
}
