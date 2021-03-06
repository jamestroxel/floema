import GSAP from 'gsap'
import each from 'lodash/each'
import map from 'lodash/map'
import Prefix from 'prefix'
import NormalizeWheel from 'normalize-wheel'
import Title from 'animations/Title'
import Body from 'animations/Body'
import Highlight from 'animations/Highlight'
import AsyncLoad from 'classes/AsyncLoad'

import { ColorsManager } from 'classes/Colors'

export default class Page {
  constructor ({
    element,
    elements,
    id
  }) {
    this.selector = element
    this.selectorChildren = {
      ...elements,
      animationsTitles: '[data-animation="title"]',
      animationsBody: '[data-animation="body"]',
      animationsHighlight: '[data-animation="highlight"]',
      preloaders: '[data-src]'
    }

    this.id = id
    this.transformPrefix = Prefix('transform')

    this.scroll = {
      current: 0,
      target: 0,
      last: 0,
      limit: 0
    }

    this.onMouseWheelEvent = this.onMouseWheel.bind(this)
  }

  create () {
    this.element = document.querySelector(this.selector)
    this.elements = {}

    this.scroll = {
      current: 0,
      target: 0,
      last: 0,
      limit: 0
    }
    each(this.selectorChildren, (entry, key) => {
      if (entry instanceof window.HTMLElement || entry instanceof window.NodeList || Array.isArray(entry)) {
        this.elements[key] = entry
      } else {
        this.elements[key] = document.querySelectorAll(entry)

        if (this.elements[key].length === 0) {
          this.elements[key] = null
        } else if (this.elements[key].length === 1) {
          this.elements[key] = document.querySelector(entry)
        }
      }
    })

    this.createAnimations()
    this.createPreloader()
  }

  createAnimations () {
    this.animationsTitles = map(this.elements.animationsTitles, element => {
      return new Title({
        element
      })
    })
    this.animationsBody = map(this.elements.animationsBody, element => {
      return new Body({
        element
      })
    })
    this.animationsHighlight = map(this.elements.animationsHighlight, element => {
      return new Highlight({
        element
      })
    })
  }

  createPreloader () {
    this.preloaders = map(this.elements.preloaders, element => {
      return new AsyncLoad({ element })
    })
  }

  show () {
    return new Promise(resolve => {
      ColorsManager.change({
        backgroundColor: this.element.getAttribute('data-background'),
        color: this.element.getAttribute('data-color')
      })
      this.animationIn = GSAP.timeline()

      this.animationIn.fromTo(this.element, {
        autoAlpha: 0
      }, {
        autoAlpha: 1
      })
      this.animationIn.call(_ => {
        this.addEventListeners()
        resolve()
      })
    })
  }

  hide () {
    return new Promise(resolve => {
      this.removeEventListeners()

      this.animationOut = GSAP.timeline()

      this.animationOut.to(this.element, {
        autoAlpha: 0,
        onComplete: resolve
      })
    })
  }

  onMouseWheel (event) {
    const { pixelY } = NormalizeWheel(event)

    this.scroll.target += pixelY
  }

  onResize () {
    if (this.elements.wrapper) {
      this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight
    }

    each(this.animationsTitles, animation => animation.onResize())
    each(this.animationsBody, animation => animation.onResize())
  }

  update () {
    this.scroll.target = GSAP.utils.clamp(0, this.scroll.limit, this.scroll.target)

    this.scroll.current = GSAP.utils.interpolate(this.scroll.current, this.scroll.target, 0.1)

    if (this.scroll.current < 0.01) {
      this.scroll.current = 0
    }

    if (this.elements.wrapper) {
      this.elements.wrapper.style[this.transformPrefix] = `translateY(-${this.scroll.current}px)`
    }
  }

  addEventListeners () {
    window.addEventListener('mousewheel', this.onMouseWheelEvent)
  }

  removeEventListeners () {
    window.removeEventListener('mousewheel', this.onMouseWheelEvent)
  }

  destroy () {
    this.removeEventListeners()
  }
}
