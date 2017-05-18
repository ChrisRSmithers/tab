import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationForm from './ConfirmationForm';
import TextField from 'material-ui/TextField';
import { login, getOrCreate } from '../../utils/cognito-auth';
import { goTo, goToDashboard } from 'navigation/navigation';

import {
  blue500,
} from 'material-ui/styles/colors';

class LoginForm extends React.Component {
  
  constructor(props) {
    super(props);
    this.password = null;

    this.state = {
      password: null,
      created: false,
      confirmed: true,
    }
  }

  _handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleSubmit();
    }
  }

  handleSubmit() {
  	if(this.password.input && this.password.input.value) {
      const password = this.password.input.value.trim();

      getOrCreate(this.props.email, password, 
        (response, created, confirmed) => {
          if(!created && confirmed) {
            this.goToApp();
            return;
          } 

          this.setState({
            password: password,
            created: created,
            confirmed: confirmed,
          });
        },
        (err) => {
          console.error(err);
        })
  	}
  }

  logUserIn(password, success, failure) {
    login(this.props.email, password, (res) => {
        success();
      }, (err) => {
        if(failure)
          failure();
        console.error(err);
      });
  }

  goToApp() {
    goToDashboard();
  }

  onConfirmed() {
    this.logUserIn(this.state.password, this.goToCreateNewUser, (err) => {
      console.error(err);
    });
  }

  goToCreateNewUser() {
    goTo('/new-user');
  }

  render() {

    if(!this.state.confirmed) {
      return (<ConfirmationForm 
                email={this.props.email}
                onConfirmed={this.onConfirmed.bind(this)}/>);
    }
  	
  	const main = {
  		backgroundColor: blue500,
  		height: '100%',
  		width: '100%',
  		display: 'flex',
  		justifyContent: 'center',
  		alignItems: 'center',
  	};

  	const floatingLabelStyle = {
  		color: '#FFF',
  	};

  	const inputStyle = {
  		color: '#FFF',
  	};

    return (
    	<div style={main}>
    		<TextField
    		  ref={(input) => { this.password = input; }}
    		  onKeyPress = {this._handleKeyPress.bind(this)}
		      floatingLabelText="Password"
		      floatingLabelStyle={floatingLabelStyle}
          type={"password"}
		      inputStyle={inputStyle}/>
		  </div>
    );
  }
}

LoginForm.propTypes = {
	email: PropTypes.string.isRequired,
} 

export default LoginForm;