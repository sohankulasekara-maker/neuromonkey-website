/**
 * Where the 3D scene is in its journey, worked out from the page's scroll.
 *
 * Three acts, like a film:
 *  1. Hero: the glass form glows behind Yakira.
 *  2. Travel and Services: scrolling out of the hero carries it left and
 *     shrinks it. It stays beside the Services wheel and fades slowly as the
 *     services count from 01 to 07, gone by the last one.
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
  /** How far the pinned Services section scrolls (its height minus one screen). */
  servicesTravel: number;
  /** The Services wheel's box, relative to the viewport. Null when hidden (phones). */
  wheel: { centerX: number; centerY: number; radius: number } | null;
  /** The contact section's box, relative to the viewport. Null if missing. */
  contactTop: number | null;
  contactHeight: number;
}

export interface Stage {
  /** 0 at the top of the page, 1 when Services reaches the top of the screen. */
  heroProgress: number;
  /** 0 when Services pins, 1 when it lets go (its 7 steps in between). */
  servicesProgress: number;
  heroOpacity: number;
  /** The Services wheel in clip space (-1 to 1); radius as a share of screen height. Null on phones. */
  wheel: { x: number; y: number; radius: number } | null;
  /** 0 before the contact section enters, 1 once it is well on screen. */
  contactProgress: number;
  contactOpacity: number;
  /** The contact section's centre in clip space (-1 bottom, 1 top). */
  contactCenterY: number;
  /** False when nothing would be drawn, so the loop can sleep. */
  isActive: boolean;
}

const SERVICE_COUNT = 7;
/* Desktop: fully there at 01, fading step by step, gone as 07 settles. */
const SERVICES_FADE = { start: 0.5 / SERVICE_COUNT, end: 6.6 / SERVICE_COUNT };
/* Phones stack text across the full width, so the form dims during the
   travel and is gone by about the fourth service. */
const NARROW_TRAVEL_OPACITY = 0.4;
const NARROW_SERVICES_FADE = { start: 0, end: 3.5 / SERVICE_COUNT };
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
  const { scrollY, viewportWidth, viewportHeight, heroEnd, servicesTravel, wheel, contactTop, contactHeight } = input;
  const heroProgress = clamp01(scrollY / Math.max(1, heroEnd));
  const servicesProgress = clamp01((scrollY - heroEnd) / Math.max(1, servicesTravel));
  const isNarrow = viewportWidth <= NARROW_MAX_PX;
  const heroOpacity = isNarrow
    ? (1 - (1 - NARROW_TRAVEL_OPACITY) * smoothstep(0.2, 0.6, heroProgress)) *
      (1 - smoothstep(NARROW_SERVICES_FADE.start, NARROW_SERVICES_FADE.end, servicesProgress))
    : 1 - smoothstep(SERVICES_FADE.start, SERVICES_FADE.end, servicesProgress);

  const hasContact = contactTop !== null;
  const contactProgress = hasContact ? clamp01((viewportHeight - contactTop) / (viewportHeight * CONTACT_ENTRY_SHARE)) : 0;
  const contactOpacity = smoothstep(0, 1, contactProgress);
  const centerPx = hasContact ? contactTop + contactHeight / 2 : viewportHeight * 2;
  const contactCenterY = 1 - (2 * centerPx) / viewportHeight;

  return {
    heroProgress,
    servicesProgress,
    wheel: wheel
      ? { x: (2 * wheel.centerX) / viewportWidth - 1, y: 1 - (2 * wheel.centerY) / viewportHeight, radius: wheel.radius / viewportHeight }
      : null,
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
  const servicesRect = services?.getBoundingClientRect() ?? null;
  /* A rotated circle's bounding box keeps the same centre, so turning the wheel never moves this. */
  const wheelRect = document.querySelector("[data-immersive-anchor='services-wheel']")?.getBoundingClientRect() ?? null;
  const hasWheel = wheelRect !== null && wheelRect.width > 0;
  const contactRect = contact?.getBoundingClientRect() ?? null;
  return {
    scrollY,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    heroEnd: servicesRect ? servicesRect.top + scrollY : window.innerHeight,
    servicesTravel: servicesRect ? servicesRect.height - window.innerHeight : window.innerHeight,
    wheel: hasWheel
      ? { centerX: wheelRect.left + wheelRect.width / 2, centerY: wheelRect.top + wheelRect.height / 2, radius: Math.min(wheelRect.width, wheelRect.height) / 2 }
      : null,
    contactTop: contactRect ? contactRect.top : null,
    contactHeight: contactRect ? contactRect.height : 0,
  };
}
