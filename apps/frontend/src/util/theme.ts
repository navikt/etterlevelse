import { createTheme, lightThemePrimitives } from 'baseui'
import { colors } from 'baseui/tokens'
import { Theme, ThemePrimitives } from 'baseui/theme'
import { RecursivePartial } from '../constants'
import '@fontsource/source-sans-pro/200.css'
import '@fontsource/source-sans-pro/300.css'
import '@fontsource/source-sans-pro/400.css'
import '@fontsource/source-sans-pro/600.css'
import '@fontsource/source-sans-pro/700.css'
import '@fontsource/source-sans-pro/900.css'
import { Responsive, Scale } from 'baseui/block'

// etterlevelse colors
export const ettlevColors = {
  green800: '#102723',
  green600: '#14483F',
  green400: '#057967',
  green100: '#CCD9D7',
  green50: '#EAF0EF',
  red600: '#842D08',
  red400: '#AE5235',
  red200: '#EAA98D',
  red50: '#F6EAE6',
  grey600: '#757575',
  grey200: '#A0A0A0',
  grey100: '#DFDFDF',
  grey75: '#E5E5E5',
  grey50: '#F1F1F1',
  grey25: '#F8F8F8',
  white: '#FFFFFF',
  black: '#000000',
  success400: '#057967',
  success50: '#EAF0EF',
  warning400: '#FFA631',
  warning50: '#FFF5E7',
  error400: '#AE5235',
  error50: '#F6EAE6',
  textAreaBorder: '#E0E0E0',
  navMorkGra: '#262626',
  navGra80: '#4f4f4f',
  navOransje: '#A86400',
  focusOutline: '#0056B4',
  navDypBla: '#004367',
  navLysBla: '#E5F0F7',
  lysBla: '#E6F1F8',
}

export const primitives: ThemePrimitives & { primary150: string; primary350: string } = {
  ...lightThemePrimitives,
  primaryA: ettlevColors.green800,
  primary: '#19548a',
  primary50: '#F2F8FD',
  primary100: '#eaf4fc',
  primary150: '#C1DBF2',
  primary200: '#99c2e8',
  primary300: '#396FA1',
  primary350: '#0067c5',
  primary400: '#19548a',
  primary500: colors.blue500,
  primary600: colors.blue600,
  primary700: colors.blue700,
  primaryFontFamily: 'Source Sans Pro',
}

export const searchResultColor = {
  kravBackground: '#FFE9CC',
  behandlingBackground: '#F5DBEB',
  dokumentasjonBackground: '#99e8a7',
  underavdelingBackground: '#99C2E8',
}

const overrides: RecursivePartial<Theme> = {
  colors: {
    //Focus outline color
    accent: ettlevColors.focusOutline,
    //primary button color overrides:
    buttonPrimaryFill: ettlevColors.green400,
    buttonPrimaryText: ettlevColors.green50,
    buttonPrimaryHover: ettlevColors.green600,
    buttonPrimaryActive: ettlevColors.green800,
    buttonPrimarySelectedFill: ettlevColors.green50,
    //secondary button color overrides:
    buttonSecondaryFill: ettlevColors.white,
    buttonSecondaryText: ettlevColors.green600,
    buttonSecondaryHover: ettlevColors.green50,
    buttonSecondaryActive: ettlevColors.grey200,
    //tertiary button color overrides:
    buttonTertiaryFill: 'transparent',
    buttonTertiaryText: ettlevColors.green600,
    buttonTertiaryHover: ettlevColors.green50,
    buttonTertiaryActive: ettlevColors.green100,
    //tag colors
    tagPrimaryOutlinedBackground: ettlevColors.success400,
    tagPrimaryOutlinedFont: ettlevColors.black,
    // Link colors
    linkText: ettlevColors.black,
    // linkVisited is same as active
    linkVisited: ettlevColors.black,
    linkHover: ettlevColors.green600,
    linkActive: ettlevColors.green400,
    // input fields & text area
    inputBorder: ettlevColors.grey200,
    inputFill: ettlevColors.white,
    inputFillActive: ettlevColors.white,
    // borderFocus: ettlevColors.green400, // same as inputFillActive to hide
    menuFill: ettlevColors.white,
    menuFillHover: ettlevColors.green50,
    menuFontHighlighted: ettlevColors.green400,
    inputFillError: ettlevColors.error400,
    // Radio and checkbox buttons
    tickFillSelected: ettlevColors.green800,
    tickFillSelectedHover: ettlevColors.green600,
    tickFillHover: ettlevColors.green100,
    tickFill: ettlevColors.white,
    tickFillError: ettlevColors.red50,
    tickBorder: ettlevColors.green800,
    tickFillSelectedHoverActive: ettlevColors.white,

    inputEnhancerFill: primitives.primary100,

    tabBarFill: colors.white,
  },
  borders: {
    buttonBorderRadius: '4px',
    inputBorderRadius: '4px',
  },
  typography: {
    // Increase weight 500->600 on bold texts
    font100: { fontWeight: 400, fontSize: '14px', lineHeight: '21px' }, //P4 ParagraphXSmall
    font150: { fontWeight: 500, fontSize: '14px', lineHeight: '20px' }, // mini button
    font200: { fontWeight: 400, fontSize: '16px', lineHeight: '20px' },
    font250: { fontWeight: 700, fontSize: '18px', lineHeight: '24px' }, //compact button, LabelSmall
    font300: { fontWeight: 400, fontSize: '18px', lineHeight: '24px' }, //P2 ParagraphMedium
    font350: { fontWeight: 600 },

    font400: { fontWeight: 400, fontSize: '22px', lineHeight: '32px' }, //P1 ParagraphLarge

    font450: { fontWeight: 600 },
    font550: { fontWeight: 600 },
    font650: { fontWeight: 600 },

    font750: { fontWeight: 700, fontSize: '18px', lineHeight: '24px' }, //H4 HeadingMedium
    font850: { fontWeight: 700, fontSize: '22px', lineHeight: '28px' }, //H3 HeadingLarge
    font950: { fontWeight: 900, fontSize: '24px', lineHeight: '32px' }, //H2 HeadingXLarge
    font1050: { fontWeight: 900, fontSize: '32px', lineHeight: '40px' }, //H1 HeadingXXLarge

    font1150: { fontWeight: 600 },
    font1250: { fontWeight: 600 },
    font1350: { fontWeight: 600 },
    font1450: { fontWeight: 600 },
  },
}

export const theme = createTheme(primitives, overrides)
export const pageWidth = '820px'
export const maxPageWidth = '1276px'

export const responsivePaddingSmall: Responsive<Scale> = ['16px', '16px', '16px', '32px', '32px', '32px']
export const responsivePaddingLarge: Responsive<Scale> = ['16px', '16px', '16px', '100px', '100px', '100px']
export const responsivePaddingExtraLarge: Responsive<Scale> = ['16px', '16px', '16px', '200px', '200px', '200px']
export const responsivePaddingInnerPage: Responsive<Scale> = ['16px', '16px', '16px', '16px', '16px', '200px']

export const responsiveWidthSmall: Responsive<Scale> = [
  'calc(100% - 32px)',
  'calc(100% - 32px)',
  'calc(100% - 32px)',
  'calc(100% - 64px)',
  'calc(100% - 64px)',
  'calc(100% - 64px)',
]
export const responsiveWidthLarge: Responsive<Scale> = [
  'calc(100% - 32px)',
  'calc(100% - 32px)',
  'calc(100% - 32px)',
  'calc(100% - 200px)',
  'calc(100% - 200px)',
  'calc(100% - 200px)',
]

export const responsiveWidthExtraLarge: Responsive<Scale> = [
  'calc(100% - 32px)',
  'calc(100% - 32px)',
  'calc(100% - 32px)',
  'calc(100% - 400px)',
  'calc(100% - 400px)',
  'calc(100% - 400px)',
]

export const responsiveWidthInnerPage: Responsive<Scale> = [
  'calc(100% - 32px)',
  'calc(100% - 32px)',
  'calc(100% - 32px)',
  'calc(100% - 32px)',
  'calc(100% - 32px)',
  'calc(100% - 400px)',
]

const breakpoints: any = {
  xsmall: 375,
  small: 480,
  medium: 648,
  large: 768,
  xlarge: 960,
  xxlarge: 1276,
}

const ResponsiveTheme = Object.keys(breakpoints).reduce(
  (acc: any, key: any) => {
    acc.mediaQuery[key] = `@media screen and (min-width: ${breakpoints[key]}px)`
    return acc
  },
  {
    breakpoints,
    mediaQuery: {},
  },
)
export const customTheme = { ...theme, ...ResponsiveTheme }
