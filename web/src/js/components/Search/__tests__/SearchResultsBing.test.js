/* eslint-env jest */

import React from 'react'
import { mount, shallow } from 'enzyme'
import { range } from 'lodash/util'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Link from 'js/components/General/Link'
import { showBingPagination } from 'js/utils/search-utils'
import SearchResultItem from 'js/components/Search/SearchResultItem'

jest.mock('js/components/Search/SearchResultItem')
jest.mock('js/components/General/Link')
jest.mock('js/utils/search-utils')

const getMockProps = () => ({
  classes: {},
  data: {
    pole: [],
    mainline: [
      {
        type: 'WebPages',
        key: 'some-key-1',
        value: {
          data: 'here',
        },
      },
      {
        type: 'WebPages',
        key: 'some-key-2',
        value: {
          data: 'here',
        },
      },
    ],
    sidebar: [
      {
        type: 'WebPages',
        key: 'some-key-3',
        value: {
          data: 'here',
        },
      },
      {
        type: 'WebPages',
        key: 'some-key-4',
        value: {
          data: 'here',
        },
      },
    ],
  },
  isEmptyQuery: false,
  isError: false,
  isQueryInProgress: false,
  noSearchResults: false,
  onPageChange: jest.fn(),
  page: 1,
  query: 'healthy salad recipes, not tacos',
})

beforeEach(() => {
  // Disable pagination until it's fully functional.
  showBingPagination.mockReturnValue(false)

  jest.clearAllMocks()
})

describe('SearchResultsBing: tests for non-results display', () => {
  it('renders without error', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    shallow(<SearchResultsBing {...mockProps} />)
  })

  it('applies style to the root element', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.style = {
      background: '#FF0000',
    }
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(
      wrapper
        .find('div')
        .first()
        .prop('style')
    ).toMatchObject({
      background: '#FF0000',
    })
  })

  it('shows "no results" when the search does not yield results', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'foo'
    mockProps.noSearchResults = true
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(
      wrapper
        .find(Typography)
        .filterWhere(
          n => n.render().text() === `No results found for ${mockProps.query}`
        ).length
    ).toBe(1)
  })

  it('sets a min-height to the results container when the query is still in progress', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'pizza'
    mockProps.isError = false
    mockProps.isEmptyQuery = false
    mockProps.noSearchResults = false
    mockProps.isQueryInProgress = true // waiting for a response
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.get(0).props.style.minHeight).toBe(1000)
  })

  it('removes the a min-height from the results container when the search is successful', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'pizza'
    mockProps.isError = false
    mockProps.isEmptyQuery = false
    mockProps.noSearchResults = false
    mockProps.isQueryInProgress = false
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.get(0).props.style.minHeight).toBe(0)
  })

  it('removes the a min-height from the results container when the query is empty', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = ''
    mockProps.isError = false
    mockProps.isEmptyQuery = true // empty query
    mockProps.noSearchResults = false
    mockProps.isQueryInProgress = false
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.get(0).props.style.minHeight).toBe(0)
  })

  it('removes the a min-height from the results container if there are no search results', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'this search will yield no results, sadly'
    mockProps.noSearchResults = true
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.get(0).props.style.minHeight).toBe(0)
  })

  it('removes the a min-height from the results container if there is an error when searching', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'tacos please'
    mockProps.isError = true
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.get(0).props.style.minHeight).toBe(0)
  })

  it('shows an error message when there is some unexpected error', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'foo'
    mockProps.isError = true
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(
      wrapper
        .find(Typography)
        .filterWhere(
          n => n.render().text() === 'Unable to search at this time.'
        ).length
    ).toBe(1)
  })

  it('shows a button to search Google when there is an unexpected error', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'ice cream'
    mockProps.isError = true
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    const errMsgContainer = wrapper.find('[data-test-id="search-err-msg"]')
    expect(
      errMsgContainer
        .find(Button)
        .first()
        .render()
        .text()
    ).toEqual('Search Google')
    expect(
      errMsgContainer
        .find(Link)
        .first()
        .prop('to')
    ).toEqual('https://www.google.com/search?q=ice%20cream')
  })

  it('shows a message if there is no search query', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = ''
    mockProps.isEmptyQuery = true
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(
      wrapper
        .find(Typography)
        .filterWhere(
          n =>
            n.render().text() ===
            'Search something to start raising money for charity!'
        )
        .exists()
    ).toBe(true)
  })
})

describe('SearchResultsBing: tests for displaying search results', () => {
  it('renders the expected number of search result items', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.find(SearchResultItem).length).toEqual(2)
  })

  it('passes the expected data to the first search result item', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    const elem = wrapper.find(SearchResultItem).first()
    expect(elem.prop('type')).toEqual(mockProps.data.mainline[0].type)
    expect(elem.prop('itemData')).toEqual(mockProps.data.mainline[0].value)
  })

  it('passes the expected data to the second search result item', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    const elem = wrapper.find(SearchResultItem).at(1)
    expect(elem.prop('type')).toEqual(mockProps.data.mainline[1].type)
    expect(elem.prop('itemData')).toEqual(mockProps.data.mainline[1].value)
  })
})

describe('SearchResultsBing: tests for pagination', () => {
  beforeEach(() => {
    showBingPagination.mockReturnValue(true)
  })

  it('shows the pagination container when it is enabled', () => {
    showBingPagination.mockReturnValue(true)
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'ice cream'
    mockProps.page = 1
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(
      wrapper.find('[data-test-id="pagination-container"]').prop('style')
        .display
    ).toEqual('block')
  })

  it('does not show the pagination container when it is not enabled', () => {
    showBingPagination.mockReturnValue(false)
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'ice cream'
    mockProps.page = 1
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(
      wrapper.find('[data-test-id="pagination-container"]').prop('style')
        .display
    ).toEqual('none')
  })

  it('hides the pagination container when there are no search results', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'ice cream'
    mockProps.isEmptyQuery = false
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()

    // The pagination container should not be hidden.
    expect(
      wrapper.find('[data-test-id="pagination-container"]').prop('style')
    ).toHaveProperty('display', 'block')

    wrapper.setProps({
      query: '',
      isEmptyQuery: true,
    })

    // The pagination container should be hidden now.
    expect(
      wrapper.find('[data-test-id="pagination-container"]').prop('style')
    ).toHaveProperty('display', 'none')
  })

  it('hides the pagination container when there is an error', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'ice cream'
    mockProps.isError = false
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()

    // The pagination container should not be hidden.
    expect(
      wrapper.find('[data-test-id="pagination-container"]').prop('style')
    ).toHaveProperty('display', 'block')

    wrapper.setProps({
      query: '',
      isError: true,
    })

    // The pagination container should be hidden now.
    expect(
      wrapper.find('[data-test-id="pagination-container"]').prop('style')
    ).toHaveProperty('display', 'none')
  })

  it('does not render the "previous page" pagination button when on the first page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.page = 1
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.find('[data-test-id="pagination-previous"]').exists()).toBe(
      false
    )
  })

  it('renders the "previous page" pagination button when on the second page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.page = 2
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.find('[data-test-id="pagination-previous"]').exists()).toBe(
      true
    )
  })

  it('renders the "previous page" pagination button when on the eleventh page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.page = 11
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.find('[data-test-id="pagination-previous"]').exists()).toBe(
      true
    )
  })

  it('does render the 9999th pagination button when on the final page (page 9999)', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.page = 9999
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.find('[data-test-id="pagination-9999"]').exists()).toBe(true)
  })

  it('does not render the "next page" pagination button when on the final page (page 9999)', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.page = 9999
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.find('[data-test-id="pagination-next"]').exists()).toBe(
      false
    )
  })

  it('renders the "next page" pagination button when on the first page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.page = 1
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.find('[data-test-id="pagination-next"]').exists()).toBe(true)
  })

  it('renders the "next page" pagination button when on the second page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.page = 2
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.find('[data-test-id="pagination-next"]').exists()).toBe(true)
  })

  it('renders the "next page" pagination button when on the eleventh page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.page = 11
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.find('[data-test-id="pagination-next"]').exists()).toBe(true)
  })

  it('renders the expected pagination buttons when on the first page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.page = 11
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    const expectedPages = range(7, 15)
    expectedPages.forEach(pageNum => {
      expect(
        wrapper.find(`[data-test-id="pagination-${pageNum}"]`).exists()
      ).toBe(true)
    })

    // Page 6 should not exist.
    expect(wrapper.find(`[data-test-id="pagination-6"]`).exists()).toBe(false)

    // Page 15 should not exist.
    expect(wrapper.find(`[data-test-id="pagination-15"]`).exists()).toBe(false)
  })

  it('renders the expected pagination buttons when on the eleventh page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.page = 11
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    const expectedPages = range(7, 15)
    expectedPages.forEach(pageNum => {
      expect(
        wrapper.find(`[data-test-id="pagination-${pageNum}"]`).exists()
      ).toBe(true)
    })

    // Page 6 should not exist.
    expect(wrapper.find(`[data-test-id="pagination-6"]`).exists()).toBe(false)

    // Page 15 should not exist.
    expect(wrapper.find(`[data-test-id="pagination-15"]`).exists()).toBe(false)
  })

  it('renders the expected pagination buttons when on the 9998th page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.page = 9998
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    const expectedPages = range(9991, 9999)
    expectedPages.forEach(pageNum => {
      expect(
        wrapper.find(`[data-test-id="pagination-${pageNum}"]`).exists()
      ).toBe(true)
    })

    // Page 10000 should not exist.
    expect(wrapper.find(`[data-test-id="pagination-10000"]`).exists()).toBe(
      false
    )
  })

  it('calls the onPageChange prop when clicking to a new results page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'ice cream'
    mockProps.page = 1
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    wrapper.find('[data-test-id="pagination-2"]').simulate('click')
    expect(mockProps.onPageChange).toHaveBeenCalledWith(2)
    wrapper.find('[data-test-id="pagination-7"]').simulate('click')
    expect(mockProps.onPageChange).toHaveBeenCalledWith(7)
  })

  it('calls the onPageChange prop when clicking the "next page" button', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'ice cream'
    mockProps.page = 3
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    wrapper.find('[data-test-id="pagination-next"]').simulate('click')
    expect(mockProps.onPageChange).toHaveBeenCalledWith(4)
  })

  it('calls the onPageChange prop when clicking the "previous page" button', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'ice cream'
    mockProps.page = 7
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    wrapper.find('[data-test-id="pagination-previous"]').simulate('click')
    expect(mockProps.onPageChange).toHaveBeenCalledWith(6)
  })

  it('disables the button of the current results page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'ice cream'
    mockProps.page = 3
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(wrapper.find('[data-test-id="pagination-3"]').prop('disabled')).toBe(
      true
    )
  })

  it('does not disable buttons for other results pages besides the one we are on', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'ice cream'
    mockProps.page = 3
    const wrapper = shallow(<SearchResultsBing {...mockProps} />).dive()
    expect(
      wrapper.find('[data-test-id="pagination-4"]').prop('disabled')
    ).toBeUndefined()
  })

  it('uses our secondary color as the color of the button text of the current results page', () => {
    const SearchResultsBing = require('js/components/Search/SearchResultsBing')
      .default
    const mockProps = getMockProps()
    mockProps.query = 'ice cream'
    mockProps.page = 3
    const ourTheme = createMuiTheme({
      palette: {
        primary: {
          main: '#dedede',
        },
        secondary: {
          main: '#b94f4f',
        },
      },
    })
    const wrapper = mount(
      <MuiThemeProvider theme={ourTheme}>
        <SearchResultsBing {...mockProps} />
      </MuiThemeProvider>
    )
    expect(
      wrapper
        .find('[data-test-id="pagination-3"]')
        .first()
        .prop('style')
    ).toHaveProperty('color', '#b94f4f')
  })
})
