import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { Flip } from 'gsap/Flip'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, MorphSVGPlugin, MotionPathPlugin, Draggable)

export { Draggable, Flip, gsap, MorphSVGPlugin, MotionPathPlugin, ScrollTrigger, SplitText }
