// https://peterhrynkow.com/firebase/2018/08/01/firebase-with-create-react-post.html
'use strict';

// BEGIN Plaid Needed Stuff
var util = require('util');
var envvar = require('envvar');
var bodyParser = require('body-parser');
var moment = require('moment');
var plaid = require('plaid');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

var APP_PORT = '8000';
var PLAID_CLIENT_ID = '5f3706263c63b400115b97bb';
var PLAID_SECRET = 'b4dcdc038626faca4fe6fa3071dff1';
var PLAID_ENV = 'sandbox';

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
var PLAID_PRODUCTS = 'transactions';

// PLAID_PRODUCTS is a comma-separated list of countries for which users
// will be able to select institutions from.
var PLAID_COUNTRY_CODES = 'US';

// Parameters used for the OAuth redirect Link flow.
//
// Set PLAID_REDIRECT_URI to 'http://localhost:8000/oauth-response.html'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
var PLAID_REDIRECT_URI = '';

// We store the access_token in memory - in production, store it in a secure
// persistent data store
var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;
// The payment_id is only relevant for the UK Payment Initiation product.
// We store the payment_id in memory - in production, store it in a secure
// persistent data store
var PAYMENT_ID = null;

// Initialize the Plaid client
// See https://plaid.com/docs/upgrade-to-link-tokens/#add-a-new-endpoint
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)
const plaidClient = new plaid.Client({
  clientID: PLAID_CLIENT_ID,
  secret: PLAID_SECRET,
  env: plaid.environments[PLAID_ENV],
  options: {
    version: '2019-05-29',
  }
});

// END Plaid Config Stuff

const functions = require('firebase-functions');
const express = require('express');
const app = express();

// parse application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//app.use(express.json()) // for parsing application/json

// Need to require / import for Node 10 logging compatibility on Firebase (Google broke stuff from Node 8 to 10)
const backwardCompatLogger = require('firebase-functions/lib/logger/compat');

const cors = require('cors')({ origin: true });
app.use(cors);


app.get('/', (req, res) => {
  const date = new Date();
  const hours = (date.getHours() % 12) + 1;  // London is UTC + 1hr;

  console.log("GETTING | WORKING EXPRESS 4");
  console.log("GETTING | WORKING EXPRESS 4 | REQ |||||", req);
  console.log("GETTING | WORKING EXPRESS 4 | HEADER |||||", req.headers["user-agent"]);
  console.log("GETTING | WORKING EXPRESS 4 | BODY |||||", req.body);

  res.send(`
    <!doctype html>
    <head>
      <title>Time</title>
      <link rel="stylesheet" href="/style.css">
      <script src="/script.js"></script>
    </head>
    <body>
      <p>In London, the clock strikes:
        <span id="bongs">${'YAY '.repeat(hours)}</span></p>
      <button onClick="refresh(this)">Refresh</button>
    </body>
  </html>`);
});

app.post('/', (req, res) => {

  console.log("POSTING | WORKING EXPRESS 4 | PLAID | APP_PORT || ", APP_PORT);
  console.log("POSTING | WORKING EXPRESS 4 | PLAID | PLAID_CLIENT_ID || ", PLAID_CLIENT_ID);
  console.log("POSTING | WORKING EXPRESS 4 | PLAID | PLAID_SECRET || ", PLAID_SECRET);
  console.log("POSTING | WORKING EXPRESS 4 | PLAID | PLAID_ENV || ", PLAID_ENV);
  //console.log("POSTING | WORKING EXPRESS 4 | FULL REQ |||||", req);
  console.log("POSTING | WORKING EXPRESS 4 | HEADER |||||", req.headers["user-agent"]);
  console.log("POSTING | WORKING EXPRESS 4 | BODY |||||", req.body);


  res.send("Response Goes Here Mr. Walker")
});

app.post('/firestore', async function (req, res) {


  // Push the new message into Cloud Firestore using the Firebase Admin SDK.

  // Send back a message that we've succesfully written the message


  // res.send("Hello Mr. Walker")


  // TESTING BEGIN

  try {
    const writeResult = await db.collection('customers').add({ "hello": "world" });
    console.log('Successfully wrote to FireStore | writeResult Value | ', writeResult);
  } catch (error) {
    console.error('Error while accessing FIRESTORE:', error);
    res.status(403).send('Unauthorized');
    return;
  }
  res.send("Successfully wrote to FireStore ");

  /// TESTING END
});


app.get('/api', (req, res) => {
  const date = new Date();
  const hours = (date.getHours() % 12) + 1;  // London is UTC + 1hr;
  res.json({ bongs: 'YIP '.repeat(hours) });
});


// Plaid Create Link Token endpoint 

app.post('/create_link_token', async function (request, response, next) {
  // 1. Grab the client_user_id by searching for the current user in your database
  const user = "testing_vin_user" //TODO: await User.find(...);
  const clientUserId = "testing_vin_user_id";

  // 2. Create a link_token for the given user
  plaidClient.createLinkToken({
    user: {
      client_user_id: clientUserId,
    },
    client_name: 'Clowte',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'en',
    webhook: 'https://sample.webhook.com',
  }, (err, res) => {
    const link_token = res.link_token;

    // 3. Send the data to the client
    console.log("PLAID LINK TOKEN | ", link_token)
    response.json({ link_token });
  });
});

// Plaid Create Link Token endpoint 

app.post('/get_access_token', async function (request, response, next) {
  const public_token = request.body.public_token;
  const requestor_uid = request.body.uid;

  plaidClient.exchangePublicToken(public_token, async function (error, res) {
    if (error != null) {
      console.log('Could not exchange public_token!' + '\n' + error);
      return res.json({ error: msg });
    }

    // Store the access_token and item_id in your database
    ACCESS_TOKEN = res.access_token;
    ITEM_ID = res.item_id;
    //METADATA = response.me //could add request id

    console.log('Access Token: ' + ACCESS_TOKEN);
    console.log('Item ID: ' + ITEM_ID);
    console.log('Requestor UID: ' + requestor_uid)


    // Store access_token in Firebase for long term persistence

    try {
      const writeResult = await db.collection('customers').doc(requestor_uid).update({ "access_token": ACCESS_TOKEN });
      console.log('Successfully wrote to FireStore | writeResult Value | ', writeResult);
    } catch (error) {
      console.error('Error while accessing FIRESTORE:', error);
      res.status(403).send('Unauthorized');
      return;
    }


    response.json({
      error: false,
      'access_token_was_stored': true,
      'item_id': ITEM_ID,
      'requestor_uid': requestor_uid
    });
  });
});


// Pull transactions for a date range
app.post('/get_transactions', function (request, response, next) {
  const requestor_uid = request.body.uid;
  const access_token = "access-sandbox-49d72610-5410-40ae-861e-ff06a7136854"; //Replace with FireStore real time value

  console.log("GET TRANSACTIONS REQUEST DATA | ", requestor_uid, access_token)

  plaidClient.getTransactions(access_token, '2018-01-01', '2018-02-01', {
    count: 250,
    offset: 0,
  }, (err, result) => {
    // Handle err
    const transactions = result.transactions;
    console.log("TRANSACTIONS", result);
    response.json(result)
  });

});


// Get the User's SSN through a callback from VGS
app.post('/vgs/receiveSocial', async (req, res) => {
  console.log("Got request from VGS!", req.body);

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.');
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
    return;
  }
  res.send(`Hello Mr. ${req.user.name}`);
});

exports.app = functions.https.onRequest(app);

/*
exports.bigben = functions.https.onRequest((req, res) => {
  const hours = (new Date().getHours() % 12) + 1  // London is UTC + 1hr;
  res.status(200).send(`<!doctype html>
    <head>
      <title>Time</title>
    </head>
    <body>
      ${'BONG '.repeat(hours)}
    </body>
  </html>`);
});
*/