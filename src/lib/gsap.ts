import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, MorphSVGPlugin, MotionPathPlugin)

export { Flip, gsap, MorphSVGPlugin, MotionPathPlugin, ScrollTrigger, SplitText }
