import { http, createConfig } from 'wagmi'
import { celo } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [celo],
  connectors: [
    injected(),
  ],
  transports: {
    [celo.id]: http(),
  },
})

export const CONTRACT_ADDRESS = '0x2dF7332F65744Ef64204Ede636255269f22005f8'; 
