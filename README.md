# Adonis auth application

This is built on top of the [fullstack boilerplate](https://github.com/adonisjs/adonis-fullstack-app) for AdonisJs which comes pre-configured with.

1. Bodyparser
2. Session
3. Authentication
4. Web security middleware
5. CORS
6. Edge template engine
7. Lucid ORM
8. Migrations and seeds

It adds user registration, login and authentication. Also inspired by Laravel's `php artisan make:auth`.

1. Users can register on `http://localhost:3333/register`
2. Users can login on `http://localhost:3333/login`
3. Users can reset their passwords on `http://localhost:3333/password/reset`

## Setup

Use the adonis command to install the blueprint

```bash
adonis new app --blueprint=stephenafamo/adonis-auth-template
```

or manually clone the repo and then run `npm install`.


### Migrations

Run the following command to run startup migrations.

```js
adonis migration:run
```
