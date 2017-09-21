'use strict'

const { validateAll } = use('Validator')
const User = use('App/Models/User')
const Mail = use('Mail')

const resetPassRules = {
	'email': 'required|string|email|max:254'
}

const loginRules = {
	'email': 'required|string|email|max:254',
	'password': 'required|string|min:6|accepted'
}

const loginMessages = {
	'email.required': 'The email field is required.',
	'password.required': 'The password field is required.'
}

const registrationRules = {
	'username': 'required|string|max:80',
	'email': 'required|string|email|max:254',
	'password': 'required|string|min:6|accepted'
}

const registrationMessages = {
	'username.required': 'The name field is required.',
	'email.required': 'The email field is required.',
	'password.required': 'The password field is required.'
}

class AuthController {
	async showLoginForm ({ view }) {
		return view.render('auth/login')
	}

	async login ({ request, response, view, session, auth }) {
		const validation = await validateAll(request.all(), loginRules, loginMessages)

		if (validation.fails()) {
			return this.failedValidation(session, response, validation)
		}

		await this.doLogin(request, auth)

		return response.redirect('/home')
	}

	async showRegistrationForm ({ view }) {
		return view.render('auth/register')
	}

	async register ({ request, response, view, session, auth }) {
		const validation = await validateAll(request.all(), registrationRules, registrationMessages)

		if (validation.fails()) {
			return this.failedValidation(session, response, validation)
		}

		await this.addUser(request, User)

		await this.doLogin(request, auth)

		return response.redirect('/home')
	}

	failedValidation (session, response, validation) {
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

	async doLogin (request, auth) {
		const { email, password, remember } = request.all()

		if (request.input('remember', false) !== false) {
			await auth.remember(true)
		}
		await auth.attempt(email, password)
	}

	async logout ({ auth, response }) {
		await auth.logout()

		return response.redirect('/login')
	}

	async showLinkRequestForm ({ view }) {
		return view.render('auth/passwords/email');
	}

	async sendResetLink ({ request, response, session }) {

		const validation = await validateAll(request.all(), resetPassRules)

		if (validation.fails()) {
			return this.resetLinkResponse(session, response)
		}

		const User = use('App/Models/User')
		
		try {
			await User.findByOrFail('email', request.input('email'))
			// await this.sendResetLinkEmail
		} catch ( error ) {

		}

		return this.resetLinkResponse(session, response)
	}

	resetLinkResponse (session, response) {
		session
		.flash({resetPassMessage: 'If the user exist, a reset link will be sent. Please check your inbox.'})

		return response.redirect('back')
	}

	async sendResetLinkEmail (User) {
		await Mail.send('emails.reset', user.toJSON(), (message) => {
			message
			.to(user.email)
			.from('<from-email>')
			.subject('Welcome to yardstick')
		})
	}
}

module.exports = AuthController
