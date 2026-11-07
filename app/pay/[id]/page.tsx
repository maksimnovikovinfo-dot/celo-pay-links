"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { celo, CONTRACT_ADDRESS } from '../../config';
import { useSearchParams } from 'next/navigation';

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

function PayPageContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');
  const to = searchParams.get('to');
  
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, isPending } = useWriteContract();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [isPaid, setIsPaid] = useState(false);
  const [isMiniPay, setIsMiniPay] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum?.isMiniPay) {
      setIsMiniPay(true);
      if (!isConnected) {
        connect({ connector: connectors[0] });
      }
    }
  }, [isConnected, connect, connectors]);

  useEffect(() => {
    if (isConnected && chainId !== celo.id) {
      switchChain({ chainId: celo.id });
    }
  }, [isConnected, chainId, switchChain]);

  const handlePay = async () => {
    if (!amount || !to) return;
    
    if (chainId !== celo.id) {
      try { switchChain({ chainId: celo.id }); return; } 
      catch (error) { alert("Cambia a Celo Mainnet en tu billetera."); return; }
    }

    try {
      await writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: contractAbi,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS as `0x${string}`, parseUnits(amount, 6)],
      });
      
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractAbi,
        functionName: 'payTo',
        args: [to as `0x${string}`, parseUnits(amount, 6), 'link_id_from_url'],
      });
      
      setIsPaid(true);
      alert(`¡Pago exitoso!\n\nHas enviado ${amount} USDC a ${to?.slice(0, 6)}...`);
    } catch (error) {
      console.error(error);
      alert("Error al procesar el pago.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="text-center w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-2 text-green-400">CeloPay Checkout</h1>
        <p className="text-gray-400 mb-8">Pago seguro en la red Celo</p>

        <div className="bg-gray-900 p-4 rounded-lg mb-8">
          <p className="text-sm text-gray-400 mb-1">Total a pagar</p>
          <p className="text-4xl font-bold text-white">{amount} <span className="text-lg text-green-400">USDC</span></p>
        </div>

        {isPaid ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-xl text-green-400 font-bold">¡Pago Completado!</p>
          </div>
        ) : isConnected ? (
          <div className="flex flex-col gap-4">
            {!isMiniPay && (
              <p className="text-green-300 font-mono bg-gray-700 p-2 rounded text-sm">
                Pagando desde: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            )}
            <button
              onClick={handlePay}
              disabled={isPending}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg w-full disabled:bg-gray-500"
            >
              {isPending ? 'Procesando...' : `Pagar ${amount} USDC`}
            </button>
            {!isMiniPay && (
              <button
                onClick={() => disconnect()}
                className="text-gray-400 text-sm hover:text-white"
              >
                Desconectar
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors w-full text-lg"
          >
            Conectar Billetera para Pagar
          </button>
        )}
      </div>
    </main>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">Cargando...</div>}>
      <PayPageContent />
    </Suspense>
  );
}
