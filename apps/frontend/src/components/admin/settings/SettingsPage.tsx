import React, {FormEvent, useEffect, useState} from "react"
import {Block} from "baseui/block"
import {StyledSpinnerNext} from "baseui/spinner"
import {H4, Label2} from "baseui/typography"
import {StatefulTextarea} from "baseui/textarea"
import ReactMarkdown from "react-markdown/with-html"
import {getSettings, Settings, writeSettings} from './SettingsApi'
import {intl} from '../../../util/intl/intl'
import {theme} from '../../../util'
import Button from '../../common/Button'

export const SettingsPage = () => {
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = useState()
  const [settings, setSettings] = useState<Settings>()


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
      } catch (e) {
        setError(e)
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <Block>
      <H4>{intl.settings}</H4>
      {loading ? <StyledSpinnerNext size={40}/> :
        error || !settings ? {error} :
          <Block>
            <FrontpageMessage message={settings?.frontpageMessage} setMessage={frontpageMessage => setSettings({...settings, frontpageMessage})}/>

            <Block display="flex" justifyContent="flex-end" marginTop={theme.sizing.scale800}>
              <Button type="button" kind="secondary" marginRight onClick={load}>{intl.abort}</Button>
              <Button type="button" onClick={save}>{intl.save}</Button>
            </Block>
          </Block>}
    </Block>
  )
}

const FrontpageMessage = (props: {message?: string, setMessage: (message: string) => void}) => {
  return (
    <>
      <Block alignItems="center" marginTop="1rem">
        <Label2 marginRight="1rem">Forsidemelding</Label2>
        <Block width="100%" display="flex">
          <Block width="50%" marginRight="1rem">
            <StatefulTextarea initialState={{value: props.message}} rows={20}
                              onChange={(event: any) => props.setMessage((event as FormEvent<HTMLInputElement>).currentTarget.value)}
            />
          </Block>
          <Block width="50%">
            <ReactMarkdown source={props.message || ''} escapeHtml={false}/>
          </Block>
        </Block>
      </Block>
    </>
  )
}
