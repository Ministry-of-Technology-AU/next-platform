"use client"

import { motion, useReducedMotion, type Transition } from "motion/react"
import { Sparkle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The hero's present: a green box with a red ribbon whose lid hops every few seconds,
 * letting a few sparkles out. Hover lifts the lid higher. Decorative, so hidden from screen
 * readers. Under reduced motion it sits still.
 */

// One hop cycle, then a pause. Keyframe times line up across lid, box, shadow and sparkles.
const CYCLE: Transition = { duration: 1.3, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }
const TIMES = [0, 0.25, 0.5, 0.68, 1]

const SPARKS = [
    { left: "18%", delay: 0, size: "size-4 sm:size-5" },
    { left: "48%", delay: 0.06, size: "size-3 sm:size-4" },
    { left: "74%", delay: 0.12, size: "size-4 sm:size-5" },
] as const

export function PlayfulGift({ className }: { className?: string }) {
    const still = useReducedMotion() ?? false

    return (
        <motion.div
            aria-hidden="true"
            className={cn("relative size-36 sm:size-52", className)}
            initial="rest"
            whileHover={still ? undefined : "lifted"}
        >
            {/* Shadow squashes as the box lands. */}
            <motion.div
                className="absolute inset-x-[16%] bottom-[2%] h-[6%] rounded-[50%] bg-black/35 blur-[2px]"
                animate={still ? undefined : { scaleX: [1, 0.85, 1.08, 0.98, 1] }}
                transition={{ ...CYCLE, times: TIMES }}
            />

            {/* Box */}
            <motion.div
                className="absolute inset-x-[12%] bottom-[6%] top-[44%] overflow-hidden rounded-b-2xl rounded-t-sm bg-green shadow-lg"
                style={{ originY: 1 }}
                animate={still ? undefined : { scaleY: [1, 1.03, 0.9, 1.03, 1], scaleX: [1, 0.98, 1.06, 0.99, 1] }}
                transition={{ ...CYCLE, times: TIMES }}
            >
                <div className="absolute inset-y-0 left-[8%] w-[14%] bg-white/15" />
                <div className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2 bg-primary-bright" />
            </motion.div>

            {/* Sparkles escape while the lid is up. */}
            {!still &&
                SPARKS.map((spark) => (
                    <motion.span
                        key={spark.left}
                        className="absolute top-[38%] text-white"
                        style={{ left: spark.left }}
                        animate={{ opacity: [0, 0, 1, 0, 0], y: [0, 0, -34, -48, -48], scale: [0.4, 0.4, 1, 0.7, 0.7] }}
                        transition={{ ...CYCLE, times: [0, 0.15 + spark.delay, 0.4 + spark.delay, 0.75, 1] }}
                    >
                        <Sparkle className={cn(spark.size, "fill-current")} />
                    </motion.span>
                ))}

            {/* Lid and bow move together. */}
            <motion.div
                className="absolute inset-x-[6%] top-[14%] h-[34%]"
                style={{ originX: 0.15, originY: 1 }}
                variants={{ rest: { y: 0, rotate: 0 }, lifted: { y: -22, rotate: -10 } }}
                animate={still ? undefined : { y: [0, -20, 0, -5, 0], rotate: [0, -9, 0, 0, 0] }}
                transition={{ ...CYCLE, times: TIMES }}
            >
                <div className="absolute inset-x-0 bottom-0 h-[48%] rounded-lg bg-green-light shadow-md">
                    <div className="absolute inset-y-0 left-1/2 w-[15%] -translate-x-1/2 bg-primary-bright" />
                </div>
                {/* Bow: two loops and a knot. */}
                <div className="absolute bottom-[44%] left-1/2 flex -translate-x-1/2 items-end">
                    <span className="block size-9 translate-x-1 -rotate-[35deg] rounded-[60%_60%_20%_60%] border-[5px] border-primary-bright sm:size-12 sm:border-[6px]" />
                    <span className="z-10 block size-3.5 rounded-full bg-primary-bright sm:size-4" />
                    <span className="block size-9 -translate-x-1 rotate-[35deg] rounded-[60%_60%_60%_20%] border-[5px] border-primary-bright sm:size-12 sm:border-[6px]" />
                </div>
            </motion.div>
        </motion.div>
    )
}
