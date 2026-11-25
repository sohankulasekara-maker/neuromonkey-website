/**
 * Where the 3D scene is in its journey, worked out from the page's scroll.
 *
 * Three acts, like a film:
 *  1. Hero: the glass form glows behind Yakira.
 *  2. Services: scrolling out of the hero carries it into the centre of the
 *     Services wheel, where it stays at full strength through 01 to 07.
 *  3. How it works: it slides into the centre of the steps orbit, glowing
 *     out from behind the step-number disc, and fades slowly as the steps
 *     play, gone before Capabilities.
 *  4. Contact: a dark iridescent form rises in with the contact section and
 *     floats beside it until the page ends.
 * Between acts nothing is visible, so the render loop stops.
 */

/** A round page element the form can sit inside, in viewport pixels. */
export interface AnchorBox {
  centerX: number;
  centerY: number;
  radius: number;
}

/** An anchor in clip space (-1 to 1); radius as a share of screen height. */
export interface Anchor {
  x: number;
  y: number;
  radius: number;
}

export interface StageInput {
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  /** Distance from the page top to the Services section. */
  heroEnd: number;
  /** How far the pinned Services section scrolls (its height minus one screen). */
  servicesTravel: number;
  /** The Services wheel's box, relative to the viewport. Null when hidden (phones). */
  wheel: AnchorBox | null;
  /** The How it works orbit's box, relative to the viewport. */
  processOrbit: AnchorBox | null;
  /** The How it works section's box, relative to the viewport. Null if missing. */
  process: { top: number; height: number } | null;
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
  wheel: Anchor | null;
  /** The How it works steps orbit, in clip space. */
  processOrbit: Anchor | null;
  /** 0 while How it works is below the screen, 1 once it has pinned. */
  processEnter: number;
  /** 0 when How it works pins, 1 when it lets go (Capabilities is next). */
  processProgress: number;
  /** 0 before the contact section enters, 1 once it is well on screen. */
  contactProgress: number;
  contactOpacity: number;
  /** The contact section's centre in clip space (-1 bottom, 1 top). */
  contactCenterY: number;
  /** False when nothing would be drawn, so the loop can sleep. */
  isActive: boolean;
}

const SERVICE_COUNT = 7;
/* Desktop: full strength through Services, then fades across How it works,
   gone just before Capabilities arrives. */
const PROCESS_FADE = { start: 0.12, end: 0.94 };
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
  const { scrollY, viewportWidth, viewportHeight, heroEnd, servicesTravel, wheel, processOrbit, process, contactTop, contactHeight } = input;
  const toClip = (box: AnchorBox | null): Anchor | null =>
    box ? { x: (2 * box.centerX) / viewportWidth - 1, y: 1 - (2 * box.centerY) / viewportHeight, radius: box.radius / viewportHeight } : null;
  const heroProgress = clamp01(scrollY / Math.max(1, heroEnd));
  const servicesProgress = clamp01((scrollY - heroEnd) / Math.max(1, servicesTravel));
  const isNarrow = viewportWidth <= NARROW_MAX_PX;
  const processEnter = process ? clamp01((viewportHeight - process.top) / viewportHeight) : 0;
  const processTravel = process ? Math.max(1, process.height - viewportHeight) : 1;
  const processProgress = process ? clamp01(-process.top / processTravel) : 0;
  const heroOpacity = isNarrow
    ? (1 - (1 - NARROW_TRAVEL_OPACITY) * smoothstep(0.2, 0.6, heroProgress)) *
      (1 - smoothstep(NARROW_SERVICES_FADE.start, NARROW_SERVICES_FADE.end, servicesProgress))
    : 1 - smoothstep(PROCESS_FADE.start, PROCESS_FADE.end, processProgress);

  const hasContact = contactTop !== null;
  const contactProgress = hasContact ? clamp01((viewportHeight - contactTop) / (viewportHeight * CONTACT_ENTRY_SHARE)) : 0;
  const contactOpacity = smoothstep(0, 1, contactProgress);
  const centerPx = hasContact ? contactTop + contactHeight / 2 : viewportHeight * 2;
  const contactCenterY = 1 - (2 * centerPx) / viewportHeight;

  return {
    heroProgress,
    servicesProgress,
    wheel: toClip(wheel),
    processOrbit: toClip(processOrbit),
    heroOpacity,
    processEnter,
    processProgress,
    contactProgress,
    contactOpacity,
    contactCenterY,
    isActive: heroOpacity > VISIBLE_EPSILON || contactOpacity > VISIBLE_EPSILON,
  };
}

/** A marked element's centre and radius. Null when missing or hidden.
    A rotated circle's bounding box keeps the same centre, so turning never moves it. */
function readAnchor(name: string): AnchorBox | null {
  const rect = document.querySelector(`[data-immersive-anchor='${name}']`)?.getBoundingClientRect();
  if (!rect || rect.width === 0) return null;
  return { centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2, radius: Math.min(rect.width, rect.height) / 2 };
}

/** Reads the live page into a StageInput. Browser only. */
export function readStageInput(): StageInput {
  const services = document.getElementById("services");
  const contact = document.getElementById("contact");
  const processRect = document.getElementById("process")?.getBoundingClientRect() ?? null;
  const scrollY = window.scrollY;
  const servicesRect = services?.getBoundingClientRect() ?? null;

  const contactRect = contact?.getBoundingClientRect() ?? null;
  return {
    scrollY,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    heroEnd: servicesRect ? servicesRect.top + scrollY : window.innerHeight,
    servicesTravel: servicesRect ? servicesRect.height - window.innerHeight : window.innerHeight,
    wheel: readAnchor("services-wheel"),
    processOrbit: readAnchor("process-orbit"),
    process: processRect ? { top: processRect.top, height: processRect.height } : null,
    contactTop: contactRect ? contactRect.top : null,
    contactHeight: contactRect ? contactRect.height : 0,
  };
}
