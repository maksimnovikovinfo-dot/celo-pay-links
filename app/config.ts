import { http, createConfig } from 'wagmi'
import { celo } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const celoSepolia = {
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://forno.celo-sepolia.celo-testnet.org'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://celo-sepolia.blockscout.com' },
  },
  testnet: true,
} as const

export const config = createConfig({
  chains: [celoSepolia, celo],
  connectors: [
    injected(),
  ],
  transports: {
    [celoSepolia.id]: http(),
    [celo.id]: http(),
  },
})

// 👇 AÑADE ESTA LÍNEA AL FINAL
export const CONTRACT_ADDRESS = '0xef63385A183991CDF0CF09353FD909834FA7be15';