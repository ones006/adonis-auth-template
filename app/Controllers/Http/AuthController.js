'use strict'

const { validateAll } = use('Validator')
const User = use('App/Models/User')
const Event = use('Event')
const uuid = use('uuid')

const resetPassRules = {
	'email': 'required|string|email|max:254'
}

const resetRules = {
	'token': 'required',
	'email': 'required|email',
	'password': 'required|string|min:6|accepted',
	'password_confirmation': 'same:password',
}

const resetMessages = {
	'token.required': 'No reset token.',
	'email.required': 'The email field is required.',
	'password.required': 'The password field is required.',
	'password_confirmation.same': 'Must be the same as password.'
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
	'password': 'required|string|min:6|accepted',
	'password_confirmation': 'same:password'
}

const registrationMessages = {
	'username.required': 'The name field is required.',
	'email.required': 'The email field is required.',
	'password.required': 'The password field is required.',
	'password_confirmation.same': 'Must be the same as password.'
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
		return view.render('auth/passwords/email')
	}

	async sendResetLink ({ request, response, session }) {

		const validation = await validateAll(request.all(), resetPassRules)

		if (validation.fails()) {
			return this.resetLinkResponse(session, response)
		}

		const User = use('App/Models/User')
		
		try {
			await this.sendResetLinkMail (request)
		} catch ( error ) {
			console.log('reset email sending failed')
		}

		return this.resetLinkResponse(session, response)
	}

	async sendResetLinkMail ( request ) {
		const user = await User.findByOrFail('email', request.input('email'))

		await this.revokeResetTokens(user)

		const token = await user.tokens().create({
			token: 	uuid.v4(),
			type: 	'reset_token'
		})
		Event.fire('user.resetPassword', token)
	}

	resetLinkResponse (session, response) {
		session
		.flash({resetPassMessage: 'If a user exists with that email, a reset link will be sent. Please check your inbox.'})

		return response.redirect('back')
	}

	async showResetForm ({ view, params }) {
		return view.render('auth/passwords/reset', params)
	}

	async reset ({ request, session, response, auth }) {
		const validation = await validateAll(request.all(), resetRules, resetMessages)

		if (validation.fails()) {
			return this.failedValidation(session, response, validation)
		}

		let reset = await this.resetPassword(request)

		if (reset !== true) {
			session
			.withErrors({email: 'We could not reset the password for the user with that email.'})

			return response.redirect('back')
		}

		await this.doLogin(request, auth)

		return response.redirect('/home')
	}

	async resetPassword(request) {

		try {
			const user = await User.findByOrFail('email', request.input('email'))

			const token = await user
			.tokens()
			.where('type', 'reset_token')
			.where('is_revoked', false)
			.where('user_id', user.id) // for some reason, this is necessary
			.firstOrFail()

			if (token.token !== request.input('token')) {
				return false
			}

			await this.revokeResetTokens(user)

			user.password = request.input('password')

			await user.save()
		
			return true
		} catch (error) {
			return false
		}

		return true
	}

	async revokeResetTokens (user) {
		await user
		.tokens()
		.where('type', 'reset_token')
		.update({ is_revoked: true })
	}
}

module.exports = AuthController
