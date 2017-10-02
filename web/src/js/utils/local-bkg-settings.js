
import {
  STORAGE_BACKGROUND_OPTION,
  STORAGE_BACKGROUND_CUSTOM_IMAGE,
  STORAGE_BACKGROUND_COLOR,
  STORAGE_BACKGROUND_IMAGE_URL
} from '../constants'
import localStorageMgr from './localstorage-mgr'

export const setBackgroundSettings = function (backgroundOption,
    customImage, backgroundColor, imageURL) {
  localStorageMgr.setItem(STORAGE_BACKGROUND_OPTION, backgroundOption)
  localStorageMgr.setItem(STORAGE_BACKGROUND_CUSTOM_IMAGE, customImage)
  localStorageMgr.setItem(STORAGE_BACKGROUND_COLOR, backgroundColor)
  localStorageMgr.setItem(STORAGE_BACKGROUND_IMAGE_URL, imageURL)

  // TODO: call to parent frame to update its localStorage.
}

export const getUserBackgroundOption = function () {
  return localStorageMgr.getItem(STORAGE_BACKGROUND_OPTION)
}

export const getUserBackgroundCustomImage = function () {
  return localStorageMgr.getItem(STORAGE_BACKGROUND_CUSTOM_IMAGE)
}

export const getUserBackgroundColor = function () {
  return localStorageMgr.getItem(STORAGE_BACKGROUND_COLOR)
}

export const getUserBackgroundImageURL = function () {
  return localStorageMgr.getItem(STORAGE_BACKGROUND_IMAGE_URL)
}
