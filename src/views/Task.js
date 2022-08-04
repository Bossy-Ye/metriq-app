import axios from 'axios'
import React, { Suspense } from 'react'
import config from './../config'
import Table from 'rc-table'
import ErrorHandler from './../components/ErrorHandler'
import FormFieldRow from '../components/FormFieldRow'
import FormFieldWideRow from '../components/FormFieldWideRow'
import FormFieldSelectRow from '../components/FormFieldSelectRow'
import { Button, Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CategoryScroll from '../components/CategoryScroll'
import { parse } from 'json2csv'
import Commento from '../components/Commento'
import TooltipTrigger from '../components/TooltipTrigger'
import SocialShareIcons from '../components/SocialShareIcons'
const SotaChart = React.lazy(() => import('../components/SotaChart'))

library.add(faEdit)

class Task extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      requestFailedMessage: '',
      showEditModal: false,
      task: { description: '', parentTask: 0 },
      item: { submissions: [], childTasks: [], parentTask: {} },
      allTaskNames: [],
      results: [],
      resultsJson: [],
      isLowerBetterDict: {},
      isLog: false
    }

    this.handleShowEditModal = this.handleShowEditModal.bind(this)
    this.handleHideEditModal = this.handleHideEditModal.bind(this)
    this.handleEditModalDone = this.handleEditModalDone.bind(this)
    this.handleOnChange = this.handleOnChange.bind(this)
    this.handleTrimTasks = this.handleTrimTasks.bind(this)
    this.handleCsvExport = this.handleCsvExport.bind(this)
    this.handleOnLoadData = this.handleOnLoadData.bind(this)
  }

  handleShowEditModal () {
    let mode = 'Edit'
    if (!this.props.isLoggedIn) {
      mode = 'Login'
    }
    const task = {
      description: this.state.item.description,
      parentTask: { id: this.state.item.parentTask.id, name: this.state.item.parentTask.name }
    }
    this.setState({ showEditModal: true, modalMode: mode, task: task })
  }

  handleHideEditModal () {
    this.setState({ showEditModal: false })
  }

  handleEditModalDone () {
    if (!this.props.isLoggedIn) {
      this.props.history.push('/Login')
    }

    const reqBody = {
      description: this.state.task.description,
      parentTask: this.state.task.parentTask
    }

    axios.post(config.api.getUriPrefix() + '/task/' + this.props.match.params.id, reqBody)
      .then(res => {
        this.setState({ item: res.data.data, showEditModal: false })
      })
      .catch(err => {
        window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
      })
  }

  handleOnChange (key1, key2, value) {
    if (!value && value !== false) {
      value = null
    }
    if (key1) {
      const k1 = this.state[key1]
      k1[key2] = value
      this.setState({ [key1]: k1 })
    } else {
      this.setState({ [key2]: value })
    }
  }

  handleTrimTasks (taskId, tasks) {
    for (let j = 0; j < tasks.length; j++) {
      if (taskId === tasks[j].id) {
        tasks.splice(j, 1)
        break
      }
    }
    tasks.sort(function (a, b) {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
      return 0
    })
  }

  componentDidMount () {
    window.scrollTo(0, 0)

    const taskNamesRoute = config.api.getUriPrefix() + '/task/names'
    axios.get(taskNamesRoute)
      .then(res => {
        const tasks = [...res.data.data]
        this.handleTrimTasks(this.props.match.params.id, tasks)
        this.setState({ requestFailedMessage: '', allTaskNames: tasks })
      })
      .catch(err => {
        this.setState({ requestFailedMessage: ErrorHandler(err) })
      })
  }

  handleOnLoadData (task) {
    const results = task.results
    const resultsJson = results.map(row =>
      ({
        key: row.id,
        submissionId: task.submissions.find(e => e.name === row.submissionName).id,
        platformName: row.platformName,
        methodName: row.methodName,
        metricName: row.metricName,
        metricValue: row.metricValue,
        tableDate: row.evaluatedAt ? new Date(row.evaluatedAt).toLocaleDateString() : new Date(row.createdAt).toLocaleDateString(),
        history: this.props.history
      }))
    this.setState({ requestFailedMessage: '', item: task, results: results, resultsJson: resultsJson })
  }

  handleCsvExport () {
    const fields = Object.keys(this.state.resultsJson[0])
    const opts = { fields }
    const csv = parse(this.state.resultsJson, opts)

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv))
    element.setAttribute('download', this.state.item.name)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
  }

  render () {
    return (
      <div id='metriq-main-content'>
        <div className='container submission-detail-container'>
          {!this.state.item.isHideChart &&
            <Suspense fallback={<div>Loading...</div>}>
              <SotaChart
                chartId='task-detail'
                xLabel='Time'
                taskId={this.props.match.params.id}
                onLoadData={this.handleOnLoadData}
              />
            </Suspense>}
          <FormFieldWideRow>
            <div><h1>{this.state.item.fullName ? this.state.item.fullName : this.state.item.name}</h1></div>
            <div className='submission-description'>
              {this.state.item.description ? this.state.item.description : <i>No description provided.</i>}
            </div>
          </FormFieldWideRow>
          <FormFieldWideRow>
            <TooltipTrigger message='Edit task'>
              <Button aria-label='Edit task' className='submission-button' variant='secondary' onClick={this.handleShowEditModal}>
                <FontAwesomeIcon icon='edit' />
              </Button>
            </TooltipTrigger>
            <SocialShareIcons url={config.api.getUriPrefix() + '/task/' + this.props.match.params.id} />
          </FormFieldWideRow>
          <br />
          {this.state.item.parentTask &&
            <div className='row'>
              <div className='col-md-12'>
                <div className='submission-description'>
                  <b>Parent task:</b><Link to={'/Task/' + this.state.item.parentTask.id}>{this.state.item.parentTask.name}</Link>
                </div>
              </div>
              <br />
            </div>}
          {(this.state.item.childTasks && (this.state.item.childTasks.length > 0)) &&
            <div>
              <h2>Child Tasks</h2>
              <CategoryScroll type='task' items={this.state.item.childTasks} isLoggedIn={this.props.isLoggedIn} />
              <br />
            </div>}
          {(this.state.results.length > 0) &&
            <h2>Results <Button variant='primary' onClick={this.handleCsvExport}>Export to CSV</Button></h2>}
          {(this.state.results.length > 0) &&
            <FormFieldWideRow>
              <Table
                className='detail-table'
                columns={[{
                  title: 'Submission',
                  dataIndex: 'name',
                  key: 'name',
                  width: 250
                },
                {
                  title: 'Method',
                  dataIndex: 'methodName',
                  key: 'methodName',
                  width: 250
                },
                {
                  title: 'Platform',
                  dataIndex: 'platformName',
                  key: 'platformName',
                  width: 250
                },
                {
                  title: 'Date',
                  dataIndex: 'tableDate',
                  key: 'tableDate',
                  width: 250
                },
                {
                  title: 'Metric',
                  dataIndex: 'metricName',
                  key: 'metricName',
                  width: 250
                },
                {
                  title: 'Value',
                  dataIndex: 'metricValue',
                  key: 'metricValue',
                  width: 250
                }]}
                data={this.state.resultsJson}
                onRow={(record) => ({
                  onClick () { record.history.push('/Submission/' + record.submissionId) }
                })}
                tableLayout='auto'
                rowClassName='link'
              />
            </FormFieldWideRow>}
          {(this.state.item.submissions.length > 0) &&
            <div>
              <h2>Submissions</h2>
              <FormFieldWideRow>
                <Table
                  className='detail-table'
                  columns={[{
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name',
                    width: 700
                  },
                  {
                    title: 'Submitted',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    width: 200
                  },
                  {
                    title: 'Up-votes',
                    dataIndex: 'upvoteCount',
                    key: 'upvoteCount',
                    width: 200
                  }]}
                  data={this.state.item.submissions.map(row => ({
                    key: row.id,
                    name: row.name,
                    createdAt: new Date(row.createdAt).toLocaleDateString('en-US'),
                    upvoteCount: row.upvoteCount || 0,
                    history: this.props.history
                  }))}
                  onRow={(record) => ({
                    onClick () { record.history.push('/Submission/' + record.key) }
                  })}
                  tableLayout='auto'
                  rowClassName='link'
                />
              </FormFieldWideRow>
              <br />
            </div>}
          <div />
          <FormFieldWideRow>
            <hr />
            <Commento id={'task-' + toString(this.state.item.id)} />
          </FormFieldWideRow>
        </div>
        <Modal
          show={this.state.showEditModal}
          onHide={this.handleHideEditModal}
          size='lg'
          aria-labelledby='contained-modal-title-vcenter'
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {(this.state.modalMode === 'Login') &&
              <span>
                Please <Link to='/Login'>login</Link> before editing.
              </span>}
            {(this.state.modalMode !== 'Login') &&
              <span>
                <FormFieldSelectRow
                  inputName='parentTask'
                  label='Parent task'
                  options={this.state.allTaskNames}
                  value={this.state.task.parentTask.id}
                  onChange={(field, value) => this.handleOnChange('task', field, value)}
                  tooltip='The new task is a sub-task of a "parent" task.'
                /><br />
                <FormFieldRow
                  inputName='description' inputType='textarea' label='Description' rows='12'
                  value={this.state.task.description}
                  onChange={(field, value) => this.handleOnChange('task', field, value)}
                />
              </span>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant='primary' onClick={this.handleEditModalDone}>
              {(this.state.modalMode === 'Login') ? 'Cancel' : 'Done'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default Task
