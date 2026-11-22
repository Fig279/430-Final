const controllers = require('./controllers');
const mid = require('./middleware');

// Maps each URL and HTTP method to its controller function.
const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.get('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/tracker', mid.requiresLogin, controllers.Application.trackerPage);
  app.get('/getApplications', mid.requiresLogin, controllers.Application.getApplications);
  app.post('/tracker', mid.requiresLogin, controllers.Application.makeApplication);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
