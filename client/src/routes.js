import React, { Component } from "react";
import { Route, Router, Switch } from "react-router-dom";

import HeaderBar from "./Components/HeaderBar/HeaderBar";

import Home from "./Components/Home/Home";
import Profile from "./Components/Profile/Profile";
import About from "./Components/About/About";
import Callback from "./Components/Callback/Callback";
import EmptyRoute from "./Components/EmptyRoute/EmptyRoute";

import Auth from "./Auth/Auth";
import history from "./Utility/history";
import Requests from "./Utility/Requests";

import "./routes.css";

const auth = new Auth();

class RoutesContainer extends Component {
  /* This gets the userId from the access token when the user is logged in and refreshes the page.
   * This is called only once immediately after the initial rendering
   */
  componentDidMount() {
    auth.getUserProfile(this.setUserProfile);
  }

  state = {
    user: {
      userId: null,
      firstName: null,
      lastName: null,
      email: null,
      emailVerified: null
    }
  };

  //Q: Why are there brackets around location?
  //TODO: implement getting name from DB
  handleAuthentication = async ({ location }) => {
    if (/access_token|id_token|error/.test(location.hash)) {
      await auth.handleAuthentication(
        this.doSetUserProfile,
        Requests.insertUserIfNew
      );
    }
  };

  /* This is the callback for the auth0's getUserProfile()
   * If there's an error, meaning the access token is incorrect, then we log out,
   * else we call the helper function to set the profile
   */
  setUserProfile = (err, user) => {
    if (err) {
      //TODO: fix references to log out here
      //console.log("setUserProfile: "+err);
      //this.child.logout();
      return;
    }
    this.doSetUserProfile(user);
  };

  doSetUserProfile = user => {
    const newUser = {
      userId: user.sub,
      firstName: this.state.user.firstName, //the first and last name are set the current states' because we 
      lastName: this.state.user.lastName,   //don't want to change the value and need to let setFirstAndLastName() set the values
      email: user.email,
      emailVerified: user.email_verified
    };
    this.setState({ user: newUser });
    this.setFirstAndLastName(user.sub);
  };

  setFirstAndLastName = async (userId) => {
    const user = (await Requests.userExists(userId))[0]; //userExists returns a list of users, so we select the 1st one
    this.doSetFirstAndLastName(user.first_name, user.last_name);
  };

  /* Passed to the Profile route to set user info */
  doSetFirstAndLastName = (firstName, lastName) => {
    const newUser = {
      userId: this.state.user.userId,
      firstName: firstName,
      lastName: lastName,
      email: this.state.user.email,
      emailVerified: this.state.user.emailVerified
    }
    this.setState({user: newUser});
  };

  /* Passed as prop to LoginControl to be used when logging out */
  clearUserId = () => {
    const nullUser = {
      userId: null,
      firstName: null,
      lastName: null,
      email: null,
      emailVerified: null
    };
    this.setState({ user: nullUser });
  };

  render() {
    //console.log("render(): " + JSON.stringify(this.state, null, 4));

    return (
      //NOTE: the "container" classname is from bootstrap and makes our content centered instead of using 100% width

      <div>
        <HeaderBar
          user={this.state.user}
          /*onRef={ref => (this.child = ref)}*/
          history={history}
          auth={auth}
          setUserProfile={this.setUserProfile}
          clearUserId={this.clearUserId}
          insertUserIfNew={Request.insertUserIfNew}
        />
        <div className="container">
          <div className="body-top-padding" />
          <Router history={history}>
            <Switch>
                <Route
                  exact
                  path="(/|/home)"
                  render={props => (
                    <Home
                      auth={auth}
                      user={this.state.user}
                      requests={Requests}
                      {...props}
                    />
                  )}
                />
                <Route
                  exact
                  path="/profile"
                  render={props => (
                    <Profile
                      auth={auth}
                      user={this.state.user}
                      requests={Requests}
                      setNames={this.doSetFirstAndLastName}
                      {...props}
                    />
                  )}
                />
                <Route
                  exact
                  path="/about"
                  render={props => (
                    <About
                      auth={auth}
                      user={this.state.user}
                      requests={Requests}
                      {...props}
                    />
                  )}
                />
                <Route
                  path="/callback"
                  render={props => {
                    this.handleAuthentication(props);
                    return <Callback {...props} />;
                  }}
                />
                <Route path="/*" render={props => <EmptyRoute />} />
            </Switch>
          </Router>
        </div>
      </div>
    );
  }
}

export default RoutesContainer;
