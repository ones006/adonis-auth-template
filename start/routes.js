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

Route.on('/home').render('home').middleware(['Auth'])

// Registration Routes...
Route.get('/register', 'AuthController.showRegistrationForm').as('register')
Route.post('/register', 'AuthController.register')

// Authentication Routes...
Route.get('/login', 'AuthController.showLoginForm').as('login')
Route.post('/login', 'AuthController.login')
Route.post('/logout', 'AuthController.logout').as('logout')

// Password Reset Routes...
Route.get('/password/reset', 'AuthController.showLinkRequestForm').as('password.request')
Route.post('/password/email', 'AuthController.sendResetLink').as('password.email')
Route.get('password/reset/:token', 'AuthController.showResetForm').as('password.reset');
