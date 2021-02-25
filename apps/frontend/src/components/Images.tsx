import archiveImage from '../resources/img/archive.png'
import archive2Image from '../resources/img/archive2.png'
import hammerImage from '../resources/img/hammer.png'
import keyboardImage from '../resources/img/keyboard.png'
import peopleImage from '../resources/img/people.png'
import scalesImage from '../resources/img/scales.png'
import cameraImage from '../resources/img/camera.png'
import guardianImage from '../resources/img/guardian.png'
import navImage from '../resources/img/nav-logo-red.svg'
import moneyImage from '../resources/img/money.png'
import bookImage from '../resources/img/book.png'


import pencilFill from '../resources/icons/pencil-fill.svg'
import lawBook from '../resources/icons/law-book-shield.svg'
import barChart from '../resources/icons/bar-chart.svg'
import illustration from '../resources/giammarco-boscaro-zeH-ljawHtg-unsplash.jpg'
import {LovCode} from '../services/Codelist'
import React from 'react'
import {theme} from '../util'

export {
  pencilFill,
  lawBook,
  barChart,
  illustration
}

export const lovBilder: {[id: string]: string} = {
  ARKIV: archiveImage,
  FORSKRIFT_EFORVALTNING: keyboardImage,
  FOLKETRYGDLOVEN: peopleImage,
  FORSKRIFT_UU: bookImage,
  FORVALTNINGSLOVEN: scalesImage,
  PERSONOPPLYSNINGSLOVEN: hammerImage,

  FORSKRIFT_OFFENTLEG_ARKIV: archive2Image,
  FORSKRIFT_OKONOMIREGLEMENTET: moneyImage,
  NAV_LOVEN: navImage,
  SIKKERHETSLOVEN: cameraImage,
  VERGEMAALSLOVEN: guardianImage,
}

const bildeForLov = (code: LovCode) => {
  const imageCode = code.data?.image || code.code
  return lovBilder[imageCode] || bookImage
}

export const LovBilde = (props: {code: LovCode, width?: string, height?: string, ellipse?: boolean}) => (
  <img src={bildeForLov(props.code)}
       width={props.width} height={props.height}
       style={{
         objectFit: 'cover',
         borderRadius: props.ellipse ? '15px' : undefined,
         border: props.ellipse ? `2px solid ${theme.colors.mono600}` : undefined
       }}
       alt={`Lov illustrasjon: ${props.code.shortName}`}
  />
)
