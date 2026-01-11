# Vault App

This app demonstrates the capabilities provided by the Fangorn SDK.

## Prerequisites

- Install an EVM wallet compatible with base sepolia, e.g. the metamask browser extension.
- We recommend to use node version 22 (use nvm to install the specific version). The project fails to run with the latest version of node (v25).

## Setup

Copy .env.local and provide the pinata jwt fetched from https://app.pinata.cloud/developers/api-keys

``` sh
NEXT_PUBLIC_CHAIN_RPC_URL=https://base-sepolia-public.nodies.app
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
PINATA_JWT=
```

Install dependencies with NPM

``` sh
npm i
```

## Running the app
Run with `npm run dev`. This starts the the app on localhost:3000.
