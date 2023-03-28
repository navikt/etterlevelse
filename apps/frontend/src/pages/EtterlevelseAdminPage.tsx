import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { HeadingXXLarge, LabelLarge } from 'baseui/typography'
import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { deleteEtterlevelse, updateEtterlevelseToNewBehandling } from '../api/EtterlevelseApi'
import CustomizedInput from '../components/common/CustomizedInput'
import { borderColor, paddingZero } from '../components/common/Style'
import { Layout2 } from '../components/scaffold/Page'
import { ettlevColors, maxPageWidth } from '../util/theme'
import { KIND as NKIND, Notification } from 'baseui/notification'

export const EtterlevelseAdminPage = () => {
  const [oldBehandlingsId, setOldBehandlingsId] = useState<string>('')
  const [newBehandlingsId, setNewBehandlingsId] = useState<string>('')
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
      <LabelLarge>Oppdatere behandlings id til etterlevelses dokumentasjoner</LabelLarge>
      <Block display="flex">
        <CustomizedInput
          value={oldBehandlingsId}
          placeholder="Nåværende behandlings UID"
          onChange={(e) => {
            setOldBehandlingsId(e.target.value)
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

        <CustomizedInput
          value={newBehandlingsId}
          placeholder="Ny behandlings UID"
          onChange={(e) => {
            setNewBehandlingsId(e.target.value)
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
          disabled={!oldBehandlingsId || !newBehandlingsId}
          onClick={() => {
            setUpdateMessage('')
            updateEtterlevelseToNewBehandling(oldBehandlingsId, newBehandlingsId)
              .then(() => {
                setUpdateMessage('Oppdatering er vellykket, byttet etterlevelses dokumentasjon med ny behandlings uid: ' + newBehandlingsId)
                setNewBehandlingsId('')
                setOldBehandlingsId('')
              })
              .catch((e) => {
                setUpdateMessage('Oppdatering mislykket, error: ' + e)
              })
          }}
        >
          Oppdater
        </Button>
      </Block>
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
      {updateMessage ? (
        <Block>
          {updateMessage.match('error') ? (
            <Notification
              overrides={{ Body: { style: { width: 'auto', ...paddingZero, marginTop: 0, backgroundColor: 'transparent', color: ettlevColors.red600 } } }}
              kind={NKIND.negative}
            >
              {updateMessage}
            </Notification>
          ) : (
            <Notification overrides={{ Body: { style: { width: 'auto', ...paddingZero, marginTop: 0, backgroundColor: 'transparent' } } }} kind={NKIND.positive}>
              {updateMessage}
            </Notification>
          )}
        </Block>
      ) : (
        <Block />
      )}
    </Layout2>
  )
}
export default EtterlevelseAdminPage
