# Frontend for Etterlevelse

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Requires Node 20.19+

### Install deps

`yarn install`

If you use `nvm`:

`nvm use`

### Login with Google Cloud with @nav.no user

Do this in Google Chrome as it doesn't work in Firefox on Mac

`gcloud auth login`

Remember to flush sockets when you can't login

`chrome://net-internals/#sockets`

### Run local, with port forward to dev-gcp

`kubectl port-forward deployment/etterlevelse-backend` eller `kpfe`

`yarn run dev`

## Other

### To use Yarn you need to

1. `brew install yarn`
2. `brew install node`

## Common errors

###

#### Kubernetes error

```
frontend git:(master) ✗ kubectl port-forward deployment/etterlevelse-backend
error: TYPE/NAME and list of ports are required for port-forward
See 'kubectl port-forward -h' for help and examples
```

1. You need to add config (see below) in `.zshrc`.
2. Run `gcloud auth login`
3. Run `kpfe`
4. Then run in separate window `yarn run start`
5. Go to `http://localhost:3000/`
6. Done!

##### `.bashrc` or `.zshrc` config

```
# etterlevelse-back end proxy connection
kpfe() {
  while true; do
          kubectl port-forward deployment/etterlevelse-backend 8080 --namespace teamdatajegerne;
  done
}

# behandlingskatalog-backend proxy connection
kpfb() {
  while true; do
          kubectl port-forward deployment/behandlingskatalog-backend 8080 --namespace teamdatajegerne;
  done
}

# logge inn i gcloud for å ha tilgang til gcp clusters
alias gli="gcloud auth login"

```

---

## Getting Started

First, run the development server:

(We use `yarn`)

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Playwright e2e

This app has a gated e2e-only route used for local Playwright regression tests.

- The e2e route is only enabled when `ENABLE_E2E_PAGES=true`
- It is blocked in production
- Playwright sets the required env vars automatically via [playwright.config.ts](playwright.config.ts)

Run all Playwright tests with:

```bash
yarn run e2e --workers=1
```

To run only the gjenbruk regression spec:

```bash
yarn run e2e playwright/tests/tillat-gjenbruk-modal.spec.ts --workers=1
```

`lint-staged` also runs Playwright only for relevant staged files:

- staged files in `playwright/tests` run the matching staged spec files
- staged edits in the gjenbruk/e2e-related app code trigger the gjenbruk regression spec
- unrelated staged files skip Playwright

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
