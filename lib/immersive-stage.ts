/**
 * Where the 3D scene is in its journey, worked out from the page's scroll.
 *
 * Three acts, like a film:
 *  1. Hero: the glass form sits beside the headline.
 *  2. Travel: scrolling out of the hero carries it left, shrinks it and
 *     makes it ripple harder, until it fades as the Services section arrives.
 *  3. Contact: a dark iridescent form rises in with the contact section and
 *     floats beside it until the page ends.
 * Between acts nothing is visible, so the render loop stops.
 */

export interface StageInput {
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  /** Distance from the page top to the Services section. */
  heroEnd: number;
  /** The contact section's box, relative to the viewport. Null if missing. */
  contactTop: number | null;
  contactHeight: number;
}

export interface Stage {
  /** 0 at the top of the page, 1 when Services reaches the top of the screen. */
  heroProgress: number;
  heroOpacity: number;
  /** 0 before the contact section enters, 1 once it is well on screen. */
  contactProgress: number;
  contactOpacity: number;
  /** The contact section's centre in clip space (-1 bottom, 1 top). */
  contactCenterY: number;
  /** False when nothing would be drawn, so the loop can sleep. */
  isActive: boolean;
}

const HERO_FADE = { start: 0.6, end: 0.95 };
/* Phones stack the stats across the full width, so the form leaves before them. */
const HERO_FADE_NARROW = { start: 0.22, end: 0.42 };
const NARROW_MAX_PX = 767;
/** How much of the screen the contact section climbs before its form is fully in. */
const CONTACT_ENTRY_SHARE = 0.75;
const VISIBLE_EPSILON = 0.002;

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function computeStage(input: StageInput): Stage {
  const { scrollY, viewportWidth, viewportHeight, heroEnd, contactTop, contactHeight } = input;
  const heroProgress = clamp01(scrollY / Math.max(1, heroEnd));
  const fade = viewportWidth <= NARROW_MAX_PX ? HERO_FADE_NARROW : HERO_FADE;
  const heroOpacity = 1 - smoothstep(fade.start, fade.end, heroProgress);

  const hasContact = contactTop !== null;
  const contactProgress = hasContact ? clamp01((viewportHeight - contactTop) / (viewportHeight * CONTACT_ENTRY_SHARE)) : 0;
  const contactOpacity = smoothstep(0, 1, contactProgress);
  const centerPx = hasContact ? contactTop + contactHeight / 2 : viewportHeight * 2;
  const contactCenterY = 1 - (2 * centerPx) / viewportHeight;

  return {
    heroProgress,
    heroOpacity,
    contactProgress,
    contactOpacity,
    contactCenterY,
    isActive: heroOpacity > VISIBLE_EPSILON || contactOpacity > VISIBLE_EPSILON,
  };
}

/** Reads the live page into a StageInput. Browser only. */
export function readStageInput(): StageInput {
  const services = document.getElementById("services");
  const contact = document.getElementById("contact");
  const scrollY = window.scrollY;
  const contactRect = contact?.getBoundingClientRect() ?? null;
  return {
    scrollY,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    heroEnd: services ? services.getBoundingClientRect().top + scrollY : window.innerHeight,
    contactTop: contactRect ? contactRect.top : null,
    contactHeight: contactRect ? contactRect.height : 0,
  };
}
