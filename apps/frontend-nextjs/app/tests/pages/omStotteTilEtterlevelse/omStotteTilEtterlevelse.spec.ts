import { Locator, expect, test } from '@playwright/test'
import { omPVKUrl, oversiktOverLosningeneUrl } from '@/routes/omSidene/omSideneUrl'
import {
  behandlerPersonopplysningerId,
  besvareEtterlevelseskravId,
  detteInneholderEtEtterlevelseKravUrl,
  faEtterlevelsenGodkjentId,
  forRisikoeiereId,
  formaaletMedStotteTilEtterlevelseUrl,
  forsidenIStotteTilEtterlevelseUrl,
  gjenbrukId,
  hvordanDokumentereEtterlevelseUrl,
  jobbeITemaoversiktenId,
  omStotteTilEtterlevelseUrl,
  oppdatereEtterGodkjenningId,
  oppretteEllerOppdatereId,
  redigereDokumentegenskaperId,
  redigereDokumentegenskaperUrl,
  slikGjenbrukerDuId,
  taKontaktUrl,
  temainndelingOgTemaoversiktUrl,
  tilretteleggeForGjenbrukId,
} from '@/routes/omstottetiletterlevelse/omstottetiletterlevelseRoutes'
import { mockAdmin, mockRead } from '../../utils/roller'

const baseUrl = 'http://localhost:3000'
const pageUrl = `${baseUrl}${omStotteTilEtterlevelseUrl}`

const sections = [
  ['Hva er formålet med Støtte til etterlevelse?', formaaletMedStotteTilEtterlevelseUrl],
  ['Forsiden i Støtte til etterlevelse', forsidenIStotteTilEtterlevelseUrl],
  ['Temainndeling og temaoversikt', temainndelingOgTemaoversiktUrl],
  ['Dette inneholder et etterlevelseskrav', detteInneholderEtEtterlevelseKravUrl],
  ['Hvordan dokumentere etterlevelse', hvordanDokumentereEtterlevelseUrl],
  ['Ta kontakt', taKontaktUrl],
] as const

const accordionItems = [
  {
    title: 'Opprette eller oppdatere et etterlevelsesdokument',
    id: oppretteEllerOppdatereId,
    content: 'Dersom dere ikke allerede har et etterlevelsesdokument',
    examples: [
      'Vis meg hvor jeg oppretter et etterlevelsesdokument',
      'Vis meg hvor jeg finner og oppdaterer mine etterlevelsesdokumenter',
    ],
    videos: [
      'VisMegHvordanJegOppretterEtterlevelsesdokument.mov',
      'VisMegHvorJegFinnerOgOppdatererEtterlevelsesdokument.mov',
    ],
  },
  {
    title: 'Redigere dokumentegenskaper og filtrere krav',
    id: redigereDokumentegenskaperId,
    content: 'Når dere skal opprette eller oppdatere et etterlevelsesdokument',
    examples: [
      'Vis meg hvor jeg redigerer dokumentegenskaper etter at jeg har opprettet et nytt etterlevelsesdokument',
    ],
    videos: ['VisMegHvordanJegRedigererDokumentegenskaper.mov'],
  },
  {
    title: 'Jobbe i temaoversikten',
    id: jobbeITemaoversiktenId,
    content: 'Basert på hvilke egenskaper dere valgte som relevante for deres dokumentasjon',
    examples: [],
    videos: [],
  },
  {
    title: 'Besvare etterlevelseskrav',
    id: besvareEtterlevelseskravId,
    content: 'Hvert krav inneholder et sett med suksesskriterier',
    examples: ['Vis meg hvordan jeg besvarer etterlevelseskrav'],
    videos: ['VisMegHvordanJegBesvarerEtterlevelseskrav.mov'],
  },
  {
    title: 'Etterlevelse når dere behandler personopplysninger',
    id: behandlerPersonopplysningerId,
    content: 'Når dere behandler personopplysninger, skal dere vurdere om det er behov',
    examples: ['Vis meg hvor jeg finner inngangen til disse sidene'],
    videos: [],
  },
  {
    title: 'Få etterlevelsen godkjent av risikoeier',
    id: faEtterlevelsenGodkjentId,
    content: 'Etterlevelsesdokumenter kan godkjennes av risikoeieren til enhver tid',
    examples: ['Vis meg hvordan jeg får etterlevelsen godkjent av risikoeier'],
    videos: ['FaaEtterlevelsenGodkjentAvRisikoeier.mov'],
  },
  {
    title: 'For risikoeiere: slik godkjenner du etterlevelsen',
    id: forRisikoeiereId,
    content: 'Når du vil godkjenne et etterlevelsesdokument',
    examples: ['Vis meg hvordan jeg som risikoeier godkjenner et etterlevelsesdokument'],
    videos: ['VisMegHvordanJegGodkjennerEtterlevelse.mov'],
  },
  {
    title: 'Oppdatere etterlevelsesdokumentasjon etter godkjenning',
    id: oppdatereEtterGodkjenningId,
    content: 'Etter at dere har fått etterlevelsesdokumentasjon godkjent av risikoeier',
    examples: ['Vis meg hvordan jeg oppdaterer et etterlevelsesdokument etter godkjenning'],
    videos: ['VisMegHvordanJegOppdatererEtterGodkjenning.mov'],
  },
  {
    title: 'Gjenbruk av etterlevelsesdokumentasjon',
    id: gjenbrukId,
    content: 'Generelt om gjenbruk',
    examples: [
      'Eksempel: kameraovervåkning på landets Nav-kontor.',
      'Eksempel: bruk av Innblikk til måling av brukeratferd',
    ],
    videos: [],
  },
  {
    title: 'Slik tilrettelegger dere for gjenbruk av deres eget etterlevelsesdokument',
    id: tilretteleggeForGjenbrukId,
    content: '1. Velg “tilrettelegg for gjenbruk” fra menyen',
    examples: [
      'Vis meg hvordan jeg tilrettelegger for gjenbruk av etterlevelsesdokument mitt',
      'Vis meg hvordan jeg slår på gjenbruk',
      'Vis meg hvordan jeg redigerer gjenbrukstekst eller slår av gjenbruk',
    ],
    videos: [
      'VisMegHvordanJegTilretteleggerForGjenbruk.mov',
      'VisMegHvordanJegSlaarPaaGjenbruk.mov',
      'VisMegHvordanJegRedigererEllerSlaarAvGjenbruk.mov',
    ],
  },
  {
    title: 'Slik gjenbruker du et etterlevelsesdokument',
    id: slikGjenbrukerDuId,
    content: '1. Opprett datterdokument',
    examples: ['Vis meg hvordan jeg tar gjenbrukskopi av et etterlevelsesdokument'],
    videos: ['VisMegHvordanJegTarGjenbrukskopiAvEtDokument.mov'],
  },
]

const toggleExample = async (button: Locator) => {
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  const content = button.locator('..').locator('.aksel-read-more__content')
  await expect(content).toBeHidden()
  await button.click()
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  await expect(content).toBeVisible()
  await expect.poll(() => content.evaluate((element) => element.hasChildNodes())).toBe(true)
  await button.click()
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  await expect(content).toBeHidden()
}

test.describe('Om Støtte til etterlevelse', () => {
  test.beforeEach(async ({ page }) => {
    await mockAdmin(page)
    await page.goto(pageUrl)
    await expect(
      page.getByRole('heading', { name: 'Om Støtte til etterlevelse', exact: true })
    ).toBeVisible()
  })

  test('Som en bruker vil jeg se innhold, overskrifter, illustrasjon og introduksjonsvideo', async ({
    page,
  }) => {
    const main = page.getByRole('main')
    await expect(page).toHaveTitle('Om Støtte til etterlevelse')
    await expect(main.getByRole('heading', { level: 2 })).toHaveText(
      sections.map(([title]) => title)
    )
    await expect(
      main.getByText('Støtte til etterlevelse er et digital verktøy', { exact: false })
    ).toBeVisible()
    await expect(main.getByText('Send mail til: teamdatajegerne@nav.no')).toBeVisible()
    await expect(main.getByText('Bli med på #etterlevelse på Slack')).toBeVisible()
    const illustration = main.getByRole('img', {
      name: 'Skjermbilde fra forsiden til Støtte til etterlevelse',
    })
    await expect(illustration).toBeVisible()
    // Lazy-loaded images can be visible in the DOM without being near the viewport.
    await illustration.scrollIntoViewIfNeeded()
    await expect
      .poll(() => illustration.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0)
    const video = main.locator('video').first()
    await expect(video).toBeVisible()
    await expect(video).toHaveAttribute('controls', '')
    await expect(video).toHaveAttribute('src', 'videos/EtterlevelseskravMedTeksting.mp4')
    await expect(video.locator('track')).toHaveAttribute('kind', 'captions')
  })

  for (const mobile of [false, true]) {
    test(`Som en bruker vil jeg navigere til alle avsnitt på ${mobile ? 'mobil' : 'stor skjerm'}`, async ({
      page,
    }) => {
      await page.setViewportSize(
        mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }
      )
      const main = page.getByRole('main')
      for (const [index, [title, url]] of sections.entries()) {
        if (mobile) {
          await main.getByRole('button', { name: 'Vis alle steg', exact: true }).click()
          await expect(
            main.getByRole('button', { name: 'Skjul alle steg', exact: true })
          ).toBeVisible()
        }
        const link = main.getByRole('link', { name: title, exact: true }).filter({ visible: true })
        await expect(link).toHaveAttribute('href', url)
        await link.click()
        await expect(page).toHaveURL(`${pageUrl}${url}`)
        await expect(main.getByRole('heading', { name: title, exact: true })).toBeInViewport()
        if (mobile) {
          await expect(main.getByText(`Steg ${index + 1} av 6`, { exact: true })).toBeVisible()
          await main.getByRole('button', { name: 'Skjul alle steg', exact: true }).click()
          await expect(
            main.getByRole('button', { name: 'Vis alle steg', exact: true })
          ).toBeVisible()
        } else {
          await expect(link).toHaveAttribute('aria-current', 'step')
        }
      }
    })
  }

  for (const [name, image] of [
    [
      'Vis meg hvordan kravene inndeles i temaer',
      'Skjermbilde som viser temainndeling og temaoversikt',
    ],
    ['Vis meg hvordan en kravside ser ut', 'Skjermbilde som viser en kravside'],
  ]) {
    test(`Som en bruker vil jeg vise og skjule «${name}»`, async ({ page }) => {
      const main = page.getByRole('main')
      const button = main.getByRole('button', { name, exact: true })
      await toggleExample(button)
      await button.click()
      await expect(main.getByRole('img', { name: image, exact: true })).toBeVisible()
    })
  }

  for (const item of accordionItems) {
    test(`Som en bruker vil jeg åpne «${item.title}», se eksemplene og lukke avsnittet`, async ({
      page,
    }) => {
      const main = page.getByRole('main')
      const accordion = main.locator(`[id="${item.id}"]`)
      const header = accordion.getByRole('button').filter({ hasText: item.title }).first()
      await expect(header).toHaveAttribute('aria-expanded', 'false')
      await expect(accordion.getByText(item.content, { exact: false })).toBeHidden()
      await header.getByRole('heading', { name: item.title, exact: true }).click()
      await expect(header).toHaveAttribute('aria-expanded', 'true')
      await expect(accordion.getByText(item.content, { exact: false })).toBeVisible()
      for (const name of item.examples) {
        await toggleExample(accordion.getByRole('button', { name, exact: true }))
      }
      await expect(accordion.locator('video')).toHaveCount(item.videos.length)
      for (const filename of item.videos) {
        const video = accordion.locator(`video[src="videos/${filename}"]`)
        await expect(video).toHaveAttribute('controls', '')
        await expect(video.locator('track')).toHaveAttribute('kind', 'captions')
      }
      await header.getByRole('heading', { name: item.title, exact: true }).click()
      await expect(header).toHaveAttribute('aria-expanded', 'false')
      await expect(accordion.getByText(item.content, { exact: false })).toBeHidden()
    })

    test(`Som en administrator vil jeg kopiere en direktelenke til «${item.title}» uten å åpne avsnittet`, async ({
      page,
    }) => {
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: {
            writeText: async (text: string) => {
              sessionStorage.setItem('copiedAccordionLink', text)
            },
          },
        })
      })
      const accordion = page.getByRole('main').locator(`[id="${item.id}"]`)
      const header = accordion.getByRole('button').filter({ hasText: item.title }).first()
      const copyButton = accordion.getByRole('button', { name: 'Kopier lenke', exact: true })
      await copyButton.click()
      await expect
        .poll(() => page.evaluate(() => sessionStorage.getItem('copiedAccordionLink')))
        .toBe(`${pageUrl}#${item.id}`)
      await expect(header).toHaveAttribute('aria-expanded', 'false')
      await page.goto(`${pageUrl}#${item.id}`)
      await expect(header).toHaveAttribute('aria-expanded', 'true')
      await expect(accordion.getByText(item.content, { exact: false })).toBeVisible()
      await expect(header).toBeInViewport()
    })
  }

  test('Som en bruker vil jeg kunne ha flere avsnitt åpne samtidig', async ({ page }) => {
    const first = page
      .getByRole('main')
      .locator(`[id="${accordionItems[0].id}"]`)
      .getByRole('button')
      .first()
    const second = page
      .getByRole('main')
      .locator(`[id="${accordionItems[1].id}"]`)
      .getByRole('button')
      .first()
    await first.getByRole('heading').click()
    await second.getByRole('heading').click()
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await expect(second).toHaveAttribute('aria-expanded', 'true')
    await second.getByRole('heading').click()
    await expect(first).toHaveAttribute('aria-expanded', 'true')
  })

  test('Som en bruker med lesetilgang vil jeg åpne veiledningen uten å se administratorens kopieringsknapper', async ({
    page,
  }) => {
    await mockRead(page)
    await page.reload()
    const main = page.getByRole('main')
    await expect(main.getByRole('button', { name: 'Kopier lenke', exact: true })).toHaveCount(0)
    for (const item of accordionItems) {
      const accordion = main.locator(`[id="${item.id}"]`)
      await accordion.getByRole('button', { name: item.title, exact: true }).click()
      await expect(accordion.getByText(item.content, { exact: false })).toBeVisible()
    }
  })

  for (const [accordionId, name, path] of [
    [behandlerPersonopplysningerId, 'Behandlingens livsløp', `${omPVKUrl}#behandlingens-livslop`],
    [
      behandlerPersonopplysningerId,
      'Behandlingens art og omfang',
      `${omPVKUrl}#behandlinges-art-og-omfang`,
    ],
    [
      faEtterlevelsenGodkjentId,
      'Beslutningsstøtte når man vurderer behov for PVK.',
      `${omPVKUrl}#beslutningsstotte`,
    ],
    [
      forRisikoeiereId,
      'vurdert behov for PVK, og dokumentert den beslutningen.',
      `${omPVKUrl}#beslutningsstotte`,
    ],
    [
      slikGjenbrukerDuId,
      'Redigere dokumentegenskaper og filtrere krav',
      redigereDokumentegenskaperUrl,
    ],
  ]) {
    test(`Som en bruker vil jeg åpne «${name}» i en ny fane`, async ({ page }) => {
      const accordion = page.getByRole('main').locator(`[id="${accordionId}"]`)
      await accordion.getByRole('heading', { level: 3 }).click()
      const link = accordion.getByRole('link', { name, exact: false })
      await expect(link).toHaveAttribute('href', path)
      await expect(link).toHaveAttribute('target', '_blank')
      const popupPromise = page.waitForEvent('popup')
      await link.click()
      const popup = await popupPromise
      await expect(popup).toHaveURL(new URL(path, pageUrl).href)
      if (path.startsWith('#')) {
        await expect(
          popup
            .getByRole('main')
            .locator(`[id="${path.slice(1)}"]`)
            .getByRole('button')
            .first()
        ).toHaveAttribute('aria-expanded', 'true')
      }
      await popup.close()
    })
  }

  for (const name of ['Jobbe i temaoversikt', 'Besvare etterlevelseskrav']) {
    test(`Som en bruker vil jeg gå tilbake til dokumentasjonsveiledningen via «${name}»`, async ({
      page,
    }) => {
      const accordion = page.getByRole('main').locator(`[id="${slikGjenbrukerDuId}"]`)
      await accordion.getByRole('heading', { level: 3 }).click()
      await accordion.getByRole('link', { name, exact: true }).click()
      await expect(page).toHaveURL(`${pageUrl}${hvordanDokumentereEtterlevelseUrl}`)
      await expect(
        page.getByRole('heading', { name: 'Hvordan dokumentere etterlevelse', exact: true })
      ).toBeInViewport()
    })
  }

  for (const [name, path, role] of [
    ['Forsiden', '/', 'link'],
    ['Tilbake til Oversikt over løsningene', oversiktOverLosningeneUrl, 'button'],
    ['Fortsett til Om Digital PVK', omPVKUrl, 'button'],
  ] as const) {
    test(`Som en bruker vil jeg navigere videre via «${name}»`, async ({ page }) => {
      await page.getByRole('main').getByRole(role, { name, exact: true }).click()
      await expect(page).toHaveURL(`${baseUrl}${path}`)
      await expect(page.getByRole('main')).toBeVisible()
    })
  }
})
