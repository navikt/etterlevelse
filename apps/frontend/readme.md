# Frontend for Etterlevelse

### Requires node 17

### Install deps

`yarn install`

### Login with Google Cloud with @nav.no user

Do this in Google Chrome as it doesn't work in Firefox on Mac

`gcloud auth login`

Remember to flush sockets when you can't login

`chrome://net-internals/#sockets`

### Run local, with port forward to dev-gcp

`kubectl port-forward deployment/etterlevelse-backend`

`yarn run start`

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
