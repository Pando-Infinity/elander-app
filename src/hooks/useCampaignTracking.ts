import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from '@/lib/supabase'

type ParticipationStatus = 'idle' | 'loading' | 'joined' | 'error'

export function useCampaignTracking(campaignSlug: string | null, isActive: boolean) {
  const { publicKey, connected } = useWallet()
  const [status, setStatus] = useState<ParticipationStatus>('idle')

  useEffect(() => {
    if (!connected || !publicKey || !campaignSlug || !isActive) {
      setStatus('idle')
      return
    }

    let cancelled = false
    setStatus('loading')

    supabase
      .rpc('upsert_campaign_wallet', {
        p_campaign_slug: campaignSlug,
        p_wallet_address: publicKey.toString(),
      })
      .then(({ error }) => {
        if (cancelled) return
        if (error) {
          console.error('Campaign tracking error:', error)
          setStatus('error')
        } else {
          setStatus('joined')
        }
      })

    return () => { cancelled = true }
  }, [connected, publicKey?.toString(), campaignSlug, isActive])

  return { status }
}
