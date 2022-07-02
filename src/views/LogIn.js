import axios from 'axios'
import React from 'react'
import { Link } from 'react-router-dom'
import config from './../config'
import FormFieldRow from '../components/FormFieldRow'
import FormFieldValidator from '../components/FormFieldValidator'
import PasswordVisibleControlRow from '../components/PasswordVisibleControlRow'
import ErrorHandler from '../components/ErrorHandler'
import FormFieldAlert from '../components/FormFieldAlert'

const usernameMissingError = 'Username cannot be blank.'
const passwordInvalidError = 'Password is too short.'

const usernameValidRegex = /^(?!\s*$).+/

class LogIn extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      isRequestFailed: false,
      requestFailedMessage: '',
      isValidated: false,
      isPasswordVisible: false
    }

    this.handleOnChange = this.handleOnChange.bind(this)
    this.isAllValid = this.isAllValid.bind(this)
    this.handleOnSubmit = this.handleOnSubmit.bind(this)
  }

  handleOnChange (field, value) {
    // parent class change handler is always called with field name and value
    this.setState({ [field]: value, isValidated: false })
  }

  isAllValid () {
    if (!usernameValidRegex.test(this.state.username)) {
      return false
    }

    if (!this.state.isValidated) {
      this.setState({ isValidated: true })
    }

    return true
  }

  handleOnSubmit (event) {
    if (!this.isAllValid()) {
      event.preventDefault()
      return
    }

    const request = {
      username: this.state.username,
      password: this.state.password
    }

    axios.post(config.api.getUriPrefix() + '/login', request)
      .then(res => {
        this.props.onLogin()
      })
      .catch(err => {
        this.setState({ isRequestFailed: true, requestFailedMessage: ErrorHandler(err) })
      })
    event.preventDefault()
  }

  render () {
    return (
      <div id='metriq-main-content' className='container'>
        <header><h4>Log In</h4></header>
        <form onSubmit={this.handleOnSubmit}>
          <FormFieldRow
            inputName='username' inputType='text' label='Username'
            validatorMessage={usernameMissingError}
            onChange={this.handleOnChange}
            validRegex={usernameValidRegex}
          />
          <FormFieldRow
            inputName='password' inputType={this.state.isPasswordVisible ? 'text' : 'password'} label='Password'
            validatorMessage={passwordInvalidError}
            onChange={this.handleOnChange}
          />
          <PasswordVisibleControlRow
            inputName='isPasswordVisible'
            onChange={this.handleOnChange}
          />
          <FormFieldAlert>
            <FormFieldValidator invalid={this.state.isRequestFailed} message={this.state.requestFailedMessage} />
          </FormFieldAlert>
          <div className='row'>
            <div className='col-md-12 text-center'>
              <input className='btn btn-primary' type='submit' value='Submit' disabled={!this.state.isValidated && !this.isAllValid()} />
            </div>
          </div>
        </form>
        <Link to={this.props.next ? '/Register/' + this.props.next : '/Register'}>Create a new account</Link><br />
        <Link to='/Forgot'>Forgot username/password?</Link>
      </div>
    )
  }
}

export default LogIn
