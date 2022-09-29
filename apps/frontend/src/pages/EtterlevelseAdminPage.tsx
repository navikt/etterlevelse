import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { HeadingXXLarge, LabelLarge } from 'baseui/typography'
import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { updateEtterlevelseToNewBehandling } from '../api/EtterlevelseApi'
import CustomizedInput from '../components/common/CustomizedInput'
import { borderColor, paddingZero } from '../components/common/Style'
import { Layout2 } from '../components/scaffold/Page'
import { ettlevColors, maxPageWidth } from '../util/theme'
import { KIND as NKIND, Notification } from 'baseui/notification'

export const EtterlevelseAdminPage = () => {
  const [oldBehandlingsId, setOldBehandlingsId] = useState<string>('')
  const [newBehandlingsId, setNewBehandlingsId] = useState<string>('')
  const [updateMessage, setUpdateMessage] = useState<string>('')


  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey25}
      childrenBackgroundColor={ettlevColors.grey25}
      currentPage="Administere Etterlevelse"
      mainHeader={
        <Block maxWidth={maxPageWidth} width="100%" display={'flex'} justifyContent="flex-start">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Administere Etterlevelse</title>
          </Helmet>
          <HeadingXXLarge marginTop="0">Administere Etterlevelse</HeadingXXLarge>
        </Block>
      }
    >
      <LabelLarge>Oppdatere behandlings id til etterlevelses dokumentasjoner</LabelLarge>
      <Block display="flex">
        <CustomizedInput
          value={oldBehandlingsId}
          placeholder="Nåværende behandlings UID"
          onChange={(e) => { setOldBehandlingsId(e.target.value) }}
          overrides={{
            Root: {
              style: {
                ...borderColor(ettlevColors.grey200),
              },
            },
          }}
        />

        <CustomizedInput
          value={newBehandlingsId}
          placeholder="Ny behandlings UID"
          onChange={(e) => { setNewBehandlingsId(e.target.value) }}
          overrides={{
            Root: {
              style: {
                ...borderColor(ettlevColors.grey200),
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
      {updateMessage ?
        <Block>
          {updateMessage.match('error') ?
            <Notification
              overrides={{ Body: { style: { width: 'auto', ...paddingZero, marginTop: 0, backgroundColor: 'transparent', color: ettlevColors.red600 } } }}
              kind={NKIND.negative}
            >
              {updateMessage}
            </Notification>

            :

            <Notification
              overrides={{ Body: { style: { width: 'auto', ...paddingZero, marginTop: 0, backgroundColor: 'transparent' } } }}
              kind={NKIND.positive}
            >
              {updateMessage}
            </Notification>
          }
        </Block>
        : <Block />}
    </Layout2>
  )
}
export default EtterlevelseAdminPage