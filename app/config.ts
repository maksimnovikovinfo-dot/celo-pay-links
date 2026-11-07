import { http, createConfig } from 'wagmi'
import { celo as celoChain } from 'wagmi/chains' // Renombramos la importación
import { injected } from 'wagmi/connectors'

// Exportamos la red para que page.tsx pueda usarla
export const celo = celoChain;

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
