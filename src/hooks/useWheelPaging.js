import { useEffect } from 'react';

const DESKTOP_QUERY = '(min-width: 1100px)';
const LOCK_MS = 860;
const SNAP_TOLERANCE = 72;
const NATURAL_TOLERANCE = 18;

function pageTop(selector) {
  const element = document.querySelector(selector);
  if (!element) return null;
  return element.getBoundingClientRect().top + window.scrollY;
}

function clampScroll(value) {
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(Math.max(0, value), maxScroll);
}

function buildPagingStops() {
  const viewportHeight = window.innerHeight;
  const galleryTop = pageTop('.tail-cases-gallery');
  const partnersTop = pageTop('.tail-partners');

  const rawStops = [
    ['p1', 0],
    ['p2', pageTop('.company-immersive')],
    ['p3', pageTop('.device-dashboard')],
    ['p3.5', pageTop('.device-grid') == null ? null : pageTop('.device-grid') - viewportHeight * 0.615],
    ['p4', pageTop('.platform-cases')],
    ['p5', galleryTop == null ? null : galleryTop - viewportHeight * 0.26],
    ['p5.5', galleryTop == null ? null : galleryTop + viewportHeight * 0.12],
    ['p6', pageTop('.tail-cooperation-section')],
    ['p7', partnersTop == null ? null : partnersTop - viewportHeight * 0.28],
    ['p8', document.documentElement.scrollHeight - viewportHeight],
  ];

  return rawStops
    .filter(([, top]) => Number.isFinite(top))
    .map(([id, top]) => ({ id, top: clampScroll(top) }))
    .sort((a, b) => a.top - b.top);
}

function isEditableTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function getStop(stops, id) {
  return stops.find((stop) => stop.id === id);
}

function isInsideNaturalDeviceScroll(scrollY, deltaY, stops) {
  const deviceTop = getStop(stops, 'p3')?.top;
  const deviceCards = getStop(stops, 'p3.5')?.top;
  if (deviceTop == null || deviceCards == null) return false;

  if (deltaY > 0) {
    return scrollY >= deviceTop - NATURAL_TOLERANCE && scrollY < deviceCards - NATURAL_TOLERANCE;
  }

  return scrollY <= deviceCards + NATURAL_TOLERANCE && scrollY > deviceTop + NATURAL_TOLERANCE;
}

function nextStop(scrollY, deltaY, stops) {
  if (deltaY > 0) {
    return stops.find((stop) => stop.top > scrollY + SNAP_TOLERANCE) || stops[stops.length - 1];
  }

  for (let index = stops.length - 1; index >= 0; index -= 1) {
    if (stops[index].top < scrollY - SNAP_TOLERANCE) return stops[index];
  }

  return stops[0];
}

export function useWheelPaging() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isPaging = false;
    let unlockTimer = 0;

    const unlock = () => {
      isPaging = false;
      unlockTimer = 0;
    };

    const handleWheel = (event) => {
      if (!mediaQuery.matches) return;
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || isEditableTarget(event.target)) return;

      const deltaY = event.deltaY;
      if (Math.abs(deltaY) < 8) return;

      const stops = buildPagingStops();
      if (stops.length < 2) return;

      const scrollY = window.scrollY;
      if (isInsideNaturalDeviceScroll(scrollY, deltaY, stops)) return;

      const target = nextStop(scrollY, deltaY, stops);
      if (!target || Math.abs(target.top - scrollY) < 4) return;

      event.preventDefault();
      if (isPaging) return;

      isPaging = true;
      window.scrollTo({
        top: target.top,
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });

      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(unlock, LOCK_MS);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.clearTimeout(unlockTimer);
    };
  }, []);
}
