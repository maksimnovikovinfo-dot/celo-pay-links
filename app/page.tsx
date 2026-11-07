"use client";

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { celo, CONTRACT_ADDRESS } from './config';

const USDC_ADDRESS = '0xcebA9300f2b948710d2653dD7B07f33A8B32118C';

const contractAbi = [
  {
    "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "receiver", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "linkId", "type": "string" }
    ],
    "name": "payTo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, isPending } = useWriteContract();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isMiniPay, setIsMiniPay] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum?.isMiniPay) {
      setIsMiniPay(true);
      if (!isConnected) {
        connect({ connector: connectors[0] });
      }
    }
  }, [isConnected, connect, connectors]);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !address) return;

    if (chainId !== celo.id) {
      try { switchChain({ chainId: celo.id }); return; } 
      catch (error) { alert("Cambia a Celo Mainnet en tu billetera."); return; }
    }

    try {
      const linkId = Math.random().toString(36).substring(7);
      
      await writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: contractAbi,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS as `0x${string}`, parseUnits(amount, 6)],
      });

      const link = `${window.location.origin}/pay/${linkId}?amount=${amount}&to=${address}`;
      setGeneratedLink(link);
      alert(`¡Enlace generado!\n\nEl enlace es: ${link}`);
      
      setAmount('');
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("Error al preparar la transacción.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900 text-white">
      <div className="text-center w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2 text-green-400">CeloPay Links</h1>
        <p className="text-lg mb-6 text-gray-400">Crea enlaces de pago en USDC en la red Celo.</p>

        {isConnected ? (
          <div className="flex flex-col items-center gap-4 w-full">
            {!isMiniPay && (
              <>
                <p className="text-green-300 font-mono bg-gray-800 p-2 rounded text-sm">
                  Conectado: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </>
            )}

            {!showForm && !generatedLink ? (
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full"
              >
                Crear nuevo enlace de pago
              </button>
            ) : showForm ? (
              <form onSubmit={handleCreateLink} className="flex flex-col gap-3 w-full bg-gray-800 p-4 rounded-lg">
                <label className="text-left text-sm text-gray-300">¿Cuánto quieres cobrar? (USDC)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ej: 10"
                  className="p-2 rounded text-black"
                  required
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500"
                >
                  {isPending ? 'Firmando...' : 'Generar Enlace'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 text-sm hover:text-white"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-3 w-full bg-gray-800 p-4 rounded-lg">
                <p className="text-green-300 font-bold text-lg">¡Enlace de pago generado!</p>
                <p className="text-sm text-gray-300 break-all bg-black p-2 rounded">{generatedLink}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink || '');
                    alert("¡Enlace copiado!");
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Copiar Enlace
                </button>
                <button
                  onClick={() => setGeneratedLink(null)}
                  className="text-gray-400 text-sm hover:text-white mt-2"
                >
                  Crear otro enlace
                </button>
              </div>
            )}

            {!isMiniPay && (
              <button
                onClick={() => disconnect()}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4 w-full"
              >
                Desconectar
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full"
          >
            Conectar Billetera
          </button>
        )}
      </div>
    </main>
  );
}
