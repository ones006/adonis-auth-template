'use strict'

const Env = use('Env')
const Mail = use('Mail')

const User = exports = module.exports = {}

User.sendResetLink = async (token) => {

    let appUrl = Env.get('APP_URL', '')
    let env = {
    	appName: 		Env.get('APP_NAME', ''),
    	appUrl: 		Env.get('APP_URL', ''),
    	mailFrom: 		Env.get('MAIL_FROM', ''),
    	mailFromName: 	Env.get('MAIL_FROM_NAME', ''),
    }

	const user = await token.user().fetch()

	await Mail.send(['emails.password-reset.html', 'emails.password-reset.text'], { user: user, token: token, env: env}, (message) => {
		message
		.to(user.email)
		.from(env.mailFrom, env.mailFromName)
		.subject('Reset Password')
	})
}
