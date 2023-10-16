import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { HeadingXXLarge, LabelLarge } from 'baseui/typography'
import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { deleteEtterlevelse } from '../api/EtterlevelseApi'
import CustomizedInput from '../components/common/CustomizedInput'
import { borderColor, paddingZero } from '../components/common/Style'
import { Layout2 } from '../components/scaffold/Page'
import { ettlevColors, maxPageWidth } from '../util/theme'
import { KIND as NKIND, Notification } from 'baseui/notification'

export const EtterlevelseAdminPage = () => {
  const [updateMessage, setUpdateMessage] = useState<string>('')
  const [etterlevelseId, setEtterlevelseId] = useState<string>('')

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey25}
      childrenBackgroundColor={ettlevColors.grey25}
      currentPage="Administrere Etterlevelse"
      mainHeader={
        <Block maxWidth={maxPageWidth} width="100%" display={'flex'} justifyContent="flex-start">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Administrere Etterlevelse</title>
          </Helmet>
          <HeadingXXLarge marginTop="0">Administrere Etterlevelse</HeadingXXLarge>
        </Block>
      }
    >
      <Block marginTop="20px">
        <LabelLarge>Slette etterlevelses dokumentasjon ved uid</LabelLarge>
        <Block display="flex">
          <CustomizedInput
            value={etterlevelseId}
            placeholder="Etterlevelse UID"
            onChange={(e) => {
              setEtterlevelseId(e.target.value)
            }}
            overrides={{
              Root: {
                style: {
                  ...borderColor(ettlevColors.grey200),
                  marginRight: '5px',
                },
              },
            }}
          />
          <Button
            disabled={!etterlevelseId}
            onClick={() => {
              setUpdateMessage('')
              deleteEtterlevelse(etterlevelseId)
                .then(() => {
                  setUpdateMessage('Sletting vellykket for etterlevelses med uid: ' + etterlevelseId)
                  setEtterlevelseId('')
                })
                .catch((e) => {
                  setUpdateMessage('Oppdatering mislykket, error: ' + e)
                })
            }}
          >
            Slett
          </Button>
        </Block>
      </Block>
      <UpdateMessage message={updateMessage} />
    </Layout2>
  )
}

export const UpdateMessage = ({ message }: { message?: string }) => {
  return (
    <Block>
      {message ? (
        <Block>
          {message.match('error') ? (
            <Notification
              overrides={{ Body: { style: { width: 'auto', ...paddingZero, marginTop: 0, backgroundColor: 'transparent', color: ettlevColors.red600 } } }}
              kind={NKIND.negative}
            >
              {message}
            </Notification>
          ) : (
            <Notification overrides={{ Body: { style: { width: 'auto', ...paddingZero, marginTop: 0, backgroundColor: 'transparent' } } }} kind={NKIND.positive}>
              {message}
            </Notification>
          )}
        </Block>
      ) : (
        <Block />
      )}
    </Block>
  )
}
export default EtterlevelseAdminPage
