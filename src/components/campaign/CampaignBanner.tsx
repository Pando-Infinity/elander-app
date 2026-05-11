"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import { useCampaign } from '@/hooks/useCampaign'
import { urlFor } from '@/lib/sanity'

const VARIANT_STYLES = {
  info: {
    border: 'border-info/30',
    bg: 'bg-info/5',
    headline: 'text-info',
    cta: 'bg-info/20 hover:bg-info/30 text-info',
  },
  warning: {
    border: 'border-warning/30',
    bg: 'bg-warning/5',
    headline: 'text-warning',
    cta: 'bg-warning/20 hover:bg-warning/30 text-warning',
  },
  promo: {
    border: 'border-accent/30',
    bg: 'bg-accent/5',
    headline: 'text-accent',
    cta: 'bg-accent/20 hover:bg-accent/30 text-accent',
  },
} as const

export function CampaignBanner() {
  const { campaign, isActive } = useCampaign()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (campaign?.slug && sessionStorage.getItem(`dismissed-campaign-${campaign.slug}`)) {
      setDismissed(true)
    }
    setMounted(true)
  }, [campaign?.slug])

  if (!mounted) return null

  const banner = campaign?.banner
  if (!isActive || !banner?.active || dismissed) return null

  const styles = VARIANT_STYLES[banner.variant ?? 'promo']

  function handleCta() {
    if (!campaign) return
    if (banner?.ctaTarget === 'external_url' && banner?.ctaUrl) {
      window.open(banner.ctaUrl, '_blank', 'noopener,noreferrer')
    } else {
      router.push(`/campaign/${campaign.slug}`)
    }
  }

  function handleDismiss() {
    if (!campaign?.slug) return
    sessionStorage.setItem(`dismissed-campaign-${campaign.slug}`, '1')
    setDismissed(true)
  }

  const imgSrc = banner.image ? urlFor(banner.image, { w: 48, h: 48 }) : undefined

  return (
    <div
      role="alert"
      className={twMerge(
        'w-full flex items-center gap-3 px-4 py-2.5',
        'border-b border-surface-divider',
        styles.border,
        styles.bg,
      )}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt=""
          aria-hidden="true"
          className="h-6 w-6 shrink-0 rounded object-cover"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
        {banner.headline && (
          <span className={twMerge('text-xs font-semibold truncate', styles.headline)}>
            {banner.headline}
          </span>
        )}
        {banner.subtext && (
          <span className="truncate text-xs font-medium text-white/60">
            {banner.subtext}
          </span>
        )}
      </div>

      {banner.ctaLabel && (
        <button
          type="button"
          onClick={handleCta}
          className={twMerge(
            'shrink-0 rounded px-3 py-1 text-xs font-semibold transition-colors',
            styles.cta,
          )}
        >
          {banner.ctaLabel}
        </button>
      )}

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss campaign banner"
        className="ml-1 shrink-0 text-white/40 transition-colors hover:text-white/70"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
