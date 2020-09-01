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
import React from "react";

// reactstrap components
import { Container, Row } from "reactstrap";

// core components
import DemoNavbar from "components/Navbars/DemoNavbar.js";
import CardsFooter from "components/Footers/CardsFooter.js";

// index page sections
import Hero from "./IndexSections/Hero.js";
import Buttons from "./IndexSections/Buttons.js";
import Inputs from "./IndexSections/Inputs.js";
import CustomControls from "./IndexSections/CustomControls.js";
import Menus from "./IndexSections/Menus.js";
import Navbars from "./IndexSections/Navbars.js";
import Tabs from "./IndexSections/Tabs.js";
import Progress from "./IndexSections/Progress.js";
import Pagination from "./IndexSections/Pagination.js";
import Pills from "./IndexSections/Pills.js";
import Labels from "./IndexSections/Labels.js";
import Alerts from "./IndexSections/Alerts.js";
import Typography from "./IndexSections/Typography.js";
import Modals from "./IndexSections/Modals.js";
import Datepicker from "./IndexSections/Datepicker.js";
import TooltipPopover from "./IndexSections/TooltipPopover.js";
import Carousel from "./IndexSections/Carousel.js";
import Icons from "./IndexSections/Icons.js";
import Login from "./IndexSections/Login.js";
import Download from "./IndexSections/Download.js";

// https://github.com/CSFrequency/react-firebase-hooks/tree/master/auth
import firebase from "firebase";
import { useAuthState } from 'react-firebase-hooks/auth';

//TODO: Add Logout button via FirebaseAuth

/* const renderUserUtility = (user, loading) => {
  if (loading) {
    return "Loading";
  } else {
    if (user) {
      return "Hello " + user.email;
    } else {
      return "Not logged in";
    }
  }
} */

const Index = () => {

  const [user, loading, error] = useAuthState(firebase.auth());
  console.log("Auth state", user, loading, error);

  const renderUserClosure = () => {
    if (loading) {
      return "Loading";
    } else {
      if (user) {
        return "Hello " + user.email;
      } else {
        return "Not logged in";
      }
    }
  }

  return (
    <>
      <DemoNavbar />
      <main>
        <Hero />
        <div>
          {renderUserClosure()}
        </div>
        <Buttons />
        <Inputs />
        <section className="section">
          <Container>
            <CustomControls />
            <Menus />
          </Container>
        </section>
        <Navbars />
        <section className="section section-components">
          <Container>
            <Tabs />
            <Row className="row-grid justify-content-between align-items-center mt-lg">
              <Progress />
              <Pagination />
            </Row>
            <Row className="row-grid justify-content-between">
              <Pills />
              <Labels />
            </Row>
            <Alerts />
            <Typography />
            <Modals />
            <Datepicker />
            <TooltipPopover />
          </Container>
        </section>
        <Carousel />
        <Icons />
        <Login />
        <Download />
      </main>
      <CardsFooter />
    </>
  );
}

export default Index;
