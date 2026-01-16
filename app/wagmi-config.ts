import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export function getConfig() {
  return createConfig({
    chains: [baseSepolia],
    connectors: [injected()],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage
    }),
    transports: {
      [baseSepolia.id]: http(),
    },
  })
}
