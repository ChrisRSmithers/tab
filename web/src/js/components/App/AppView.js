/* global graphql */

import React from 'react'
import {QueryRenderer} from 'react-relay/compat'
import environment from '../../../relay-env'
import AuthUserComponent from 'general/AuthUserComponent'

import AppContainer from './AppContainer'

class AppView extends React.Component {
  render () {
    return (
      <AuthUserComponent>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query AppViewQuery($userId: String!) {
              user(userId: $userId) {
                ...AppContainer_user
              }
            }
          `}
          render={({error, props}) => {
            if (error) {
              console.error(error)
              return
            }

            if (props) {
              return (
                <AppContainer
                  user={props.user} />
              )
            } else {
              return null
            }
          }} />
      </AuthUserComponent>
    )
  }
}

export default AppView
