import { RawDraftContentState, RawDraftInlineStyleRange } from 'draft-js'

export const translateUnderlineToDraft = (draftData: RawDraftContentState) => {
  draftData.blocks.map((data) => {
    const plainText = data.text
      .replaceAll(/<span style='background-color: rgb(.*?)'>/g, '')
      .replaceAll('</span>', '')
      .replaceAll('<ins>', '')
      .replaceAll('</ins>', '')
    const newStyles: RawDraftInlineStyleRange[] = []
    const match = data.text.matchAll(/<ins>(.*?)<\/ins>/g)

    match.forEach((result) => {
      const highlightMatches = result[0].matchAll(
        /<span style='background-color: rgb(.*?)'>(.*?)<\/span>/g
      )
      highlightMatches.forEach((highlight) => {
        const highlightStyle = {
          offset: 0,
          length: 0,
          style: '',
        }
        highlight.forEach((value: string, index: number) => {
          if (index === 1) {
            highlightStyle.style = 'bgcolor-rgb' + value
          }
          if (index === 2) {
            highlightStyle.offset = plainText.indexOf(value)
            highlightStyle.length = value.length
          }
        })
        newStyles.push(highlightStyle as RawDraftInlineStyleRange)
      })

      result.forEach((value: string, index: number) => {
        if (index === 1) {
          const textWithOuthighlightTags = value
            .replaceAll(/<span style='background-color: rgb(.*?)'>/g, '')
            .replaceAll('</span>', '')
          newStyles.push({
            offset: plainText.indexOf(textWithOuthighlightTags),
            length: textWithOuthighlightTags.length,
            style: 'UNDERLINE',
          })
        }
      })
    })

    data.text = data.text.replaceAll('<ins>', '').replaceAll('</ins>', '')
    data.inlineStyleRanges = [...data.inlineStyleRanges, ...newStyles]
  })
}

export const translateHighlightToDraft = (draftData: RawDraftContentState) => {
  draftData.blocks.map((data) => {
    const match = data.text.matchAll(/<span style='background-color: rgb(.*?)'>(.*?)<\/span>/g)
    const plainText = data.text
      .replaceAll('<ins>', '')
      .replaceAll('</ins>', '')
      .replaceAll(/<span style='background-color: rgb(.*?)'>/g, '')
      .replaceAll('</span>', '')
    const newStyles: RawDraftInlineStyleRange[] = []

    match.forEach((result) => {
      const underlineMatches = result[0].matchAll(/<ins>(.*?)<\/ins>/g)
      underlineMatches.forEach((underline) => {
        underline.forEach((value: string, index: number) => {
          if (index === 1) {
            newStyles.push({
              offset: plainText.indexOf(value),
              length: value.length,
              style: 'UNDERLINE',
            })
          }
        })
      })

      const highlightStyle = {
        offset: 0,
        length: 0,
        style: '',
      }

      result.forEach((value: string, index: number) => {
        if (index === 1) {
          highlightStyle.style = 'bgcolor-rgb' + value
        }
        if (index === 2) {
          const textWithOutUnderlineTags = value.replaceAll('<ins>', '').replaceAll('</ins>', '')
          highlightStyle.offset = plainText.indexOf(textWithOutUnderlineTags)
          highlightStyle.length = textWithOutUnderlineTags.length
        }
      })

      newStyles.push(highlightStyle as RawDraftInlineStyleRange)
    })

    data.text = data.text
      .replaceAll(/<span style='background-color: rgb(.*?)'>/g, '')
      .replaceAll('</span>', '')
    data.inlineStyleRanges = [...data.inlineStyleRanges, ...newStyles]
  })
}
