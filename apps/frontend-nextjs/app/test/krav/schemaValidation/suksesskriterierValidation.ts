import * as yup from 'yup'
import { ESuksesskriterieStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { EKravStatus, ESuksesskriteriumFlyt } from '@/constants/krav/kravConstants'

type TTestContext = yup.TestContext & { from?: { value: { status?: EKravStatus } }[] }

const isKravAktiv = (context: yup.TestContext): boolean =>
  (context as TTestContext).from?.at(-1)?.value?.status === EKravStatus.AKTIV

const isFlytValgt = (flyt?: ESuksesskriteriumFlyt): boolean =>
  !!flyt && flyt !== ESuksesskriteriumFlyt.UNDEFINED

const flytCheck = (name: string, message: string) =>
  yup.string().test({
    name,
    message,
    test: function (flyt) {
      return !isKravAktiv(this) || isFlytValgt(flyt as ESuksesskriteriumFlyt)
    },
  })

const suksesskriteriumCheck = yup.object({
  navn: yup.string().test({
    name: 'suksesskriteriumNavnCheck',
    message: 'Suksesskriteriet må ha en tittel',
    test: function (navn) {
      return !isKravAktiv(this) || !!navn
    },
  }),
  oppfyltStatusFlyt: flytCheck(
    'oppfyltStatusFlytCheck',
    'Du må velge konsekvens for flyt når suksesskriterium settes til Oppfylt'
  ),
  ikkeOppfyltStatusFlyt: flytCheck(
    'ikkeOppfyltStatusFlytCheck',
    'Du må velge konsekvens for flyt når suksesskriterium settes til Ikke oppfylt'
  ),
  ikkeRelevantStatusFlyt: yup.string().test({
    name: 'ikkeRelevantStatusFlytCheck',
    message: 'Du må velge konsekvens for flyt når suksesskriterium settes til Ikke relevant',
    test: function (flyt) {
      const deaktiverteStatuser: ESuksesskriterieStatus[] =
        this.parent.deaktiverteSuksesskriterieStatus || []
      return (
        !isKravAktiv(this) ||
        deaktiverteStatuser.includes(ESuksesskriterieStatus.IKKE_RELEVANT) ||
        isFlytValgt(flyt as ESuksesskriteriumFlyt)
      )
    },
  }),
})

export const suksesskriterierCheck = yup
  .array()
  .of(suksesskriteriumCheck)
  .test({
    name: 'suksesskriterierCheck',
    message: 'Kravet må ha minst ett suksesskriterium',
    test: function (suksesskriterier) {
      return this.parent.status !== EKravStatus.AKTIV || (suksesskriterier || []).length > 0
    },
  })
