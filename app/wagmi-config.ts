import { cookieStorage, createConfig, createStorage } from 'wagmi';
import { Chain, http } from 'viem'
import { injected } from 'wagmi/connectors';

const viemChainConfig: Readonly<Chain> = Object.freeze({
  id: 175188,
  name: "Chronicle Yellowstone",
  nativeCurrency: {
    name: "Chronicle Yellowstone",
    symbol: "tstLPX",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://yellowstone-rpc.litprotocol.com/"],
    },
    public: {
      http: ["https://yellowstone-rpc.litprotocol.com/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Yellowstone Explorer",
      url: "https://yellowstone-explorer.litprotocol.com/",
    },
  },
});


export function getConfig() {
  return createConfig({
    chains: [viemChainConfig],
    connectors: [injected()],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [viemChainConfig.id]: http(),
    },
  });
}
