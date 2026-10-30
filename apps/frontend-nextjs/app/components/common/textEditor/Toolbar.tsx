'use client'

import { LinkIcon, XMarkIcon } from '@navikt/aksel-icons'
import { TextSelection } from '@tiptap/pm/state'
import { Editor, useEditorState } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { ettlevColors } from '@/util/theme/theme'
import { highlightColors, textColors } from './extensions'

type TToolbarProps = {
  editor: Editor
  simple?: boolean
  withHighlight?: boolean
  withUnderline?: boolean
  withTextColor?: boolean
}

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  label,
  expanded,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  expanded?: boolean
  children: React.ReactNode
}) => (
  <button
    type='button'
    aria-pressed={!!active}
    aria-expanded={expanded}
    aria-haspopup={expanded !== undefined ? 'true' : undefined}
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={`rdw-option-wrapper ${active ? 'rdw-option-active' : ''}`}
  >
    {children}
  </button>
)

// Lukker en åpen popover når man trykker Escape eller klikker/tabber utenfor den,
// og flytter fokus til første element i popoveren når den åpnes.
const usePopover = (open: boolean, onClose: () => void) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const firstFocusable = ref.current?.querySelector<HTMLElement>(
      'button, input, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onClose])

  return ref
}

export const Toolbar = ({
  editor,
  simple,
  withHighlight,
  withUnderline,
  withTextColor,
}: TToolbarProps) => {
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const linkFormRef = usePopover(showLinkForm, () => setShowLinkForm(false))
  const colorPickerRef = usePopover(showColorPicker, () => setShowColorPicker(false))
  const textColorPickerRef = usePopover(showTextColorPicker, () => setShowTextColorPicker(false))

  const getBlockType = (editor: Editor) => {
    const { doc, selection } = editor.state
    const blockTypes = new Set<string>()

    // isActive() fails for select-all (Cmd+A), so inspect the textblocks in the selection directly.
    doc.nodesBetween(selection.from, selection.to, (node, pos) => {
      if (!node.isTextblock) return true
      const $pos = doc.resolve(pos)
      const inBlockquote = Array.from({ length: $pos.depth + 1 }, (_, depth) =>
        $pos.node(depth)
      ).some((ancestor) => ancestor.type.name === 'blockquote')

      if (inBlockquote) blockTypes.add('blockquote')
      else if (node.type.name === 'codeBlock') blockTypes.add('codeBlock')
      else if (node.type.name === 'heading') blockTypes.add(`h${node.attrs.level}`)
      else blockTypes.add('normal')
      return false
    })

    if (blockTypes.size === 0) return 'normal'
    return blockTypes.size === 1 ? [...blockTypes][0] : 'mixed'
  }

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      blockType: getBlockType(editor),
      isBold: editor.isActive('bold'),
      isItalic: editor.isActive('italic'),
      isUnderline: editor.isActive('underline'),
      isBulletList: editor.isActive('bulletList'),
      isOrderedList: editor.isActive('orderedList'),
      isLink: editor.isActive('link'),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  })
  const currentBlockType = editorState.blockType

  const setBlockType = (value: string) => {
    const chain = editor
      .chain()
      .focus()
      .command(({ tr }) => {
        // Block types apply to whole textblocks, so move a partial selection into its own block first.
        const { from, to, $from, $to, empty } = tr.selection
        if (empty || !$from.sameParent($to) || !$from.parent.isTextblock) return true

        const splitAtStart = from > $from.start()
        const splitAtEnd = to < $to.end()
        if (splitAtEnd) tr.split(to)
        if (splitAtStart) tr.split(from)

        const offset = splitAtStart ? 2 : 0
        tr.setSelection(TextSelection.create(tr.doc, from + offset, to + offset))
        return true
      })

    if (value === 'normal') {
      chain.setParagraph().run()
    } else if (value === 'blockquote') {
      chain.setBlockquote().run()
    } else if (value === 'codeBlock') {
      chain.setCodeBlock().run()
    } else {
      const level = Number(value.replace('h', '')) as 2 | 3 | 4 | 5 | 6
      chain.setHeading({ level }).run()
    }
  }

  const openLinkForm = () => {
    setLinkUrl(editor.getAttributes('link').href || '')
    setShowLinkForm(true)
  }

  const applyLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setShowLinkForm(false)
    setLinkUrl('')
  }

  const removeLink = () => {
    editor.chain().focus().unsetLink().run()
    setShowLinkForm(false)
    setLinkUrl('')
  }

  return (
    <div
      role='toolbar'
      aria-label='Tekstformatering'
      className='rdw-editor-toolbar'
      style={{
        backgroundColor: ettlevColors.white,
        borderBottom: `0.063rem solid ${ettlevColors.textAreaBorder}`,
      }}
    >
      <div className='rdw-inline-wrapper' role='group' aria-label='Tekststil'>
        <ToolbarButton
          label='Bold'
          active={editorState.isBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </ToolbarButton>
        <ToolbarButton
          label='Italic'
          active={editorState.isItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </ToolbarButton>
        {withUnderline && (
          <ToolbarButton
            label='Underline'
            active={editorState.isUnderline}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <u>U</u>
          </ToolbarButton>
        )}
      </div>

      {!simple && (
        <select
          aria-label='Block Type'
          value={currentBlockType}
          onChange={(event) => setBlockType(event.target.value)}
          className='rdw-dropdown-wrapper'
        >
          <option value='mixed' disabled hidden>
            Blandet
          </option>
          <option value='normal'>Normal</option>
          <option value='h2'>H2</option>
          <option value='h3'>H3</option>
          <option value='h4'>H4</option>
          <option value='h5'>H5</option>
          <option value='h6'>H6</option>
          <option value='blockquote'>Blockquote</option>
          <option value='codeBlock'>Code</option>
        </select>
      )}

      <div className='rdw-list-wrapper' role='group' aria-label='List'>
        <ToolbarButton
          label='Unordered'
          active={editorState.isBulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>
        <ToolbarButton
          label='Ordered'
          active={editorState.isOrderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
      </div>

      <div className='rdw-link-wrapper' role='group' aria-label='Link' ref={linkFormRef}>
        <ToolbarButton
          label='Link'
          active={editorState.isLink}
          expanded={showLinkForm}
          onClick={openLinkForm}
        >
          <LinkIcon aria-hidden />
        </ToolbarButton>
        {editorState.isLink && (
          <ToolbarButton label='Unlink' onClick={removeLink}>
            Fjern lenke
          </ToolbarButton>
        )}
        {showLinkForm && (
          <div className='rdw-link-modal'>
            <label htmlFor='text-editor-link-url'>Link Url</label>
            <input
              id='text-editor-link-url'
              type='text'
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
            <div className='rdw-link-modal-buttons'>
              <button type='button' onClick={applyLink}>
                Legg Til
              </button>
              <button type='button' onClick={() => setShowLinkForm(false)}>
                Avbryt
              </button>
            </div>
          </div>
        )}
      </div>

      {!simple && (
        <div className='rdw-history-wrapper'>
          <ToolbarButton
            label='Undo'
            disabled={!editorState.canUndo}
            onClick={() => editor.chain().focus().undo().run()}
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            label='Redo'
            disabled={!editorState.canRedo}
            onClick={() => editor.chain().focus().redo().run()}
          >
            ↷
          </ToolbarButton>
        </div>
      )}

      {!simple && withHighlight && (
        <div className='rdw-colorpicker-wrapper' ref={colorPickerRef}>
          <ToolbarButton
            label='Highlight'
            expanded={showColorPicker}
            onClick={() => setShowColorPicker((v) => !v)}
          >
            Highlight
          </ToolbarButton>
          {showColorPicker && (
            <div className='rdw-colorpicker-modal' role='group' aria-label='Highlight'>
              <button
                type='button'
                aria-label='Fjern bakgrunnsfarge'
                aria-pressed={!editor.isActive('backgroundColor')}
                title='Fjern bakgrunnsfarge'
                className='rdw-colorpicker-option rdw-colorpicker-remove'
                onClick={() => {
                  editor.chain().focus().unsetBackgroundColor().run()
                  setShowColorPicker(false)
                }}
              >
                <XMarkIcon aria-hidden />
              </button>
              {highlightColors.map(({ label, value }) => (
                <button
                  type='button'
                  key={value}
                  aria-label={label}
                  aria-pressed={editor.isActive('backgroundColor', { color: value })}
                  title={label}
                  style={{ backgroundColor: value }}
                  className='rdw-colorpicker-option'
                  onClick={() => {
                    editor.chain().focus().setBackgroundColor(value).run()
                    setShowColorPicker(false)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!simple && withTextColor && (
        <div className='rdw-colorpicker-wrapper' ref={textColorPickerRef}>
          <ToolbarButton
            label='Text Color'
            expanded={showTextColorPicker}
            onClick={() => setShowTextColorPicker((v) => !v)}
          >
            Tekstfarge
          </ToolbarButton>
          {showTextColorPicker && (
            <div className='rdw-colorpicker-modal' role='group' aria-label='Text Color'>
              <button
                type='button'
                aria-label='Fjern tekstfarge'
                aria-pressed={!editor.isActive('textColor')}
                title='Fjern tekstfarge'
                className='rdw-colorpicker-option rdw-colorpicker-remove'
                onClick={() => {
                  editor.chain().focus().unsetTextColor().run()
                  setShowTextColorPicker(false)
                }}
              >
                <span style={{ color: 'black' }}>A</span>
              </button>
              {textColors.map(({ label, value }) => (
                <button
                  type='button'
                  key={value}
                  aria-label={label}
                  aria-pressed={editor.isActive('textColor', { color: value })}
                  title={label}
                  className='rdw-colorpicker-option rdw-textcolor-option'
                  onClick={() => {
                    editor.chain().focus().setTextColor(value).run()
                    setShowTextColorPicker(false)
                  }}
                >
                  <span style={{ color: value }}>A</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
