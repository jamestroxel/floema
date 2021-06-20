require('dotenv').config()

const express = require('express')
const errorHandler = require('errorhandler')
const app = express()
const path = require('path')
const port = 3000
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const logger = require('morgan')

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')

app.use(logger('dev'))
app.use(errorHandler())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride())
app.use(express.static(path.join(__dirname, 'public')))

const initApi = req => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req: req
  })
}

const handleLinkResolver = doc => {
  if (doc.type === 'product') return `/detail/${doc.uid}`

  if (doc.type === 'about') return '/about'

  if (doc.type === 'collections') return '/collections'

  return '/'
}

// eslint-disable-next-line no-var

app.use((req, res, next) => {
  res.locals.Link = handleLinkResolver
  res.locals.PrismicDOM = PrismicDOM
  res.locals.Numbers = index => {
    return index === 0
      ? 'One'
      : index === 1
        ? 'Two'
        : index === 2
          ? 'Three'
          : index === 3
            ? 'Four'
            : ''
  }
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const handleRequest = async api => {
  const meta = await api.getSingle('meta')
  const navigation = await api.getSingle('navigation')
  const preloader = await api.getSingle('preloader')

  return {
    meta,
    navigation,
    preloader
  }
}

app.get('/', async (req, res) => {
  const api = await initApi(req)
  const home = await api.getSingle('home')

  const defaults = await handleRequest(api)

  const { results: collections } = await api.query(
    Prismic.Predicates.at('document.type', 'collection'),
    {
      fetchLinks: 'product.image'
    }
  )

  res.render('pages/home', {
    collections,
    home,
    ...defaults
  })
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const about = await api.getSingle('about')

  const defaults = await handleRequest(api)

  res.render('pages/about', {
    about,
    ...defaults
  })
})

app.get('/detail/:uid', async (req, res) => {
  const uid = req.params.uid

  const api = await initApi(req)
  const defaults = await handleRequest(api)

  const product = await api.getByUID('product', uid, {
    fetchLinks: 'collection.title'
  })
  res.render('pages/detail', {
    product,
    ...defaults
  })
})

app.get('/collections', async (req, res) => {
  const api = await initApi(req)
  const home = await api.getSingle('home')
  const { results: collections } = await api.query(
    Prismic.Predicates.at('document.type', 'collection'),
    {
      fetchLinks: 'product.image'
    }
  )
  const defaults = await handleRequest(api)

  res.render('pages/collections', {
    collections,
    home,
    ...defaults
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
