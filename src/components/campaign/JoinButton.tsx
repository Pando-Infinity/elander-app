"use client"

import { twMerge } from 'tailwind-merge'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAppStore } from '@/stores/app.store'
import { useCampaignTracking } from '@/hooks/useCampaignTracking'

interface Props {
  campaignSlug: string
  isActive: boolean
}

export function JoinButton({ campaignSlug, isActive }: Props) {
  const { connected } = useWallet()
  const { setIsOpenConnectWallet } = useAppStore()
  const { status } = useCampaignTracking(campaignSlug, isActive)

  if (!isActive) {
    return (
      <button
        disabled
        className={twMerge(
          'w-full sm:w-auto px-8 py-3 rounded font-semibold text-sm',
          'bg-surface-input text-text-muted opacity-60 cursor-not-allowed',
        )}
      >
        Campaign Ended
      </button>
    )
  }

  if (!connected) {
    return (
      <button
        type="button"
        onClick={() => setIsOpenConnectWallet(true)}
        className={twMerge(
          'w-full sm:w-auto px-8 py-3 rounded font-semibold text-sm',
          'bg-accent hover:bg-accent/80 text-white transition-colors',
        )}
      >
        Connect to Join
      </button>
    )
  }

  if (status === 'joined') {
    return (
      <button
        disabled
        className={twMerge(
          'w-full sm:w-auto px-8 py-3 rounded font-semibold text-sm',
          'bg-surface-input text-success cursor-not-allowed flex items-center justify-center gap-2',
        )}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Joined
      </button>
    )
  }

  if (status === 'error') {
    return (
      <button
        disabled
        className={twMerge(
          'w-full sm:w-auto px-8 py-3 rounded font-semibold text-sm',
          'bg-error/10 text-error cursor-not-allowed',
        )}
      >
        Join Failed — Retry Later
      </button>
    )
  }

  return (
    <button
      disabled
      className={twMerge(
        'w-full sm:w-auto px-8 py-3 rounded font-semibold text-sm',
        'bg-accent/60 text-white/70 cursor-not-allowed flex items-center justify-center gap-2',
      )}
    >
      <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="2" strokeDasharray="8 6" />
      </svg>
      Joining...
    </button>
  )
}
