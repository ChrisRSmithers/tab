
import { find, sortBy } from 'lodash/collection'
import BaseWidgetModel from './baseWidget/BaseWidgetModel'
import UserWidgetModel from './userWidget/UserWidgetModel'
import buildFullWidget from './buildFullWidget'
import getUserWidgetsByEnabledState from './userWidget/getUserWidgetsByEnabledState'

/**
 * Fetch the widgets for a user. The result includes the widget data
 * as well as the user-widget related data.
 * The user-widget data field gets serialized into a string.
 * @param {object} userContext - The user authorizer object.
 * @param {string} userId - The user id.
 * @return {Promise<Widget[]>}  Returns a list of object that with the widget and
 * the user data on the widget information.
 */
const getWidgets = async (userContext, userId, enabled = false) => {
  // Get user widgets.
  var userWidgets
  if (enabled) {
    userWidgets = await getUserWidgetsByEnabledState(userContext, userId, true)
  } else {
    userWidgets = await UserWidgetModel
      .query(userContext, userId)
      .execute()
  }

  // Get base widgets.
  const keys = []
  userWidgets.forEach((userWidget) => {
    keys.push({
      id: userWidget.widgetId
    })
  })
  if (!keys || keys.length === 0) {
    return []
  }
  const baseWidgets = await BaseWidgetModel.getBatch(userContext, keys)

  // Merge user widgets with base widgets.
  const mergedWidgets = []
  userWidgets.forEach((userWidget) => {
    const baseWidget = find(baseWidgets, (baseWidget) => {
      return baseWidget.id === userWidget.widgetId
    })
    mergedWidgets.push(buildFullWidget(userWidget, baseWidget))
  })

  // Sort widgets.
  const sortedWidgets = sortBy(mergedWidgets, (obj) => obj.position)
  return sortedWidgets
}

export default getWidgets
