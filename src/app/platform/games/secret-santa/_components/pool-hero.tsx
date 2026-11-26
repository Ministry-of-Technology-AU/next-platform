import { cn } from "@/lib/utils"
import { PlayfulGift } from "./playful-gift"
import { Snowfall } from "./snowfall"
import styles from "./santa.module.css"

const LIGHT_TONES = [
    "bg-green-light shadow-[0_0_8px_2px_var(--color-green-light)]",
    "bg-white shadow-[0_0_8px_2px_var(--color-white)]",
    "bg-green-extralight shadow-[0_0_8px_2px_var(--color-green-extralight)]",
] as const

/** A string of lights along the top edge. They twinkle out of step; static under reduced motion. */
function StringLights({ count = 16 }: { count?: number }) {
    return (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6" aria-hidden="true">
            {/* The wire sags between the bulbs. */}
            <svg
                className="absolute inset-x-0 top-0 h-4 w-full text-primary-foreground/30"
                preserveAspectRatio="none"
                viewBox="0 0 100 10"
            >
                <path
                    d="M0 1 Q 3.125 7 6.25 1 T 12.5 1 T 18.75 1 T 25 1 T 31.25 1 T 37.5 1 T 43.75 1 T 50 1 T 56.25 1 T 62.5 1 T 68.75 1 T 75 1 T 81.25 1 T 87.5 1 T 93.75 1 T 100 1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            <div className="absolute inset-x-0 top-0 flex justify-around">
                {Array.from({ length: count }, (_, i) => (
                    <span key={i} className="flex flex-col items-center" style={{ marginTop: i % 2 === 0 ? 5 : 2 }}>
                        <span className="h-1.5 w-1 rounded-sm bg-primary-foreground/40" />
                        <span
                            className={cn(styles.light, "h-3 w-2 rounded-full", LIGHT_TONES[i % 3])}
                            style={{ animationDelay: `${(i % 5) * 0.37}s` }}
                        />
                    </span>
                ))}
            </div>
        </div>
    )
}

interface PoolHeroProps {
    children: React.ReactNode
    className?: string
}

/** The seasonal banner: deep red, string lights, snow, and a hopping present. */
export function PoolHero({ children, className }: PoolHeroProps) {
    return (
        <section
            className={cn(
                "relative isolate overflow-hidden rounded-2xl bg-primary-dark text-primary-foreground shadow-sm",
                className,
            )}
        >
            <Snowfall />
            <StringLights />
            <div className="relative grid grid-cols-1 items-center gap-4 px-5 pb-7 pt-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-10 sm:px-8 sm:pb-10 sm:pt-14">
                <div className="order-2 min-w-0 sm:order-1">{children}</div>
                <div className="order-1 flex justify-start sm:order-2 sm:justify-end lg:pr-6">
                    <PlayfulGift />
                </div>
            </div>
        </section>
    )
}
