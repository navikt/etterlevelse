import { Mark, mergeAttributes } from '@tiptap/core'
import TiptapUnderline from '@tiptap/extension-underline'

// gul = FFF83B, turkis = 7FF2FF, grønn = 9DFF3B, rosa = FFAFEB,
// hvit = FFFFFF (brukes for å fjerne farge), oransje = FFC074, mørkelilla = C8CAFF
export const highlightColors = [
  'rgb(255, 248, 59)',
  'rgb(127, 242, 255)',
  'rgb(157, 255, 59)',
  'rgb(255, 175, 235)',
  'rgb(255, 255, 255)',
  'rgb(255, 192, 116)',
  'rgb(200, 202, 255)',
]

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    backgroundColor: {
      setBackgroundColor: (color: string) => ReturnType
      unsetBackgroundColor: () => ReturnType
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
