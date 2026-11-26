import "server-only"

import { sendMail } from "@/lib/apis/mail"
import { escapeHtml } from "@/lib/forms/email"
import { poolPath } from "../data"
import { formatRupees, formatShortDate } from "../utils"
import type { PoolRecord } from "./records"

/**
 * Secret Santa emails, sent from the Tech Ministry account. The whole email is a wrapped
 * present: tartan strips top and bottom, a red lid, a stitched mint ribbon carrying the pool
 * title, Bijlee the cat, a gift tag naming the giftee, and the facts as hanging ornaments.
 *
 * Built for Gmail: tables, inline styles, hex colours, Georgia and Arial only. Gmail drops
 * box-shadow, CSS variables and webfonts, and renders many symbols as emoji images, so none
 * of those are used. The one <style> block is progressive (rich-text spacing and a narrow-screen
 * stack). Images live in `public/secret-santa/` and are served from NEXT_PUBLIC_BASE_URL. Wish
 * lists and the host note are sanitised before they are stored, so they go in as HTML;
 * everything else is escaped.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ""
if (!BASE_URL) platform.warn("Secret Santa: NEXT_PUBLIC_BASE_URL is not set, so email links and images will break.")

const ALIAS = "Secret Santa"

/** Email palette. Red and mint are the festive pair; text on mint uses `mintInk` for contrast. */
const C = {
    red: "#c1121f",
    redDeep: "#8a0c16",
    redTint: "#ffd6da",
    redDash: "#f2b8bd",
    mint: "#70c49c",
    mintInk: "#14472f",
    mintSoft: "#eef8f3",
    mintLine: "#c9e8d8",
    mintStitch: "#ecf8f2",
    gold: "#d9a441",
    paper: "#fbf5ea",
    cream: "#fffaf1",
    card: "#ffffff",
    ink: "#2b2320",
    muted: "#6f645d",
    line: "#eadfcd",
} as const

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Arial, Helvetica, sans-serif"

const asset = (name: string) => `${BASE_URL}/secret-santa/${name}`
const poolUrl = (pool: PoolRecord) => `${BASE_URL}${poolPath(pool.uid)}`

/** Small uppercase label, used on the tag, tiles and notes. */
function label(text: string, color: string, extra = ""): string {
    return `<div style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;color:${color};${extra}">${text}</div>`
}

function plaidStrip(): string {
    return `<tr><td style="padding:0;line-height:0;font-size:0;">
        <img src="${asset("email-plaid.png")}" width="600" height="26" alt="" style="display:block;width:100%;max-width:600px;height:26px;border:0;" />
    </td></tr>`
}

function button(href: string, text: string): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:32px auto 4px;">
        <tr><td align="center" style="background:${C.red};border-radius:999px;border-bottom:4px solid ${C.redDeep};">
            <a href="${escapeHtml(href)}" style="display:inline-block;padding:15px 34px;font-family:${SANS};font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(text)} &rarr;</a>
        </td></tr>
    </table>`
}

/** Budget, date and host as three ornaments: a gold cap over a red, mint, red tile. */
function facts(pool: PoolRecord): string {
    const ornament = (name: string, value: string, tone: "red" | "mint", width: string) => {
        const bg = tone === "red" ? C.red : C.mint
        const labelColor = tone === "red" ? C.redTint : C.mintInk
        const valueColor = tone === "red" ? "#ffffff" : C.mintInk
        return `<td class="ss-fact" valign="top" width="${width}" style="width:${width};padding:0 5px;">
            <div style="width:20px;height:9px;margin:0 auto;background:${C.gold};border-radius:4px 4px 0 0;font-size:0;line-height:0;">&nbsp;</div>
            <div style="background:${bg};border-radius:18px;padding:16px 8px;text-align:center;">
                ${label(name, labelColor, "font-size:10px;letter-spacing:1.5px;")}
                <div style="font-family:${SERIF};font-size:18px;line-height:1.3;font-weight:bold;color:${valueColor};margin-top:4px;">${value}</div>
            </div>
        </td>`
    }
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0 4px;">
        <tr>
            ${ornament("Budget", escapeHtml(formatRupees(pool.budget)), "red", "33%")}
            ${ornament("Exchange", escapeHtml(formatShortDate(pool.eventDate)), "mint", "34%")}
            ${ornament("Host", escapeHtml(pool.hostName), "red", "33%")}
        </tr>
    </table>`
}

/** The host note as a little letter, signed by the host. */
function hostNote(pool: PoolRecord): string {
    if (!pool.hostNote.trim()) return ""
    const host = escapeHtml(pool.hostName)
    return `<div style="margin-top:26px;background:${C.cream};border:1px dashed ${C.red};border-radius:16px;padding:18px 22px;">
        ${label(`A note from ${host}`, C.red, "letter-spacing:1.5px;margin-bottom:8px;")}
        <div class="ss-rich" style="font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};">${pool.hostNote}</div>
        <div style="font-family:${SERIF};font-size:15px;font-style:italic;color:${C.muted};text-align:right;margin-top:8px;">&mdash; ${host}</div>
    </div>`
}

/** A gift tag with a punched hole, naming who the reader is gifting. */
function giftTag(gifteeName: string): string {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 30px;background:${C.cream};border:2px solid ${C.red};border-radius:18px;border-collapse:separate;">
        <tr>
            <td width="58" align="center" valign="middle" style="width:58px;border-right:2px dashed ${C.redDash};padding:0;">
                <div style="width:14px;height:14px;margin:0 auto;border:3px solid ${C.red};border-radius:50%;background:${C.paper};line-height:14px;font-size:0;">&nbsp;</div>
            </td>
            <td style="padding:22px 22px 20px 22px;">
                ${label("To", C.mintInk)}
                <div style="font-family:${SERIF};font-size:34px;line-height:1.15;font-weight:bold;color:${C.red};margin-top:4px;">${escapeHtml(gifteeName)}</div>
                ${label("From", C.mintInk, "margin-top:14px;")}
                <div style="font-family:${SERIF};font-size:17px;font-style:italic;color:${C.ink};margin-top:2px;">Their Secret Santa (that&rsquo;s you)</div>
                <div style="font-family:${SANS};font-size:13px;color:${C.muted};margin-top:14px;padding-top:12px;border-top:1px solid ${C.line};">Keep it under your hat. Not even the host knows.</div>
            </td>
        </tr>
    </table>`
}

interface LayoutOptions {
    /** Inbox preview line. */
    preheader: string
    kicker: string
    /** Heading lines; each becomes its own line in the red lid. */
    heading: [string, string]
    /** Text on the ribbon, usually the pool title. */
    ribbon: string
    cat: { file: string; alt: string; width: number; caption: string }
    bodyHtml: string
    footer: string
}

function layout(o: LayoutOptions): string {
    const title = escapeHtml(o.heading.join(" "))
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="color-scheme" content="light only" /><meta name="supported-color-schemes" content="light" /><title>${title}</title>
<style>
.ss-rich p{margin:0 0 8px}.ss-rich p:last-child{margin-bottom:0}.ss-rich ul,.ss-rich ol{margin:0;padding-left:20px}.ss-rich li{margin:0 0 4px}
@media only screen and (max-width:480px){
.ss-pad{padding-left:22px !important;padding-right:22px !important}
.ss-h1{font-size:28px !important}
.ss-fact{display:block !important;width:100% !important;padding:0 0 12px !important}
}
</style></head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};">
<tr><td align="center" style="padding:28px 10px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${C.card};border:1px solid ${C.line};border-radius:22px;overflow:hidden;border-collapse:separate;">
        ${plaidStrip()}
        <tr><td align="center" style="background:${C.red};padding:34px 28px 30px;">
            ${label(escapeHtml(o.kicker), C.redTint, "font-size:12px;letter-spacing:3px;")}
            <div class="ss-h1" style="font-family:${SERIF};font-size:34px;line-height:1.15;font-weight:bold;color:#ffffff;margin-top:12px;">${escapeHtml(o.heading[0])}<br />${escapeHtml(o.heading[1])}</div>
        </td></tr>
        <tr><td align="center" style="background:${C.mint};padding:5px 0;">
            <div style="border-top:2px dashed ${C.mintStitch};border-bottom:2px dashed ${C.mintStitch};padding:10px 24px;font-family:${SERIF};font-size:17px;font-style:italic;font-weight:bold;color:${C.mintInk};">${escapeHtml(o.ribbon)}</div>
        </td></tr>
        <tr><td align="center" style="padding:30px 28px 0;">
            <img src="${asset(o.cat.file)}" width="${o.cat.width}" alt="${escapeHtml(o.cat.alt)}" style="display:block;width:${o.cat.width}px;max-width:70%;height:auto;border:0;" />
            <div style="font-family:${SERIF};font-size:15px;font-style:italic;color:${C.muted};margin-top:6px;">${escapeHtml(o.cat.caption)}</div>
        </td></tr>
        <tr><td class="ss-pad" style="padding:22px 36px 36px;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink};">
            ${o.bodyHtml}
        </td></tr>
        ${plaidStrip()}
        <tr><td align="center" style="padding:18px 28px 22px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted};">
            ${escapeHtml(o.footer)}<br />Sent with love from the Ashoka platform&rsquo;s Secret Santa.
        </td></tr>
    </table>
</td></tr>
</table>
</body></html>`
}

export interface BuiltEmail {
    subject: string
    html: string
}

export function buildInviteEmail(pool: PoolRecord): BuiltEmail {
    const body = `
        <p style="margin:0 0 14px;font-family:${SERIF};font-size:22px;font-weight:bold;color:${C.red};text-align:center;">Ho ho ho, you&rsquo;re on the list!</p>
        <p style="margin:0 0 12px;"><strong>${escapeHtml(pool.hostName)}</strong> added you to <strong>${escapeHtml(pool.title)}</strong>. You&rsquo;re already in the draw, there&rsquo;s nothing to accept.</p>
        <p style="margin:0;">Open the pool and add a wish list so your Santa knows what you&rsquo;d like. It&rsquo;s optional, and only the person who draws your name will see it.</p>
        ${facts(pool)}
        ${hostNote(pool)}
        ${button(poolUrl(pool), "Add my wish list")}`
    return {
        subject: `🎄 You're in "${pool.title}"`,
        html: layout({
            preheader: `${pool.hostName} added you to a Secret Santa. Add your wish list.`,
            kicker: "Secret Santa · You're invited",
            heading: ["You've been added", "to a Secret Santa"],
            ribbon: pool.title,
            cat: {
                file: "email-cat.png",
                alt: "Bijlee the cat in a Santa hat and scarf, waving",
                width: 210,
                caption: "Bijlee says hi!",
            },
            bodyHtml: body,
            footer: "You got this because the host added your email. Names are drawn later.",
        }),
    }
}

export interface DrawEmail {
    to: string
    giverName: string
    gifteeName: string
    gifteeWishlist: string
}

export function buildDrawEmail(pool: PoolRecord, email: DrawEmail): BuiltEmail {
    const giftee = escapeHtml(email.gifteeName)
    const wishlist = email.gifteeWishlist.trim()
        ? `<div class="ss-rich" style="background:${C.mintSoft};border:1px solid ${C.mintLine};border-radius:16px;padding:16px 20px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};">${email.gifteeWishlist}</div>`
        : `<div style="background:${C.mintSoft};border:1px dashed ${C.mintLine};border-radius:16px;padding:16px 20px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.muted};">${giftee} hasn&rsquo;t written a wish list yet. Check the pool page closer to the day, it may change.</div>`

    const body = `
        <p style="margin:0 0 6px;">Hi ${escapeHtml(email.giverName)},</p>
        <p style="margin:0;">The names for <strong>${escapeHtml(pool.title)}</strong> have been drawn, sealed and sent. Here&rsquo;s yours.</p>
        ${giftTag(email.gifteeName)}
        <div style="margin-bottom:10px;"><span style="display:inline-block;background:${C.mint};color:${C.mintInk};border-radius:999px;padding:5px 14px;font-family:${SANS};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;">${giftee}&rsquo;s wish list</span></div>
        ${wishlist}
        ${facts(pool)}
        ${hostNote(pool)}
        ${button(poolUrl(pool), "Unwrap it on the platform")}`
    return {
        subject: `🎅 Your Secret Santa for "${pool.title}" is in`,
        html: layout({
            preheader: `Names are drawn for ${pool.title}. Open to see who you're gifting.`,
            kicker: "Secret Santa · Names are drawn",
            heading: ["Your Secret Santa", "is here"],
            ribbon: pool.title,
            cat: {
                file: "email-cat-secret.png",
                alt: "Bijlee the cat in a Santa hat and Christmas sweater, holding a sealed envelope and winking",
                width: 220,
                caption: "Psst. Bijlee has your envelope.",
            },
            bodyHtml: body,
            footer: "The pool page always shows the latest wish list.",
        }),
    }
}

export async function sendInviteEmail(pool: PoolRecord, to: string): Promise<void> {
    const { subject, html } = buildInviteEmail(pool)
    await sendMail({ to, alias: ALIAS, subject, html })
}

export async function sendDrawEmail(pool: PoolRecord, email: DrawEmail): Promise<void> {
    const { subject, html } = buildDrawEmail(pool, email)
    await sendMail({ to: email.to, alias: ALIAS, subject, html })
}
