import React from 'react'
import PropTypes from 'prop-types'
import { range } from 'lodash/util'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Link from 'js/components/General/Link'
import SearchResultItem from 'js/components/Search/SearchResultItem'
import { showBingPagination } from 'js/utils/search-utils'

const styles = theme => ({
  searchResultsParentContainer: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  searchResultsContainer: {
    marginTop: 6,
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 520,
    margin: 'auto auto 20px auto',
  },
  paginationButton: {
    minWidth: 40,
  },
})

const SearchResultsBing = props => {
  const {
    classes,
    data,
    isEmptyQuery,
    isError,
    isQueryInProgress,
    noSearchResults,
    onPageChange,
    page,
    query,
    style,
    theme,
  } = props

  // Hiding until we make it functional.
  const SHOW_PAGINATION = showBingPagination()

  // Include 8 pages total, 4 lower and 4 higher when possible.
  // Page 9999 is the maximum, so stop there.
  const MIN_PAGE = 1
  const MAX_PAGE = 9999
  const paginationIndices = range(
    Math.max(MIN_PAGE, Math.min(page - 4, MAX_PAGE - 8)),
    Math.min(MAX_PAGE + 1, Math.max(page + 4, MIN_PAGE + 8))
  )

  const noResultsToDisplay = isEmptyQuery || noSearchResults || isError
  const searchComplete = !isQueryInProgress && !isEmptyQuery
  return (
    <div
      className={classes.searchResultsParentContainer}
      style={Object.assign(
        {},
        {
          // Min height prevents visibly shifting content below,
          // like the footer.
          minHeight: noResultsToDisplay || searchComplete ? 0 : 1000,
        },
        style
      )}
    >
      {noSearchResults ? (
        <Typography variant={'body1'} gutterBottom>
          No results found for{' '}
          <span style={{ fontWeight: 'bold' }}>{query}</span>
        </Typography>
      ) : null}
      {isError ? (
        <div data-test-id={'search-err-msg'}>
          <Typography variant={'body1'} gutterBottom>
            Unable to search at this time.
          </Typography>
          <Link
            to={`https://www.google.com/search?q=${encodeURI(query)}`}
            target="_top"
          >
            <Button color={'primary'} variant={'contained'} size={'small'}>
              Search Google
            </Button>
          </Link>
        </div>
      ) : isEmptyQuery ? (
        <Typography variant={'body1'} gutterBottom>
          Search something to start raising money for charity!
        </Typography>
      ) : null}
      {isQueryInProgress ? null : (
        <div
          data-test-id={'search-results'}
          className={classes.searchResultsContainer}
        >
          {data.mainline.map(searchResultItemData => {
            return (
              <SearchResultItem
                key={searchResultItemData.key}
                type={searchResultItemData.type}
                itemData={searchResultItemData.value}
              />
            )
          })}
        </div>
      )}
      <div
        data-test-id={'pagination-container'}
        className={classes.paginationContainer}
        style={{
          display: !SHOW_PAGINATION || noResultsToDisplay ? 'none' : 'block',
        }}
      >
        {page > MIN_PAGE ? (
          <Button
            data-test-id={'pagination-previous'}
            className={classes.paginationButton}
            onClick={() => {
              onPageChange(page - 1)
            }}
          >
            PREVIOUS
          </Button>
        ) : null}
        {paginationIndices.map(pageNum => (
          <Button
            key={`page-${pageNum}`}
            className={classes.paginationButton}
            data-test-id={`pagination-${pageNum}`}
            {...pageNum === page && {
              color: 'secondary',
              disabled: true,
            }}
            style={{
              ...(pageNum === page && {
                color: theme.palette.secondary.main,
              }),
            }}
            onClick={() => {
              onPageChange(pageNum)
            }}
          >
            {pageNum}
          </Button>
        ))}
        {page < MAX_PAGE ? (
          <Button
            data-test-id={'pagination-next'}
            className={classes.paginationButton}
            onClick={() => {
              onPageChange(page + 1)
            }}
          >
            NEXT
          </Button>
        ) : null}
      </div>
    </div>
  )
}

SearchResultsBing.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.shape({
    pole: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
          .isRequired,
      })
    ).isRequired,
    mainline: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
          .isRequired,
      })
    ).isRequired,
    sidebar: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
          .isRequired,
      })
    ).isRequired,
  }).isRequired,
  isEmptyQuery: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  isQueryInProgress: PropTypes.bool.isRequired,
  noSearchResults: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  query: PropTypes.string.isRequired,
  style: PropTypes.object,
  theme: PropTypes.object.isRequired,
}

SearchResultsBing.defaultProps = {}

export default withStyles(styles, { withTheme: true })(SearchResultsBing)
