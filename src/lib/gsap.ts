import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, MorphSVGPlugin)

export { Flip, gsap, MorphSVGPlugin, ScrollTrigger, SplitText }
