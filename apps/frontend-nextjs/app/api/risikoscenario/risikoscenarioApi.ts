import { IPageResponse } from '@/constants/commonConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getRisikoscenarioByPvkDokumentId = async (
  pvkDokumentId: string,
  scenarioType: ERisikoscenarioType
): Promise<IPageResponse<IRisikoscenario>> =>
  (
    await axios.get<IPageResponse<IRisikoscenario>>(
      `${env.backendBaseUrl}/risikoscenario/pvkdokument/${pvkDokumentId}/${scenarioType}`
    )
  ).data
