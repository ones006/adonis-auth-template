'use strict'

const { validateAll } = use('Validator')
const User = use('App/Models/User')
const rules = {
	'username': 'required|string|max:80',
	'email': 'required|string|email|max:254',
	'password': 'required|string|min:6|accepted'
}

const messages = {
	'username.required': 'The name field is required.',
	'email.required': 'The email field is required.',
	'password.required': 'The password field is required.'
}

class AuthController {
	async showRegistrationForm ({ view }) {
		return view.render('auth/register')
	}

	async register ({ request, response, view, session, auth }) {
		const validation = await validateAll(request.all(), rules, messages)

		if (validation.fails()) {
			return this.failedRegistration(session, response, validation)
		}

		await this.addUser(request, User)

		await this.login(request, auth)

		return response.redirect('/home')
	}

	failedRegistration (session, response, validation) {
		session
		.withErrors(validation.messages())
		.flashExcept(['password'])

		return response.redirect('back')
	}

	async addUser (request, User) {

		const user = new User()
		const { username, email, password } = request.all()

		user.username 	= username
		user.email 		= email
		user.password 	= password

		await user.save()
	}


	async login (request, auth) {
		const { email, password, remember } = request.all()

		if (request.input('remember', false) !== false) {
			await auth.remember(true)
		}
		await auth.attempt(email, password)
	}

	async logout ({ auth, response }) {
		await auth.logout()

		return response.redirect('/')
	}
}

module.exports = AuthController
