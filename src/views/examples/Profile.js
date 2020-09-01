/*!

=========================================================
* Argon Design System React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-design-system-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-design-system-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
/////////////////////
// BEGIN Imports
/////////////////////
import React, { useEffect, useState, useCallback } from "react";

// Axios allows for API Calls
import axios from 'axios';

// reactstrap components
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardImg,
  Form,
  FormGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
  Label
} from "reactstrap";

// Easy way to turn JSON response into React table
import { JsonTable } from 'react-json-to-html';

// Easy way to load and add a script tag dynamically in React, but safer to add to actual dependencies at build manually.
import Script from "react-load-script";

// Emotion Loading UI and Spinners
import { css } from "@emotion/core";
import SyncLoader from "react-spinners/SyncLoader";

// Core Argon Design components
import DemoNavbar from "components/Navbars/DemoNavbar.js";
import SimpleFooter from "components/Footers/SimpleFooter.js";

// Firebase and FireStore Stuff
import firebase from "firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection, useDocument, useCollectionData } from 'react-firebase-hooks/firestore';

// History router system
import { useHistory } from "react-router-dom";

// Plaid Hooks & React Component Integration
import { usePlaidLink } from 'react-plaid-link';

// VGS iFrame Styles
import './style.css';

//
import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_mINpQlNrTKcgeulH6sqYxaBi00VgBYLtva');

// styles for VGS Collect fields
const styles = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI"',
}

// TODO: Move this inside function and/or state management system
//let plaidLinkToken = false;


/////////////////////
// BEGIN Profile Page
/////////////////////
const Profile = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plaidLinkToken, setplaidLinkToken] = useState('');
  const [plaidPublicToken, setplaidPublicToken] = useState('');
  // TODO: Move Access Token to Backend before production <IMPORTANT>
  const [plaidAccessToken, setplaidAccessToken] = useState('');

  const [plaidTransactionData, setplaidTransactionData] = useState({
    "Student": { name: "Jack", email: "jack@xyz.com" },
    "Student id": 888,
    "Sponsors": [
      { name: "john", email: "john@@xyz.com" },
      { name: "jane", email: "jane@@xyz.com" }
    ]
  });
  const [loaded, setloaded] = useState("false");


  // Firebase Auth Config
  let provider = new firebase.auth.GoogleAuthProvider();

  const [user, loading, error] = useAuthState(firebase.auth());
  console.log("Auth state", user, loading, error);

  // Get user info --> wait --> start
  var db = firebase.firestore();
  console.log("Firestore Database", db);

  let FSquery;

  if (user && user.uid) {
    FSquery = db.collection('customers').doc(user.uid);
  }

  const [FSValue, FSLoading, FSError] = useDocument(
    FSquery,
    {
      //snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  // Form object to be used by VGS for encryption
  const [VGSForm, setVGSForm] = useState();

  // History router system
  const history = useHistory();


  // How to get Stripe data from Firestore 
  // /products/prod_Hm9MHn6ILmz9z0/prices/price_1HCb3mHqP4iSCjPNP5xj6Gpv

  // Data structure in db products collections and docs
  // Data:   //price_1HDZW4HqP4iSCjPNrXkR5Z4q
  //var docRef = db.collection("products").doc("prod_Hm9MHn6ILmz9z0").collection("prices").doc("price_1HCb3mHqP4iSCjPNP5xj6Gpv");


  // React Plaid Integration ||| BEGIN

  // 1) Get a Link token from https://us-central1-clowte-prototype.cloudfunctions.net/app/create_link_token
  // Use that link token to populate the Plaid Link config field below

  // BEGIN HYDRATION
  // Hydrate the page with API requests here
  if (loaded === "false") {
    setloaded("true");
    axios.post(`https://us-central1-clowte-prototype.cloudfunctions.net/app/create_link_token`, { user })
      .then(res => {
        console.log("AXIOS RESPONSE | ", res);
        console.log("AXIOS RESPONSE DATA | ", res.data);
        setplaidLinkToken(res.data.link_token);
      })
  }

  const onSuccess = useCallback(
    (token, metadata) => {
      //Received Public Token
      console.log('onSuccess', token, metadata);
      setplaidPublicToken(token);

      const currentUID = firebase.auth().currentUser.uid;

      // Exchange Public Token for Access Token
      axios.post(`https://us-central1-clowte-prototype.cloudfunctions.net/app/get_access_token`, {
        "public_token": token,
        "uid": currentUID
      })
        .then(res => {
          console.log("AXIOS PUBLIC TOKEN EXCHANGE RESPONSE | ", res);
          console.log("AXIOS PUBLIC TOKEN EXCHANGE RESPONSE DATA | ", res.data);
          console.log("AXIOS PUBLIC TOKEN EXCHANGE RESPONSE ACCESS TOKEN | ", res.data.access_token);
          setplaidAccessToken(res.data.access_token);
          //TODO the access token returned here should instead be stored in FireStore rather than returned to client



        })


      // axios.post(`https://us-central1-clowte-prototype.cloudfunctions.net/app/get_transactions`, {
      //   "uid": currentUID,
      //   "access_token": plaidAccessToken
      // })
      //   .then(newres => {
      //     console.log("AXIOS TRANSACTION RESPONSE | ", newres);
      //     console.log("AXIOS TRANSACTION RESPONSE DATA | ", newres.data);
      //     //TODO the access token returned here should instead be stored in FireStore rather than returned to client

      //     setplaidTransactionData(newres);
      //   })

    }, []
  );

  const onEvent = useCallback(
    (eventName, metadata) => console.log('onEvent', eventName, metadata),
    []
  );

  const onExit = useCallback(
    (err, metadata) => console.log('onExit', err, metadata),
    []
  );

  let config = {
    token: plaidLinkToken,
    onSuccess,
    onEvent,
    onExit,
    // –– optional parameters
    // receivedRedirectUri: props.receivedRedirectUri || null,
    // ...
  };

  const { open, ready, PlaidError } = usePlaidLink(config);






  const queryTransactions = async (event) => {


    axios.post(`http://localhost:4001/clowte-prototype/us-central1/app/get_transactions`, {
      "uid": user.uid,
      "access_token": plaidAccessToken
    })
      .then(newres => {
        console.log("AXIOS TRANSACTION RESPONSE | ", newres);
        console.log("AXIOS TRANSACTION RESPONSE DATA | ", newres.data);
        //TODO the access token returned here should instead be stored in FireStore rather than returned to client

        setplaidTransactionData(newres.data);
      })
  }



  // React Plaid Integration ||| END


  // Functions to handle Auth Buttons
  const signinClick = async (event) => {
    console.log("Got click!!!!!");

    firebase.auth().signInWithPopup(provider).then(function (result) {
      // return result.user.updateProfile({
      //   displayName: name
      // })
    }).then(() => {
      console.log("We did it!!!!");
    }).catch(function (FBerror) {
      // Handle Errors here.
      var errorCode = FBerror.code;
      var errorMessage = FBerror.message;
      // ...
      console.log("We didn't do it :( ", errorCode, errorMessage);
    });
  }

  const signoutClick = async (event, buttonContext) => {
    firebase.auth().signOut();
  }

  // Function to handle Stripe Subscription Checkout Click
  const handleClick = async (event, buttonContext) => {
    const user = firebase.auth().currentUser;

    console.log("Current UID:", user.uid);
    console.log("buttonContext | ", buttonContext);

    const docRef = await db.collection('customers')
      .doc(user.uid)
      .collection('checkout_sessions')
      .add({
        price: buttonContext, // select the price based on selection
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      })

    console.log("WE CREATED A NEW CHECKOUT SESSION | ", docRef);

    const stripe = await stripePromise;

    // Wait for the CheckoutSession to get attached by the extension
    docRef.onSnapshot((snap) => {
      console.log("Got snapshot:", snap);

      const { sessionId } = snap.data(); // This is actually the same as const  sessionId  = snap.data().session;

      if (sessionId) {
        // We have a session, let's redirect to Checkout
        // Init Stripe
        stripe.redirectToCheckout({ sessionId });
      }
    });

    // // Call your backend to create the Checkout session.
    // // Attach fetchCheckoutSession() to Firestore current session or what?
    // const sessionId = 'cs_test_uiU8reJoqb6MLt7eSKQkr3OFAggxIfSux8ORFPZSxQr4UYgdOnGSK1P1' // await fetchCheckoutSession();
    // // When the customer clicks on the button, redirect them to Checkout.
    // const stripe = await stripePromise;
    // console.log("MY STRIPE SESSION ID", { sessionId })
    // console.log("MY STRIPE | ", stripe)
    // console.log("DID IT REDIRECT?")
    // const { error } = await stripe.redirectToCheckout({ sessionId });
    // // If `redirectToCheckout` fails due to a browser or network
    // // error, display the localized error message to your customer
    // // using `error.message`.
  };

  var userDisplayPhoto = user && user.providerData[0] && user.providerData[0].photoURL;



  const renderFSClosure = () => {
    console.log("Current FS Loading Value | " + FSLoading);
    if (FSError) {
      if (FSError.code) {
        console.log("FS ERROR CODE ||| " + FSError.code);
        console.log("FS ERROR MESSAGE ||| " + FSError.message);
        return JSON.stringify(FSError)
      }
    } else {
      if (FSLoading) {
        return "Loading FireStore"
      }
    }
    if (FSValue) {
      if (FSValue.data() === undefined) {
        console.log("MY FS VALUES UNDEFINED | Create a Stripe user / Checkout")
        return "MY FS VALUES UNDEFINED | Create a Stripe user / Checkout"
      }
      else {
        console.log("MY FS VALUES | " + JSON.stringify(FSValue.data()))
        return "FS Values here | " + JSON.stringify(FSValue.data())
      }
    }
  }

  // <span>
  //   Collection:{' '}
  //   {value.docs.map(doc => (
  //     <React.Fragment key={doc.id}>
  //       {JSON.stringify(doc.data())},{' '}
  //     </React.Fragment>
  //   ))}
  //     }


  const renderUserIDClosure = () => {
    if (loading) {
      return "Loading";
    } else {
      if (user) {
        //console.log("USER TOKEN | ", user.getIdTokenResult());
        // https://firebase.google.com/docs/auth/web/manage-users#get_the_currently_signed-in_user
        //console.log("USER TOKEN RESULTS | ", user.displayName, user.email, user.photoURL, user.emailVerified);
        //console.log("PROVIDER DETAILS | ", firebase.auth().currentUser.email, firebase.auth().currentUser, firebase.auth().currentUser.providerData[0].displayName);

        // Display Name for Google Signed In Users is actually stored within provider data object in firebase.auth().currentUser.providerData[0].displayName

        return user.uid;
      } else {
        return "Not logged in";
      }
    }
  }



  const renderUserClosure = () => {
    if (loading) {
      return "Loading";
    } else {
      if (user) {
        //console.log("USER TOKEN | ", user.getIdTokenResult());
        // https://firebase.google.com/docs/auth/web/manage-users#get_the_currently_signed-in_user
        //console.log("USER TOKEN RESULTS | ", user.displayName, user.email, user.photoURL, user.emailVerified);
        //console.log("PROVIDER DETAILS | ", firebase.auth().currentUser.email, firebase.auth().currentUser, firebase.auth().currentUser.providerData[0].displayName);

        // Display Name for Google Signed In Users is actually stored within provider data object in firebase.auth().currentUser.providerData[0].displayName
        var userDisplayName = user.providerData[0].displayName;
        userDisplayPhoto = user.providerData[0].photoURL;

        console.log("userDisplayName", userDisplayName, "userDisplayPhoto", userDisplayPhoto);

        return "Hello " + userDisplayName;
      } else {
        return "Not logged in";
      }
    }
  }


  // Adding VGS Example using import Script from "react-load-script";
  // See https://www.verygoodsecurity.com/docs/vgs-collect/js/overview

  useEffect(() => {
    console.log("WE LOADED THE SCRIPT!!!");
    if (window) {
      console.log("Current Window Info | ", window.VGSCollect);

      const VGSFormTemp = window.VGSCollect.create('tntxduntaqi', 'sandbox', (state) => {
        console.log("MY VGS STATE | ", state);
      });

      setVGSForm(VGSFormTemp);

      VGSFormTemp.field('#cc-holder', {
        type: 'text',
        name: 'card_holder',
        placeholder: 'Card holder name',
        validations: ['required'],
        css: styles,
      });

      VGSFormTemp.field('#cc-number', {
        type: 'card-number',
        name: 'card_number',
        successColor: '#4F8A10',
        errorColor: '#D8000C',
        placeholder: 'Card number',
        showCardIcon: true,
        validations: ['required', 'validCardNumber'],
        css: styles,
      });

      VGSFormTemp.field('#cc-cvc', {
        type: 'card-security-code',
        name: 'card_cvc',
        successColor: '#4F8A10',
        errorColor: '#D8000C',
        placeholder: 'CVC',
        maxLength: 3,
        validations: ['required', 'validCardSecurityCode'],
        css: styles,
      });

      VGSFormTemp.field('#cc-expiration-date', {
        type: 'card-expiration-date',
        name: 'card_exp',
        successColor: '#4F8A10',
        errorColor: '#D8000C',
        placeholder: 'MM / YY',
        validations: ['required', 'validCardExpirationDate'],
        css: styles,
      }, []);

      VGSFormTemp.field("#pii-ssn", {
        type: "text",
        name: "ssn",
        validations: ["required"],
        placeholder: "XXX-XX-XXXX",
        css: styles
      });


      console.log("MY VGS FORM | ", VGSFormTemp);

    }
  }, []);

  // VGS Collect form submission
  const handleSubmit = async (e) => {
    const token = await user.getIdToken();

    console.log("Got user ID token", token);



    e.preventDefault();
    VGSForm.submit(
      '/app/vgs/receiveSocial',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      },
      (status, response) => {
        console.log("VGS STATUS AND RESPONSE | ", status, response);
      },
      (vgserror) => {
        console.log("VGS ERROR | ", vgserror);
      }
    );
  };


  return (
    <>
      <DemoNavbar />
      <main className="profile-page">
        <section className="section-profile-cover section-shaped my-0">
          {/* Circles background */}
          <div className="shape shape-style-1 shape-default alpha-4">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          {/* SVG separator */}
          <div className="separator separator-bottom separator-skew">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
              <polygon
                className="fill-white"
                points="2560 0 2560 100 0 100"
              />
            </svg>
          </div>
        </section>
        <section className="section">
          <Container>
            <Card className="card-profile shadow mt--300">
              <div className="px-4">
                <Row className="justify-content-center">
                  <Col className="order-lg-2" lg="3">
                    <div className="card-profile-image">
                      <a href="#pablo" onClick={e => e.preventDefault()}>
                        <img
                          alt="..."
                          className="rounded-circle"
                          src={userDisplayPhoto}
                        />
                      </a>
                    </div>
                  </Col>
                  <Col
                    className="order-lg-3 text-lg-right align-self-lg-center"
                    lg="4"
                  >
                    <div className="card-profile-actions py-4 mt-lg-0">
                      <Button
                        className="mr-4"
                        color="info"
                        href="#pablo"
                        role="link" onClick={(e) => { signinClick(e) }}
                        size="sm"
                      >
                        Quick Login
                        </Button>


                      <Button
                        className="float-right"
                        color="default"
                        href="#pablo"
                        onClick={e => { signoutClick(e) }}
                        size="sm"
                      >
                        Logout
                        </Button>
                    </div>
                  </Col>
                  <Col className="order-lg-1" lg="4">
                    <div className="card-profile-stats d-flex justify-content-center">
                      <div>
                        <span className="heading">22</span>
                        <span className="description">Friends</span>
                      </div>
                      <div>
                        <span className="heading">10</span>
                        <span className="description">Photos</span>
                      </div>
                      <div>
                        <span className="heading">89</span>
                        <span className="description">Comments</span>
                      </div>
                    </div>
                  </Col>
                </Row>
                <div className="text-center mt-5">
                  <h3>

                    {renderUserClosure()}
                  </h3>

                  <div>
                    {renderFSClosure()}
                  </div>

                  <div className="h6 mt-4">
                    <i className="ni business_briefcase-24 mr-2" />
                      Current Subscription | Inactive
                    </div>

                </div>

                <div className="mt-5 py-5 border-top text-left">
                  <Row className="justify-content-center">
                    <Col lg="9">
                      <h3>Profile Info Details</h3>


                      {/* Adding Collect Form Example here */}
                      <Form onSubmit={e => { handleSubmit(e) }}>
                        <div id="cc-holder" className="form-field"></div>
                        <div id="cc-number" className="form-field"></div>
                        <div className="form-field-group">
                          <div id="cc-expiration-date" className="form-field"></div>
                          <div id="cc-cvc" className="form-field"></div>
                        </div>
                        <div id="pii-ssn" className="form-field"></div>
                        <Button
                          className="float-left"
                          color="default"
                          href="#pablo"
                          type="submit"
                          onClick={e => { handleSubmit(e) }}
                          size="sm"
                        >
                          Submit VGS Secured Data
                        </Button>


                      </Form>
                      {/* STOP Collect Form Example here */}
                    </Col>
                  </Row>


                  <Row className="mt-5 py-5 border-top justify-content-center">
                    <Col lg="9">
                      <Button onClick={() => open()} disabled={!ready || PlaidError}>
                        Connect a bank account
                      </Button>
                      <p> </p>
                      <h2>Plaid Developer Information</h2>
                      <p>Your current Firebase UID is: {renderUserIDClosure()}</p>
                      <p>Your current Plaid loaded State is: {loaded}</p>
                      <p>Your current Plaid Link Token is: {plaidLinkToken} </p>
                      <p>Your current Plaid Public Token is: {plaidPublicToken} </p>
                      {/* TODO: IMPORTANT Remove Access Token from production */}
                      <p>Your current Plaid Access Token is: {plaidAccessToken} </p>

                      <Button onClick={() => queryTransactions()}>
                        Get Transactions
                      </Button>

                      <h1>Transaction Data</h1>
                      <JsonTable json={plaidTransactionData} />


                    </Col>
                  </Row>

                  <Row className="mt-5 py-5 border-top justify-content-center">
                    <Col lg="9">
                      <p>
                        Welcome to Clowte! We are excited to help you on your credit journey. <br />
                      </p>
                      <a href="#pablo" onClick={e => e.preventDefault()}>
                        Show more
                        </a>
                    </Col>
                  </Row>

                  {/* Adding Subscription Purchase Options Here */}
                  <div className="mt-5 py-5 border-top text-center">
                    <Row>
                      {/* Basic Subscription Card*/}
                      <Col lg="4">
                        <Card className="card-lift--hover shadow border-0">
                          <CardBody className="py-5">
                            <div className="icon icon-shape icon-shape-primary rounded-circle mb-4">
                              <i className="ni ni-check-bold" />
                            </div>
                            <h6 className="text-primary text-uppercase">
                              Basic Membership
                          </h6>
                            <p className="description mt-3">
                              <b>Includes:</b><br />
                            • Credit Reporting<br />
                            • Credit Score
                          </p>
                            <div>
                              <Badge color="primary" pill className="mr-1">
                                $10 per Month
                            </Badge>
                            </div>
                            <Button
                              className="mt-4"
                              color="primary"
                              href="#pablo"
                              onClick={(e) => { handleClick(e, "price_1HF6JOHqP4iSCjPN9SqpbTwf") }}
                            >
                              Subscribe
                          </Button>
                          </CardBody>
                        </Card>
                      </Col>

                      {/* Advanced Subscription Card*/}
                      <Col lg="4">
                        <Card className="card-lift--hover shadow border-0">
                          <CardBody className="py-5">
                            <div className="icon icon-shape icon-shape-success rounded-circle mb-4">
                              <i className="ni ni-istanbul" />
                            </div>
                            <h6 className="text-success text-uppercase">
                              Advanced Membership
                          </h6>
                            <p className="description mt-3">
                              <b>Includes:</b><br />
                            • Basic Features<br />
                            • Annual Rebates
                          </p>
                            <div>
                              <Badge color="success" pill className="mr-1">
                                $25 per Month
                            </Badge>
                            </div>
                            <Button
                              className="mt-4"
                              color="success"
                              href="#pablo"
                              onClick={(e) => { handleClick(e, "price_1HF6KPHqP4iSCjPNmnwQJRWW") }}
                            >
                              Subscribe
                          </Button>
                          </CardBody>
                        </Card>
                      </Col>

                      {/* Elite Subscription Card*/}
                      <Col lg="4">
                        <Card className="card-lift--hover shadow border-0">
                          <CardBody className="py-5">
                            <div className="icon icon-shape icon-shape-warning rounded-circle mb-4">
                              <i className="ni ni-planet" />
                            </div>
                            <h6 className="text-warning text-uppercase">
                              Elite Membership
                          </h6>
                            <p className="description mt-3">
                              <b>Includes:</b><br />
                            • Advanced Features<br />
                            • Monthly Rebates
                          </p>
                            <div>
                              <Badge color="warning" pill className="mr-1">
                                $50 per Month
                            </Badge>
                            </div>
                            <Button
                              className="mt-4"
                              color="warning"
                              href="#pablo"
                              onClick={(e) => { handleClick(e, "price_1HF6KZHqP4iSCjPNtt8ATsq6") }}
                            >
                              Subscribe
                          </Button>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
              <SyncLoader
                size={15}
                color={"#2dce89"}
                loading={true}
              />
            </Card>
          </Container>
        </section>
      </main>
      <SimpleFooter />
    </>
  )
}

export default Profile;