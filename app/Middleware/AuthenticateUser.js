'use strict'

class AuthenticateUser {
	async handle ({ request, auth, response }, next) {
    // call next to advance the request
    try {
    	await auth.check()
    } catch (error) {
    	response.redirect('/login')
    }
    await next()
}
}

module.exports = AuthenticateUser
