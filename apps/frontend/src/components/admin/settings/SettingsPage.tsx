import { Label } from '@navikt/ds-react'
import { Block } from 'baseui/block'
import { Spinner } from 'baseui/spinner'
import { HeadingMedium } from 'baseui/typography'
import { FormEvent, useState } from 'react'
import { Helmet } from 'react-helmet'
import { theme } from '../../../util'
import { intl } from '../../../util/intl/intl'
import { ettlevColors, responsivePaddingSmall, responsiveWidthSmall } from '../../../util/theme'
import Button from '../../common/Button'
import { CustomizedStatefulTextarea } from '../../common/CustomizedTextarea'
import { Markdown } from '../../common/Markdown'
import { ISettings, getSettings, writeSettings } from './SettingsApi'

export const SettingsPage = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState()
  const [settings, setSettings] = useState<ISettings>()

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

  return (
    <Block
      width={responsiveWidthSmall}
      paddingLeft={responsivePaddingSmall}
      paddingRight={responsivePaddingSmall}
    >
      {/* TODO USIKKER */}
      <Helmet>
        <meta charSet="utf-8" />
        <title>Innstillinger</title>
      </Helmet>
      {/* TODO USIKKER */}
      <HeadingMedium>{intl.settings}</HeadingMedium>
      {loading && <Spinner $color={ettlevColors.green400} $size={40} />}
      {(error || !settings) && error}
      {!loading && !(error || !settings) && (
        <div>
          <FrontpageMessage
            message={settings?.frontpageMessage}
            setMessage={(frontpageMessage) => setSettings({ ...settings, frontpageMessage })}
          />

          <Block className="flex justify-end" marginTop={theme.sizing.scale800}>
            <Button type="button" kind="secondary" marginRight onClick={load}>
              {intl.abort}
            </Button>
            <Button type="button" onClick={save}>
              {intl.save}
            </Button>
          </Block>
        </div>
      )}
    </Block>
  )
}

interface IPropsFrontpageMessage {
  message?: string
  setMessage: (message: string) => void
}

const FrontpageMessage = ({ message, setMessage }: IPropsFrontpageMessage) => (
  <div className="w-full">
    <div className="items-center mt-4">
      <Label className="mr-4">Forsidemelding</Label>
      <div className="flex w-full">
        <div className="w-2/4 mr-4">
          <CustomizedStatefulTextarea
            initialState={{ value: message }}
            rows={20}
            onChange={(event: any) =>
              setMessage((event as FormEvent<HTMLInputElement>).currentTarget.value)
            }
          />
        </div>
        <div className="w-2/4">
          <Markdown source={message || ''} escapeHtml={false} />
        </div>
      </div>
    </div>
  </div>
)
