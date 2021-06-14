import { Block } from 'baseui/block'
import { H1, HeadingLarge, HeadingXLarge, HeadingXXLarge, Label3, Paragraph2 } from 'baseui/typography'
import * as React from 'react'
import { ExternalLink } from '../components/common/RouteLink'
import { Page } from '../components/scaffold/Page'
import { ettlevColors, maxPageWidth, theme } from '../util/theme'



export const EtterlevelseDokPage = () => {

    return (
        <Page
            backUrl={'/'}
            headerBackgroundColor={ettlevColors.grey75}
            backgroundColor={ettlevColors.grey75}
            wideMain
        >
            <Block display="flex" justifyContent="space-between">
                <Block>
                    <Label3 color={ettlevColors.green600}>
                        DOKUMENTERE ETTERLEVELSE
                    </Label3>
                    <H1 marginTop='0'>Ajourholde behandlingsoversikt</H1>
                    <Paragraph2>
                        Ukjent overordnet behandlingsaktivitet
                    </Paragraph2>
                    <Block>
                        
                    </Block>
                
                </Block>

                <Block
                    width="400px"
                    height='260px'
                    backgroundColor={ettlevColors.white}
                >
                    <Block padding="5px">
                        <HeadingLarge>Hva er egenskapene til behandlingen?</HeadingLarge>
                        <Block $style={{fontWeight: 400, fontSize: '18px', fontFamily: 'Source Sans Pro'}}>
                            Hvis du tilpasser egenskapene skjuler vi kravene som ikke er relevante for din løsning.
                        </Block>                                                              
                    </Block>
                </Block>
            </Block>
        </Page>
    )
}