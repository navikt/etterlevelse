import { Mark, mergeAttributes } from '@tiptap/core'
import TiptapOrderedList from '@tiptap/extension-ordered-list'
import TiptapUnderline from '@tiptap/extension-underline'

// gul = FFF83B, turkis = 7FF2FF, grønn = 9DFF3B, rosa = FFAFEB,
// hvit = FFFFFF (brukes for å fjerne farge), oransje = FFC074, mørkelilla = C8CAFF
export const highlightColors: { label: string; value: string }[] = [
  { label: 'Gul', value: 'rgb(255, 248, 59)' },
  { label: 'Turkis', value: 'rgb(127, 242, 255)' },
  { label: 'Grønn', value: 'rgb(157, 255, 59)' },
  { label: 'Rosa', value: 'rgb(255, 175, 235)' },
  { label: 'Oransje', value: 'rgb(255, 192, 116)' },
  { label: 'Mørkelilla', value: 'rgb(200, 202, 255)' },
]

// Aksel design-tokens (ds-css) for tekstfarge, til bruk for PVO-brukere.
// Bruker de statiske fargeverdiene (lys-tema, 600-nivå) i stedet for CSS-variablene, siden
// @navikt/ds-css importeres i et eget CSS-layer og --ax-text-* variablene ikke
// resolves korrekt i den layeren i denne editoren. 1000-nivået (--ax-text-*) er ment
// for tekstkontrast og er derfor svært mørkt/nesten sort, og var vanskelig å skille fra
// hverandre i fargevelgeren, så 600-nivået brukes for tydeligere/mer synlige farger.
export const textColors: { label: string; value: string }[] = [
  { label: 'Accent', value: '#2176d4' },
  { label: 'Success', value: '#00893c' },
  { label: 'Warning', value: '#ca5000' },
  { label: 'Meta Purple', value: '#905bd3' },
]

// Interface trenger å hete Commands

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    backgroundColor: {
      setBackgroundColor: (color: string) => ReturnType
      unsetBackgroundColor: () => ReturnType
    }
    textColor: {
      setTextColor: (color: string) => ReturnType
      unsetTextColor: () => ReturnType
    }
  }
}

// Rendrer som <span style='background-color: rgb(...)'> for å beholde samme markdown-format
// som tidligere ble produsert av react-draft-wysiwyg/markdown-draft-js.
export const BackgroundColor = Mark.create({
  name: 'backgroundColor',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {}
          }
          return { style: `background-color: ${attributes.color}` }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) =>
          typeof element !== 'string' && element.style.backgroundColor ? {} : false,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setBackgroundColor:
        (color: string) =>
        ({ chain }) =>
          chain().setMark(this.name, { color }).run(),
      unsetBackgroundColor:
        () =>
        ({ chain }) =>
          chain().unsetMark(this.name).run(),
    }
  },
})

// Rendrer som <span style='color: ...'> for tekstfarge (Aksel design-tokens).
export const TextColor = Mark.create({
  name: 'textColor',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {}
          }
          return { style: `color: ${attributes.color}` }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) =>
          typeof element !== 'string' && element.style.color && !element.style.backgroundColor
            ? {}
            : false,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setTextColor:
        (color: string) =>
        ({ chain }) =>
          chain().setMark(this.name, { color }).run(),
      unsetTextColor:
        () =>
        ({ chain }) =>
          chain().unsetMark(this.name).run(),
    }
  },
})

// Rendrer som <ins> i stedet for standard <u> for å beholde samme markdown-format
// som tidligere ble produsert (UNDERLINE -> <ins>...</ins>).
export const Underline = TiptapUnderline.extend({
  parseHTML() {
    return [{ tag: 'ins' }, { tag: 'u' }, { style: 'text-decoration=underline' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['ins', mergeAttributes(HTMLAttributes), 0]
  },
})

// Fjerner input-regelen som automatisk gjør om tekst som "21. " til en nummerert liste
// mens man skriver, slik at f.eks. datoer som "21. mars" ikke blir tolket som en liste.
// Listeknappen i verktøylinjen (toggleOrderedList) fungerer fortsatt som normalt.
export const OrderedList = TiptapOrderedList.extend({
  addInputRules() {
    return []
  },
})
