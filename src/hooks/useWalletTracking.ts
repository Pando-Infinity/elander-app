import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from '@/lib/supabase'

export function useWalletTracking() {
  const { publicKey, connected } = useWallet()

  useEffect(() => {
    if (!connected || !publicKey) return

    supabase
      .rpc('upsert_wallet', { p_wallet_address: publicKey.toString() })
      .then(({ error }) => {
        if (error) console.error('Wallet tracking error:', error)
      })
  }, [connected, publicKey?.toString()])
}
