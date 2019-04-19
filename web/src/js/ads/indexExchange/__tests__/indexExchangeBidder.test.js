/* eslint-env jest */

jest.mock('js/ads/adSettings')
jest.mock('js/ads/indexExchange/getIndexExchangeTag')
jest.mock('js/ads/google/getGoogleTag')

beforeAll(() => {
  jest.useFakeTimers()
})

beforeEach(() => {
  // Mock the IX tag
  delete window.headertag
  const getIndexExchangeTag = require('js/ads/indexExchange/getIndexExchangeTag')
    .default
  window.headertag = getIndexExchangeTag()

  // Mock tabforacause global
  const { getDefaultTabGlobal } = require('js/utils/test-utils')
  window.tabforacause = getDefaultTabGlobal()

  // Set up googletag
  delete window.googletag
  const getGoogleTag = require('js/ads/google/getGoogleTag').default
  window.googletag = getGoogleTag()
})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  delete window.headertag
  delete window.tabforacause
  delete window.googletag
})

describe('indexExchangeBidder', () => {
  it('runs without error', async () => {
    expect.assertions(0)
    const indexExchangeBidder = require('js/ads/indexExchange/indexExchangeBidder')
      .default
    await indexExchangeBidder()
  })

  it('only gets bids for the leaderboard ad when one ad is enabled', async () => {
    expect.assertions(2)
    const { getNumberOfAdsToShow } = require('js/ads/adSettings')
    getNumberOfAdsToShow.mockReturnValue(1)
    const indexExchangeBidder = require('js/ads/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('js/ads/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    await indexExchangeBidder()
    expect(ixTag.retrieveDemand).toHaveBeenCalled()
    expect(ixTag.retrieveDemand.mock.calls[0][0]).toEqual([
      { htSlotName: 'd-1-728x90-atf-bottom-leaderboard' },
    ])
  })

  it('gets bids for the leaderboard and rectangle ads when two ads are enabled', async () => {
    expect.assertions(2)
    const { getNumberOfAdsToShow } = require('js/ads/adSettings')
    getNumberOfAdsToShow.mockReturnValue(2)
    const indexExchangeBidder = require('js/ads/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('js/ads/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    await indexExchangeBidder()
    expect(ixTag.retrieveDemand).toHaveBeenCalled()
    expect(ixTag.retrieveDemand.mock.calls[0][0]).toEqual([
      { htSlotName: 'd-1-728x90-atf-bottom-leaderboard' },
      { htSlotName: 'd-3-300x250-atf-bottom-right_rectangle' },
    ])
  })

  it('gets bids for the leaderboard and rectangle ads when three ads are enabled', async () => {
    expect.assertions(2)
    const { getNumberOfAdsToShow } = require('js/ads/adSettings')
    getNumberOfAdsToShow.mockReturnValue(3)
    const indexExchangeBidder = require('js/ads/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('js/ads/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    await indexExchangeBidder()
    expect(ixTag.retrieveDemand).toHaveBeenCalled()
    expect(ixTag.retrieveDemand.mock.calls[0][0]).toEqual([
      { htSlotName: 'd-1-728x90-atf-bottom-leaderboard' },
      { htSlotName: 'd-3-300x250-atf-bottom-right_rectangle' },
      { htSlotName: 'd-2-300x250-atf-middle-right_rectangle' },
    ])
  })

  it('the bidder resolves when the bid response returns', done => {
    const indexExchangeBidder = require('js/ads/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('js/ads/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()

    let retrieveDemandCallback
    ixTag.retrieveDemand.mockImplementation((config, callback) => {
      retrieveDemandCallback = callback
    })
    indexExchangeBidder().then(() => {
      done()
    })
    retrieveDemandCallback()
  })

  it('the bidder resolves when we pass the bidder timeout', done => {
    const indexExchangeBidder = require('js/ads/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('js/ads/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()

    // Mock that retrieveDemand never calls the callback.
    ixTag.retrieveDemand.mockImplementation(() => {})
    indexExchangeBidder().then(() => {
      done()
    })

    // Here, bidder timeout is 700ms.
    jest.advanceTimersByTime(701)
  })

  it('sets the expected targeting for Google Ad Manager when all slots have bids', async () => {
    expect.assertions(6)
    const getGoogleTag = require('js/ads/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock the bid response.
    const indexExchangeBidder = require('js/ads/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('js/ads/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const { mockIndexExchangeBidResponse } = require('js/utils/test-utils')
    const mockBidResponse = mockIndexExchangeBidResponse()
    ixTag.retrieveDemand.mockImplementation((config, callback) =>
      callback(mockBidResponse)
    )
    await indexExchangeBidder()
    const googleSlots = googletag.pubads().getSlots()
    const [leaderboardSlot, rectangleSlot, secondRectangleSlot] = googleSlots
    expect(leaderboardSlot.setTargeting).toHaveBeenCalledWith(
      'IOM',
      '728x90_5000'
    )
    expect(leaderboardSlot.setTargeting).toHaveBeenCalledWith(
      'ix_id',
      '_mBnLnF5V'
    )
    expect(rectangleSlot.setTargeting).toHaveBeenCalledWith(
      'IOM',
      '300x250_5000'
    )
    expect(rectangleSlot.setTargeting).toHaveBeenCalledWith(
      'ix_id',
      '_C7VB5HUd'
    )
    expect(secondRectangleSlot.setTargeting).toHaveBeenCalledWith(
      'IOM',
      '300x250_5000'
    )
    expect(secondRectangleSlot.setTargeting).toHaveBeenCalledWith(
      'ix_id',
      '_fB5UzqU2'
    )
  })
})
