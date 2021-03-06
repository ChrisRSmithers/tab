import React from 'react'
import PropTypes from 'prop-types'
import { get } from 'lodash/object'
import { withStyles } from '@material-ui/core/styles'
import ButtonBase from '@material-ui/core/ButtonBase'
import HeartBorderIcon from '@material-ui/icons/FavoriteBorder'
import CheckmarkIcon from '@material-ui/icons/Done'
import Typography from '@material-ui/core/Typography'
import { commaFormatted } from 'js/utils/utils'
import {
  MAX_DAILY_HEARTS_FROM_SEARCHES,
  MAX_DAILY_HEARTS_FROM_TABS,
} from 'js/constants'
import HeartsDropdown from 'js/components/Dashboard/HeartsDropdownContainer'
import MaxHeartsDropdownMessageComponent from 'js/components/Dashboard/MaxHeartsDropdownMessageComponent'

const styles = {
  buttonBase: {
    borderRadius: 2,
  },
  heartCount: {
    transition: 'color 300ms ease-in',
    fontWeight: 'normal',
    userSelect: 'none',
    cursor: 'pointer',
  },
  heartIcon: {
    transition: 'color 300ms ease-in',
    cursor: 'pointer',
    marginLeft: 2,
    paddingBottom: 0,
  },
  checkmarkIcon: {
    transition: 'color 300ms ease-in',
    cursor: 'pointer',
    height: 16,
    width: 16,
    position: 'absolute',
    paddingLeft: 4,
    paddingBottom: 2,
  },
}

class HeartsComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isHovering: false,
      isPopoverOpen: false,
    }
    this.anchorElement = null
  }

  render() {
    const {
      app,
      classes,
      showMaxHeartsFromSearchesMessage,
      showMaxHeartsFromTabsMessage,
      theme,
      user,
    } = this.props
    const { isHovering, isPopoverOpen } = this.state
    const anchorElement = this.anchorElement

    // Let the user know they aren't earning any more Hearts from
    // tabs or searches today.
    const reachedMaxDailyHeartsFromTabs =
      user.tabsToday >= MAX_DAILY_HEARTS_FROM_TABS
    const reachedMaxDailyHeartsFromSearches =
      user.searchesToday >= MAX_DAILY_HEARTS_FROM_SEARCHES
    return (
      <div>
        <ButtonBase className={classes.buttonBase}>
          <div
            data-tour-id={'hearts'}
            ref={anchorElement => (this.anchorElement = anchorElement)}
            onMouseEnter={event => {
              this.setState({
                isHovering: true,
              })
            }}
            onMouseLeave={event => {
              this.setState({
                isHovering: false,
              })
            }}
            onClick={event => {
              this.setState({
                isPopoverOpen: true,
              })
            }}
            style={{ marginRight: 0, display: 'flex', alignItems: 'center' }}
          >
            <Typography
              variant={'h2'}
              style={{
                ...((isHovering || isPopoverOpen) && {
                  color: get(
                    theme,
                    'overrides.MuiTypography.h2.&:hover.color',
                    'inherit'
                  ),
                }),
              }}
              className={classes.heartCount}
            >
              {commaFormatted(user.vcCurrent)}
            </Typography>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <HeartBorderIcon
                style={{
                  color:
                    isHovering || isPopoverOpen
                      ? get(
                          theme,
                          'overrides.MuiTypography.h2.&:hover.color',
                          'inherit'
                        )
                      : get(theme, 'typography.h2.color', 'inherit'),
                }}
                className={classes.heartIcon}
              />
              {(showMaxHeartsFromTabsMessage &&
                reachedMaxDailyHeartsFromTabs) ||
              (showMaxHeartsFromSearchesMessage &&
                reachedMaxDailyHeartsFromSearches) ? (
                <CheckmarkIcon
                  style={{
                    color:
                      isHovering || isPopoverOpen
                        ? get(
                            theme,
                            'overrides.MuiTypography.h2.&:hover.color',
                            'inherit'
                          )
                        : get(theme, 'typography.h2.color', 'inherit'),
                  }}
                  className={classes.checkmarkIcon}
                />
              ) : null}
            </div>
          </div>
        </ButtonBase>
        <HeartsDropdown
          app={app}
          user={user}
          open={isPopoverOpen}
          onClose={() => {
            this.setState({
              isPopoverOpen: false,
            })
          }}
          anchorElement={anchorElement}
          style={{
            marginTop: 6,
          }}
        />
        <MaxHeartsDropdownMessageComponent
          open={
            ((showMaxHeartsFromTabsMessage && reachedMaxDailyHeartsFromTabs) ||
              (showMaxHeartsFromSearchesMessage &&
                reachedMaxDailyHeartsFromSearches)) &&
            isHovering &&
            !isPopoverOpen
          }
          anchorElement={anchorElement}
          message={
            reachedMaxDailyHeartsFromTabs && reachedMaxDailyHeartsFromSearches
              ? `You've earned the maximum Hearts for now. You'll be able to earn more Hearts in a while.`
              : reachedMaxDailyHeartsFromTabs
              ? `You've earned the maximum Hearts from opening tabs today! You'll be able to earn more Hearts in a while.`
              : reachedMaxDailyHeartsFromSearches
              ? `You've earned the maximum Hearts from searching today! You'll be able to earn more Hearts in a while.`
              : `You've earned the maximum Hearts for now.`
          }
        />
      </div>
    )
  }
}

HeartsComponent.displayName = 'HeartsComponent'

HeartsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.shape({
    searchesToday: PropTypes.number.isRequired,
    tabsToday: PropTypes.number.isRequired,
    vcCurrent: PropTypes.number.isRequired,
  }),
  showMaxHeartsFromSearchesMessage: PropTypes.bool,
  showMaxHeartsFromTabsMessage: PropTypes.bool,
  theme: PropTypes.object.isRequired,
}

HeartsComponent.defaultProps = {
  classes: {},
  showMaxHeartsFromSearchesMessage: false,
  showMaxHeartsFromTabsMessage: false,
}

export default withStyles(styles, { withTheme: true })(HeartsComponent)
