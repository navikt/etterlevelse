'use client'

import { ettlevColors } from '@/util/theme/theme'
import { LinkIcon, XMarkIcon } from '@navikt/aksel-icons'
import { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
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

  const getBlockType = () => {
    if (editor.isActive('blockquote')) return 'blockquote'
    else if (editor.isActive('codeBlock')) return 'codeBlock'
    else if (editor.isActive('heading', { level: 2 })) return 'h2'
    else if (editor.isActive('heading', { level: 3 })) return 'h3'
    else if (editor.isActive('heading', { level: 4 })) return 'h4'
    else if (editor.isActive('heading', { level: 5 })) return 'h5'
    else if (editor.isActive('heading', { level: 6 })) return 'h6'
    return 'normal'
  }
  const currentBlockType = getBlockType()

  const setBlockType = (value: string) => {
    const chain = editor.chain().focus()
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
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </ToolbarButton>
        <ToolbarButton
          label='Italic'
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </ToolbarButton>
        {withUnderline && (
          <ToolbarButton
            label='Underline'
            active={editor.isActive('underline')}
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
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>
        <ToolbarButton
          label='Ordered'
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
      </div>

      <div className='rdw-link-wrapper' role='group' aria-label='Link' ref={linkFormRef}>
        <ToolbarButton
          label='Link'
          active={editor.isActive('link')}
          expanded={showLinkForm}
          onClick={openLinkForm}
        >
          <LinkIcon aria-hidden />
        </ToolbarButton>
        {editor.isActive('link') && (
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
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            label='Redo'
            disabled={!editor.can().redo()}
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
