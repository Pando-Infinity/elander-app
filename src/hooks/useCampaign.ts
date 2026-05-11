import useSWR from 'swr'
import type { PortableTextBlock } from '@portabletext/react'
import { sanityClient, ACTIVE_CAMPAIGN_QUERY } from '@/lib/sanity'

export interface CampaignBanner {
  active: boolean
  headline?: string
  subtext?: string
  ctaLabel?: string
  ctaTarget?: 'campaign_page' | 'external_url'
  ctaUrl?: string
  image?: { asset: { _ref: string } }
  variant?: 'info' | 'warning' | 'promo'
}

export interface Campaign {
  _id: string
  slug: string
  title: string
  type: 'airdrop' | 'event' | 'contest'
  status: 'draft' | 'active' | 'ended'
  description?: PortableTextBlock[]
  howItWorks?: PortableTextBlock[]
  rewardDetails?: PortableTextBlock[]
  startDate: string
  endDate?: string
  winnerCount?: number
  banner?: CampaignBanner
}

export function useCampaign() {
  const { data, error, isLoading } = useSWR<Campaign | null>(
    'active-campaign',
    () => sanityClient.fetch(ACTIVE_CAMPAIGN_QUERY),
    { refreshInterval: 60_000 }
  )

  const isExpired = data?.endDate ? new Date(data.endDate) < new Date() : false

  return {
    campaign: data ?? null,
    isActive: !!data && data.status === 'active' && !isExpired,
    isLoading,
    error,
  }
}
