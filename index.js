// Build a server based game.  The client should send a call whenever info added
// It will need to store new info in the session

// Define dependencies and build variables
const express = require('express');
const bodyParser = require('body-parser');
const mustache = require('mustache-express');

const routes = require('./routes');
const postRoutes = require('./post-routes');
const dbRoutes = require('./db-routes');

var mstchObj = {}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.engine('mustache', mustache());
app.set('view engine', 'mustache')
app.set('views', './views')
app.use(express.static(__dirname));

app.use(routes);
app.use(postRoutes);
app.use(dbRoutes);

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
  console.log('visit http://localhost:3000/mystery');
})
