# Frontend for Etterlevelse

### Requires node 17

### Install deps

`yarn install`

### Login with Google Cloud with @nav.no user

Do this in Google Chrome as it doesn't work in Firefox

`gcloud auth login`

Remember to flush sockets you can't login

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

#### Kubenetics error

```
frontend git:(master) ✗ kubectl port-forward deployment/etterlevelse-backend
error: TYPE/NAME and list of ports are required for port-forward
See 'kubectl port-forward -h' for help and examples
```

You need to...
