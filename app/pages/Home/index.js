import Page from 'classes/Page'

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
    create() {
        super.create()
    }
}