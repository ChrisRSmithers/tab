/* eslint-env jest */

import React from 'react'
import {
  shallow
} from 'enzyme'
import toJson from 'enzyme-to-json'

jest.mock('utils/client-location')
jest.mock('ads/consentManagement')
jest.mock('mutations/LogUserDataConsentMutation')

afterEach(() => {
  jest.clearAllMocks()
})

describe('LogConsentDataComponent', function () {
  it('renders without error and does not have any DOM elements', () => {
    const LogConsentDataComponent = require('../LogConsentDataComponent').default
    const wrapper = shallow(
      <LogConsentDataComponent
        user={{ id: 'abcdefghijklmno' }}
        relay={{ environment: {} }}
      />
    )
    expect(toJson(wrapper)).toEqual('')
  })

  it('registers callback with the CMP for data consent update (when in the EU)', async () => {
    expect.assertions(1)

    // Mock that the client is in the EU
    const isInEuropeanUnion = require('utils/client-location').isInEuropeanUnion
    isInEuropeanUnion.mockResolvedValue(true)

    const LogConsentDataComponent = require('../LogConsentDataComponent').default
    const wrapper = shallow(
      <LogConsentDataComponent
        user={{ id: 'abcdefghijklmno' }}
        relay={{ environment: {} }}
      />
    )
    await wrapper.instance().componentWillMount()
    wrapper.update()
    const registerConsentCallback = require('ads/consentManagement').registerConsentCallback
    expect(registerConsentCallback).toHaveBeenCalled()
  })

  it('does not register callback with the CMP for data consent update (when not in the EU)', async () => {
    // Mock that the client is not in the EU
    const isInEuropeanUnion = require('utils/client-location').isInEuropeanUnion
    isInEuropeanUnion.mockResolvedValue(false)

    const LogConsentDataComponent = require('../LogConsentDataComponent').default
    const wrapper = shallow(
      <LogConsentDataComponent
        user={{ id: 'abcdefghijklmno' }}
        relay={{ environment: {} }}
      />
    )
    await wrapper.instance().componentWillMount()
    wrapper.update()
    const registerConsentCallback = require('ads/consentManagement').registerConsentCallback
    expect(registerConsentCallback).not.toHaveBeenCalled()
  })

  it('logs the consent data when the CMP calls the callback', async () => {
    expect.assertions(8)

    // Mock the callback registration so we can trigger it ourselves
    var cmpCallback
    const registerConsentCallback = require('ads/consentManagement').registerConsentCallback
    registerConsentCallback.mockImplementationOnce(cb => {
      cmpCallback = cb
    })

    // Mock that the client is in the EU
    const isInEuropeanUnion = require('utils/client-location').isInEuropeanUnion
    isInEuropeanUnion.mockResolvedValue(true)

    const LogConsentDataComponent = require('../LogConsentDataComponent').default
    const wrapper = shallow(
      <LogConsentDataComponent
        user={{ id: 'abcdefghijklmno' }}
        relay={{ environment: {} }}
      />
    )
    await wrapper.instance().componentWillMount()
    await cmpCallback('some-consent-string', true)

    // Check that it calls the mutation.
    const LogUserDataConsentMutation = require('mutations/LogUserDataConsentMutation').default
    expect(LogUserDataConsentMutation).toHaveBeenCalledTimes(1)
    expect(LogUserDataConsentMutation.mock.calls[0][0]).toEqual({})
    expect(LogUserDataConsentMutation.mock.calls[0][1]).toEqual('abcdefghijklmno')
    expect(LogUserDataConsentMutation.mock.calls[0][2]).toEqual('some-consent-string')
    expect(LogUserDataConsentMutation.mock.calls[0][3]).toBe(true)
    expect(typeof (LogUserDataConsentMutation.mock.calls[0][4])).toBe('function')

    // Call the success callback on the mutation to confirm it
    // marks the data as logged.
    const markConsentDataAsLogged = require('ads/consentManagement')
      .markConsentDataAsLogged
    expect(markConsentDataAsLogged).not.toHaveBeenCalled()
    const __runOnCompleted = require('mutations/LogUserDataConsentMutation').__runOnCompleted
    __runOnCompleted()
    expect(markConsentDataAsLogged).toHaveBeenCalled()
  })

  it('logs the consent data when localStorage says we have new consent data to log', async () => {
    expect.assertions(4)
    const LogUserDataConsentMutation = require('mutations/LogUserDataConsentMutation').default

    // Mock that localStorage says we need to log new consentData
    const checkIfNewConsentNeedsToBeLogged = require('ads/consentManagement')
      .checkIfNewConsentNeedsToBeLogged
    checkIfNewConsentNeedsToBeLogged.mockReturnValueOnce(true)

    // Mock CMP values
    const getConsentString = require('ads/consentManagement').getConsentString
    getConsentString.mockResolvedValue('this-is-my-string')
    const hasGlobalConsent = require('ads/consentManagement').hasGlobalConsent
    hasGlobalConsent.mockResolvedValue(true)

    // Mock that the client is in the EU
    const isInEuropeanUnion = require('utils/client-location').isInEuropeanUnion
    isInEuropeanUnion.mockResolvedValue(true)

    const LogConsentDataComponent = require('../LogConsentDataComponent').default
    const wrapper = shallow(
      <LogConsentDataComponent
        user={{ id: 'xyz123' }}
        relay={{ environment: {} }}
      />
    )
    await wrapper.instance().componentWillMount()

    // Flush all promises
    await new Promise(resolve => setImmediate(resolve))

    // Check that it calls the mutation.
    expect(LogUserDataConsentMutation).toHaveBeenCalledTimes(1)
    expect(LogUserDataConsentMutation.mock.calls[0][0]).toEqual({})
    expect(LogUserDataConsentMutation.mock.calls[0][1]).toEqual('xyz123')
    expect(LogUserDataConsentMutation.mock.calls[0][2]).toEqual('this-is-my-string')
  })

  it('re-registers the consent data callback when the callback is called', async () => {
    expect.assertions(2)

    // Mock the callback registration so we can trigger it ourselves
    var cmpCallback
    const registerConsentCallback = require('ads/consentManagement').registerConsentCallback
    registerConsentCallback.mockImplementation(cb => {
      cmpCallback = cb
    })

    // Mock that the client is in the EU
    const isInEuropeanUnion = require('utils/client-location').isInEuropeanUnion
    isInEuropeanUnion.mockResolvedValue(true)

    const LogConsentDataComponent = require('../LogConsentDataComponent').default
    const wrapper = shallow(
      <LogConsentDataComponent
        user={{ id: 'abcdefghijklmno' }}
        relay={{ environment: {} }}
      />
    )
    await wrapper.instance().componentWillMount()

    // The component should have registered a callback on mount.
    expect(registerConsentCallback).toHaveBeenCalled()

    // The component should register a new callback after the
    // original callback is called.
    jest.clearAllMocks()
    await cmpCallback('some-consent-string', true)
    expect(registerConsentCallback).toHaveBeenCalledTimes(1)
  })
})
