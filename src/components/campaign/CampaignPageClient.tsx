"use client"

import type { PortableTextBlock } from '@portabletext/react'
import { PortableText } from '@portabletext/react'
import { Campaign } from '@/hooks/useCampaign'
import { JoinButton } from './JoinButton'

const PORTABLE_TEXT_COMPONENTS = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-sm text-white/70 leading-relaxed">{children}</p>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-base font-semibold text-white">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-sm font-semibold text-white">{children}</h3>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside space-y-1 text-sm text-white/70">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside space-y-1 text-sm text-white/70">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
  },
}

const TYPE_LABELS: Record<string, string> = {
  airdrop: 'Airdrop',
  event: 'Event',
  contest: 'Contest',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function RichSection({ title, blocks }: { title: string; blocks: unknown[] }) {
  if (!blocks?.length) return null
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">{title}</h2>
      <div className="flex flex-col gap-2">
        <PortableText
          value={blocks as PortableTextBlock[]}
          components={PORTABLE_TEXT_COMPONENTS}
        />
      </div>
    </section>
  )
}

interface Props {
  campaign: Campaign
}

export default function CampaignPageClient({ campaign }: Props) {
  const isExpired = campaign.endDate ? new Date(campaign.endDate) < new Date() : false
  const isActive = campaign.status === 'active' && !isExpired

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-8 px-4 sm:px-0">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-accent/20 text-accent">
            {TYPE_LABELS[campaign.type] ?? campaign.type}
          </span>
          {isActive ? (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-success/20 text-success">
              Active
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-surface-input text-text-muted">
              Ended
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white">{campaign.title}</h1>

        <div className="flex items-center gap-4 text-xs text-white/50 flex-wrap">
          <span>{formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}</span>
          {campaign.winnerCount && (
            <span>{campaign.winnerCount} winner{campaign.winnerCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-surface-divider" />

      <div className="flex flex-col gap-8">
        <RichSection title="About" blocks={campaign.description ?? []} />
        <RichSection title="How It Works" blocks={campaign.howItWorks ?? []} />
        <RichSection title="Reward Details" blocks={campaign.rewardDetails ?? []} />
      </div>

      <div className="pt-2">
        <JoinButton campaignSlug={campaign.slug} isActive={isActive} />
      </div>
    </div>
  )
}
