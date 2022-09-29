import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { HeadingXXLarge, LabelLarge } from 'baseui/typography'
import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { updateEtterlevelseToNewBehandling } from '../api/EtterlevelseApi'
import CustomizedInput from '../components/common/CustomizedInput'
import { InputField } from '../components/common/Inputs'
import { borderColor } from '../components/common/Style'
import { Layout2 } from '../components/scaffold/Page'
import { ettlevColors, maxPageWidth } from '../util/theme'

export const EtterlevelseAdminPage = () => {
  const [oldBehandlingsId, setOldBehandlingsId] = useState<string>('')
  const [newBehandlingsId, setNewBehandlingsId] = useState<string>('')


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
          placeholder="Nåværende behandlings id"
          onChange={(e) => {setOldBehandlingsId(e.target.value)}}
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
          placeholder="Ny behandlings id"
          onChange={(e) => {setNewBehandlingsId(e.target.value)}}
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
              updateEtterlevelseToNewBehandling(oldBehandlingsId, newBehandlingsId)
          }}
        >
          Oppdater
        </Button>
      </Block>
    </Layout2>
  )
}
export default EtterlevelseAdminPage