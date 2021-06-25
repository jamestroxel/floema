import Page from 'classes/Page'
import Button from 'classes/Button'

export default class Home extends Page {
  constructor () {
    super({
      id: 'Home',

      element: '.home',
      elements: {
        navigation: document.querySelector('.navigation'),
        button: '.home__link'
      }
    })
  }

  create () {
    super.create()
    this.link = new Button({
      element: this.elements.button
    })
  }

  destroy () {
      super.destroy()
    this.link.removeEventListeners()
  }
}
