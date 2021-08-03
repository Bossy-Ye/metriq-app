import React from 'react'

class FormFieldSelectRow extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      value: this.props.defaultValue ? this.props.defaultValue : ''
    }

    this.handleOnFieldChange = this.handleOnFieldChange.bind(this)
    this.handleOnFieldBlur = this.handleOnFieldBlur.bind(this)
    this.isValidValue = this.isValidValue.bind(this)
  }

  isValidValue (value) {
    if (!this.props.validRegex) {
      return true
    }
    return this.props.validRegex.test(value)
  }

  handleOnFieldChange (event) {
    // for a regular input field, read field name and value from the event
    const fieldName = event.target.name
    const fieldValue = event.target.value
    this.setState({ value: fieldValue })
    if (this.isValidValue(fieldValue)) {
      this.setState({ invalid: false })
    }
    this.props.onChange(fieldName, fieldValue)
  }

  handleOnFieldBlur (event) {
    this.setState({ invalid: !this.isValidValue(this.state.value) })
  }

  render () {
    return (
      <div className='row'>
        <label htmlFor={this.props.inputName} className='col-md-3'>{this.props.label}</label>
        <div className='col-md-6'>
          <select
            id={this.props.inputName}
            name={this.props.inputName}
            className='form-control'
            onChange={this.handleOnFieldChange}
            onBlur={this.handleOnFieldBlur}
          >
            {this.props.options.map(option =>
              <option key={option._id} value={option._id}>{option.name}</option>
            )}
          </select>
        </div>
        <div className='col-md-3' />
      </div>
    )
  }
};

export default FormFieldSelectRow
