import React, { useState } from 'react'
import axios from 'axios'
import CategoryItemIcon from './CategoryItemIcon'
import SubscribeButton from './SubscribeButton'
import { useHistory, Link } from 'react-router-dom'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHeart, faExternalLinkAlt, faChartLine } from '@fortawesome/free-solid-svg-icons'
import config from '../config'
import ErrorHandler from './ErrorHandler'
import { renderLatex } from '../components/RenderLatex'

library.add(faHeart, faExternalLinkAlt, faChartLine)

const qedcIds = [34, 2, 97, 142, 150, 172, 173, 174, 175, 176, 177, 178, 179]

const pickDetailUrl = (type, item) => {
  if (type === 'tag') {
    return ('/Tag/' + item.name)
  } else if (type === 'task') {
    return ('/Task/' + item.id)
  } else if (type === 'method') {
    return ('/Method/' + item.id)
  } else if (type === 'platform') {
    return ('/Platform/' + item.id)
  }
}

const CategoryItemBox = (props) => {
  const history = useHistory()
  const [isSubscribed, setIsSubscribed] = useState(props.item.isSubscribed)

  const handleLoginRedirect = (type) => {
    if (type === 'tag') {
      history.push('/Login/Tags')
    } else if (type === 'task') {
      history.push('/Login/Tasks')
    } else if (type === 'method') {
      history.push('/Login/Methods')
    } else if (type === 'platform') {
      history.push('/Login/Platforms')
    }
  }

  const handleSubscribe = () => {
    if (props.isLoggedIn) {
      axios.post(config.api.getUriPrefix() + '/' + props.type + '/' + (props.type === 'tag' ? encodeURIComponent(props.item.name) : props.item.id) + '/subscribe', {})
        .then(res => {
          if (props.type === 'tag') {
            setIsSubscribed(res.data.data)
          } else {
            setIsSubscribed(!!res.data.data.isSubscribed)
          }
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else {
      handleLoginRedirect(props.type)
    }
  }

  return (
    <td className={props.isPreview ? undefined : 'submission-cell'}>
      <div className='submission'>
        <Link to={pickDetailUrl(props.type, props.item)} className='category-item-box'>
          {props.type !== 'tag' && props.item.description &&
            <div>
              <div className='submission-heading'>
                {props.item.name}
                {props.type === 'task' && qedcIds.includes(parseInt(props.item.id)) &&
                  <span> <Link to='/QEDC'><span className='link'>(QED-C)</span></Link></span>}
              </div>
              <div className='submission-description'>{renderLatex(
                !props.item.description
                  ? ''
                  : ((!props.isPreview && (props.item.description.length > 128))
                      ? (props.item.description.substring(0, 125) + '...')
                      : props.item.description))}
              </div>
            </div>}
          {(props.type === 'tag' || !props.item.description) &&
            <div className='submission-heading-only'>{props.item.name}</div>}
        </Link>
        <br />
        <SubscribeButton isSubscribed={isSubscribed} typeLabel={props.type} onSubscribe={handleSubscribe} />
        {!props.isPreview &&
          <span>
            <CategoryItemIcon count={props.item.resultCount} type={props.type} word='results' icon={faChartLine} />
            <CategoryItemIcon count={props.item.submissionCount} type={props.type} word='submissions' icon={faExternalLinkAlt} />
            <CategoryItemIcon count={props.item.upvoteTotal} type={props.type} word='up-votes' icon={faHeart} />
          </span>}
      </div>
    </td>
  )
}

export default CategoryItemBox
