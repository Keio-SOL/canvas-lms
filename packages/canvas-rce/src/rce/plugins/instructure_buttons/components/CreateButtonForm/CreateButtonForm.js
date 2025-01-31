/*
 * Copyright (C) 2021 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useState, useEffect} from 'react'

import {View} from '@instructure/ui-view'

import {useStoreProps} from '../../../shared/StoreContext'

import {useSvgSettings, statuses} from '../../svg/settings'
import {BTN_AND_ICON_ATTRIBUTE, BTN_AND_ICON_DOWNLOAD_URL_ATTR} from '../../registerEditToolbar'
import {buildSvg, buildStylesheet} from '../../svg'
import formatMessage from '../../../../../format-message'

import {Header} from './Header'
import {ShapeSection} from './ShapeSection'
import {ColorSection} from './ColorSection'
import {TextSection} from './TextSection'
import {ImageSection} from './ImageSection'
import {Footer} from './Footer'

export const CreateButtonForm = ({editor, onClose, editing}) => {
  const [settings, settingsStatus, dispatch] = useSvgSettings(editor, editing)
  const [status, setStatus] = useState(statuses.IDLE)
  const storeProps = useStoreProps()

  const handleSubmit = ({replaceFile = false}) => {
    setStatus(statuses.LOADING)

    const svg = buildSvg(settings, {isPreview: false})
    buildStylesheet()
      .then(stylesheet => {
        svg.appendChild(stylesheet)
        return storeProps.startButtonsAndIconsUpload(
          {
            name: `${settings.name || formatMessage('untitled')}.svg`,
            domElement: svg
          },
          {
            onDuplicate: replaceFile && 'overwrite'
          }
        )
      })
      .then(writeButtonToRCE)
      .then(onClose)
      .catch(() => setStatus(statuses.ERROR))
  }

  const writeButtonToRCE = ({url}) => {
    const img = editor.dom.create('img')

    img.setAttribute('src', url)
    img.setAttribute('alt', settings.alt)

    // Mark the image as a button and icon.
    img.setAttribute(BTN_AND_ICON_ATTRIBUTE, true)

    // URL to fetch the SVG from when loading the Edit tray.
    // We can't use the 'src' because Canvas will re-write the
    // source attribute to a URL that is not cross-origin friendly.
    img.setAttribute(BTN_AND_ICON_DOWNLOAD_URL_ATTR, url)

    editor.insertContent(img.outerHTML)
  }

  useEffect(() => {
    setStatus(settingsStatus)
  }, [settingsStatus])

  return (
    <View as="div">
      <Header settings={settings} onChange={dispatch} />
      <ShapeSection settings={settings} onChange={dispatch} />
      <ColorSection settings={settings} onChange={dispatch} />
      <TextSection settings={settings} onChange={dispatch} />
      <ImageSection editor={editor} settings={settings} onChange={dispatch} editing={editing} />
      <Footer
        disabled={status === statuses.LOADING}
        onCancel={onClose}
        onSubmit={handleSubmit}
        onReplace={() => handleSubmit({replaceFile: true})}
        editing={editing}
      />
    </View>
  )
}
