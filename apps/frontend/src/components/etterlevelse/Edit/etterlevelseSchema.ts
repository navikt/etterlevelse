import * as yup from 'yup'
import { EEtterlevelseStatus, ESuksesskriterieStatus } from '../../../constants'

export const etterlevelseSchema = () => {
  return yup.object({
    suksesskriterieBegrunnelser: yup.array().of(
      yup.object({
        suksesskriterieStatus: yup
          .string()
          .test({
            name: 'suksesskriterieStatus',
            message: 'Du kan ikke dokumentere ferdig hvis et suksesskriterium er under arbeid.',
            test: function (suksesskriterieStatus) {
              const { options } = this
              if (
                (options.context?.status === EEtterlevelseStatus.FERDIG ||
                  options.context?.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT) &&
                suksesskriterieStatus === ESuksesskriterieStatus.UNDER_ARBEID
              ) {
                return false
              }
              return true
            },
          })
          .required('Du må velge et status'),
        behovForBegrunnelse: yup.boolean(),
        begrunnelse: yup.string().test({
          name: 'begrunnelseText',
          message: 'Du må fylle ut beskrivelsen.',
          test: function (begrunnelse) {
            const { parent, options } = this
            if (
              (options.context?.status === EEtterlevelseStatus.FERDIG ||
                options.context?.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT) &&
              (begrunnelse === '' || begrunnelse === undefined) &&
              parent.behovForBegrunnelse
            ) {
              return false
            } else {
              return true
            }
          },
        }),
        suksesskriterieId: yup
          .number()
          .required('Begrunnelse må være knyttet til et suksesskriterie.'),
      })
    ),
    statusBegrunnelse: yup.string().test({
      name: 'statusBegrunnelse',
      message: 'Du må dokumentere på begrunnelse.',
      test: function (statusBegrunnelse) {
        const { parent } = this
        if (
          parent.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT &&
          (statusBegrunnelse === '' || statusBegrunnelse === undefined)
        ) {
          return false
        }
        return true
      },
    }),
    status: yup.string().test({
      name: 'etterlevelseStatus',
      message:
        'Du må dokumentere alle kriterier før du har dokumentert ferdig. Du kan velge å lagre og fortsette senere.',
      test: function (status) {
        const { parent } = this
        if (
          status === EEtterlevelseStatus.FERDIG ||
          status === EEtterlevelseStatus.FERDIG_DOKUMENTERT
        ) {
          return parent.suksesskriterieBegrunnelser.every((skb: any) => skb.suksesskriterieStatus)
        }
        return true
      },
    }),
    fristForFerdigstillelse: yup.string().test({
      name: 'frist',
      message: 'Du må sette på en frist dato for ferdistilling.',
      test: function (fristForFerdigstillelse) {
        const { parent } = this
        if (
          parent.status === EEtterlevelseStatus.OPPFYLLES_SENERE &&
          (fristForFerdigstillelse === undefined || fristForFerdigstillelse === null)
        ) {
          return false
        }
        return true
      },
    }),
  })
}
