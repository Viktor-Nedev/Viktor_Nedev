import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registered once, centrally, so plugin state can't be double-registered.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
