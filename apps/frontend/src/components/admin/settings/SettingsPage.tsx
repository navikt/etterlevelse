import React, { FormEvent, useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { Spinner } from 'baseui/spinner'
import { HeadingMedium, LabelMedium } from 'baseui/typography'
import { getSettings, Settings, writeSettings } from './SettingsApi'
import { intl } from '../../../util/intl/intl'
import { theme } from '../../../util'
import Button from '../../common/Button'
import { Markdown } from '../../common/Markdown'
import { CustomizedStatefulTextarea } from '../../common/CustomizedTextarea'
import { ettlevColors, responsivePaddingSmall, responsiveWidthSmall } from '../../../util/theme'
import { Helmet } from 'react-helmet'
import { user } from '../../../services/User'
import { loginUrl } from '../../Header'
import { useLocation } from 'react-router-dom'

export const SettingsPage = () => {
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = useState()
  const [settings, setSettings] = useState<Settings>()
  const location = useLocation()

  const load = async () => {
    setLoading(true)
    setSettings(await getSettings())
    setLoading(false)
  }

  const save = async () => {
    if (settings) {
      setLoading(true)
      try {
        setSettings(await writeSettings(settings))
      } catch (e: any) {
        setError(e)
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // if (!user.isLoggedIn()) {
    //   window.location.href = loginUrl(location, location.pathname)
    // } 
    if (!user.isAdmin()) {
      window.location.href = '/forbidden'
    }
  }, [])

  return (
    <Block width={responsiveWidthSmall} paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Innstillinger</title>
      </Helmet>
      <HeadingMedium>{intl.settings}</HeadingMedium>
      {loading && <Spinner $color={ettlevColors.green400} $size={40} />}
      {(error || !settings) && error}
      {!loading && !(error || !settings) && (
        <Block>
          <FrontpageMessage message={settings?.frontpageMessage} setMessage={(frontpageMessage) => setSettings({ ...settings, frontpageMessage })} />

          <Block display="flex" justifyContent="flex-end" marginTop={theme.sizing.scale800}>
            <Button type="button" kind="secondary" marginRight onClick={load}>
              {intl.abort}
            </Button>
            <Button type="button" onClick={save}>
              {intl.save}
            </Button>
          </Block>
        </Block>
      )}
    </Block>
  )
}

const FrontpageMessage = (props: { message?: string; setMessage: (message: string) => void }) => {
  return (
    <Block width="100%">
      <Block alignItems="center" marginTop="1rem">
        <LabelMedium marginRight="1rem">Forsidemelding</LabelMedium>
        <Block width="100%" display="flex">
          <Block width="50%" marginRight="1rem">
            <CustomizedStatefulTextarea
              initialState={{ value: props.message }}
              rows={20}
              onChange={(event: any) => props.setMessage((event as FormEvent<HTMLInputElement>).currentTarget.value)}
            />
          </Block>
          <Block width="50%">
            <Markdown source={props.message || ''} escapeHtml={false} />
          </Block>
        </Block>
      </Block>
    </Block>
  )
}
