"use client"

import { useState, type ReactNode } from "react"
import { marioSfx } from "@/lib/audio/mario"
import { cn } from "@/lib/funcs/cn"

/** Pixel sprite from a character map. Each char is a palette key; "." is transparent. */
export function Sprite({
  rows,
  palette,
  px = 4,
  className,
  label,
}: {
  rows: string[]
  palette: Record<string, string>
  px?: number
  className?: string
  label?: string
}) {
  const w = rows[0].length
  const h = rows.length
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * px}
      height={h * px}
      shapeRendering="crispEdges"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={palette[c]}
            />
          )
        )
      )}
    </svg>
  )
}

// An original chibi plumber with an "S" on the cap.
const HERO = [
  "....RRRRR.....",
  "...RRRRRRRR...",
  "..RRRWWRRRRR..",
  "..RRRWRRRRRRR.",
  "..KKKSSSkSS...",
  ".KSKSSSSkSSS..",
  ".KSKKSSSSKSSS.",
  ".KKSSSSSKKKK..",
  "...SSSSSSSS...",
  "..RRBRRRBRR...",
  ".RRRBRRRBRRR..",
  "RRRRBBBBBRRRR.",
  "SSRBYBBBYBRSS.",
  "SSSBBBBBBBSSS.",
  "..BBBB.BBBB...",
  ".NNNN...NNNN..",
  "NNNNN...NNNNN.",
]
const HERO_PALETTE = {
  R: "#e52521",
  W: "#ffffff",
  K: "#6b3416",
  S: "#f8c08a",
  k: "#1a1410",
  B: "#049cd8",
  Y: "#fbd000",
  N: "#8a4416",
}
export function HeroSprite({
  px = 6,
  className,
}: {
  px?: number
  className?: string
}) {
  return (
    <Sprite rows={HERO} palette={HERO_PALETTE} px={px} className={className} />
  )
}

const MUSHROOM = [
  "...RRRR...",
  "..RWWRRR..",
  ".RWWWRRRR.",
  "RRRRRRWWRR",
  "RWWRRRWWWR",
  "RWWRRRRRRR",
  ".WWWWWWWW.",
  "..WkWWkW..",
  "..WWWWWW..",
  "...WWWW...",
]
export function Mushroom({ px = 4, green }: { px?: number; green?: boolean }) {
  return (
    <Sprite
      rows={MUSHROOM}
      palette={{ R: green ? "#43b047" : "#e52521", W: "#fff4d6", k: "#1a1410" }}
      px={px}
    />
  )
}

const STAR = [
  "....Y....",
  "...YYY...",
  "...YYY...",
  "YYYYYYYYY",
  ".YYkYkYY.",
  "..YkYkY..",
  "..YYYYY..",
  ".YYY.YYY.",
  "YY.....YY",
]
export function Star({ px = 4 }: { px?: number }) {
  return <Sprite rows={STAR} palette={{ Y: "#fbd000", k: "#1a1410" }} px={px} />
}

const FLOWER = [
  "..OOOOO..",
  ".OYYYYYO.",
  "OYWkWkWYO",
  ".OYYYYYO.",
  "..OOOOO..",
  "....G....",
  "GG..G..GG",
  ".GGGGGGG.",
  "...GGG...",
]
export function Flower({ px = 4 }: { px?: number }) {
  return (
    <Sprite
      rows={FLOWER}
      palette={{
        O: "#e52521",
        Y: "#fbd000",
        W: "#ffffff",
        k: "#1a1410",
        G: "#43b047",
      }}
      px={px}
    />
  )
}

export function CoinIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-4 w-3 rounded-[50%] border-2 border-[#8a5a00] bg-[#fbd000] shadow-[inset_-2px_0_0_#c88a00]",
        className
      )}
    />
  )
}

/** A clickable ? block: bumps, pops a coin and plays a sound. */
export function QBlock({
  children,
  onHit,
  size = 56,
  used,
  className,
  label,
}: {
  children?: ReactNode
  onHit?: () => void
  size?: number
  used?: boolean
  className?: string
  label: string
}) {
  const [hits, setHits] = useState(0)
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        setHits((n) => n + 1)
        if (used) marioSfx.bump()
        else {
          marioSfx.coin()
          onHit?.()
        }
      }}
      className={cn(
        "group relative inline-flex flex-col items-center gap-2 focus-visible:outline-none",
        className
      )}
    >
      <span className="relative">
        {hits > 0 && !used && (
          <span
            key={hits}
            className="absolute -top-2 left-1/2 -ml-2.5 animate-coin-pop"
          >
            <CoinIcon className="h-6 w-5" />
          </span>
        )}
        <span
          key={`b${hits}`}
          className={cn(
            "grid place-items-center rounded-[3px] font-display text-2xl pixel-border-sm group-focus-visible:ring-4 group-focus-visible:ring-ring",
            hits > 0 && "animate-bump",
            used ? "bg-[#a0522d] text-[#6b3416]" : "bg-[#f8b800] text-white"
          )}
          style={{
            width: size,
            height: size,
            textShadow: used ? undefined : "2px 2px 0 #c84c0c",
            boxShadow:
              "inset -4px -4px 0 rgb(0 0 0 / 0.2), inset 4px 4px 0 rgb(255 255 255 / 0.35), 2px 2px 0 #1a1410",
          }}
        >
          {used ? "" : "?"}
        </span>
      </span>
      {children}
    </button>
  )
}

/** Warp pipe: a rim and a body, drawn with gradients. */
export function Pipe({
  height = 80,
  className,
  color,
}: {
  height?: number
  className?: string
  color?: string
}) {
  const body =
    "linear-gradient(90deg, #1e7a2e 0 8%, #43b047 8% 18%, #c8ffc0 18% 24%, #43b047 24% 62%, #2f9e3c 62% 80%, #1e7a2e 80% 100%)"
  return (
    <div className={cn("flex flex-col items-center", className)} aria-hidden>
      <div
        className="relative h-7 w-full rounded-[2px] border-[3px] border-[#1a1410]"
        style={{ background: body }}
      >
        {color && (
          <span
            className="absolute inset-x-0 bottom-0 h-1.5"
            style={{ background: color }}
          />
        )}
      </div>
      <div
        className="w-[84%] border-x-[3px] border-[#1a1410]"
        style={{ height, background: body }}
      />
    </div>
  )
}

export function Cloud({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute", className)}
      style={style}
    >
      <div className="relative h-12 w-32">
        <span className="absolute bottom-0 left-0 h-8 w-32 rounded-full bg-white" />
        <span className="absolute bottom-3 left-5 h-10 w-12 rounded-full bg-white" />
        <span className="absolute bottom-4 left-14 h-12 w-14 rounded-full bg-white" />
      </div>
    </div>
  )
}

export function Hill({
  className,
  size = 220,
}: {
  className?: string
  size?: number
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute bottom-0 rounded-t-full border-[3px] border-b-0 border-[#1a1410] bg-[#5ac54f]",
        className
      )}
      style={{ width: size, height: size * 0.55 }}
    >
      <span className="absolute top-[30%] left-[38%] h-5 w-2 rounded-full bg-[#1e7a2e]" />
      <span className="absolute top-[30%] left-[56%] h-5 w-2 rounded-full bg-[#1e7a2e]" />
    </div>
  )
}

export function Bush({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute bottom-0 flex items-end",
        className
      )}
    >
      {[28, 40, 28].map((h, i) => (
        <span
          key={i}
          className="-mx-2 rounded-t-full border-[3px] border-b-0 border-[#1a1410] bg-[#4cc04a]"
          style={{ width: h * 1.4, height: h }}
        />
      ))}
    </div>
  )
}

/** Grass-topped ground strip. */
export function Ground({
  className,
  height = 48,
}: {
  className?: string
  height?: number
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "w-full border-t-[3px] border-[#1a1410] ground grass-top",
        className
      )}
      style={{ height }}
    />
  )
}

/** Cream "message block" card with the chunky pixel frame. */
export function Panel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-md bg-card p-5 text-card-foreground pixel-border sm:p-6",
        className
      )}
    >
      {children}
    </div>
  )
}
