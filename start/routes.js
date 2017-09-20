'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/guides/routing
|
*/

const Route = use('Route')

Route.on('/').render('welcome')

Route.on('/home').render('home')

Route.get('/register', 'AuthController.showRegistrationForm').as('register')
Route.post('/register', 'AuthController.register')

Route.post('/logout', 'AuthController.logout').as('logout')
