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
  app.post('/updateApplication', mid.requiresLogin, controllers.Application.updateApplication);
  app.post('/deleteApplication', mid.requiresLogin, controllers.Application.deleteApplication);

  app.get('/getAccountInfo', mid.requiresLogin, controllers.Account.getAccountInfo);
  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
  app.post('/togglePremium', mid.requiresLogin, controllers.Account.togglePremium);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  // anything unmatched gets the 404 page
  app.use((req, res) => res.status(404).render('notFound'));
};

module.exports = router;
