import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { sanityClient, CAMPAIGN_BY_SLUG_QUERY } from '@/lib/sanity'
import { Campaign } from '@/hooks/useCampaign'
import CampaignPageClient from '@/components/campaign/CampaignPageClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const campaign = await sanityClient.fetch<Campaign | null>(CAMPAIGN_BY_SLUG_QUERY, { slug })
  return { title: campaign?.title ?? 'Campaign' }
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const campaign = await sanityClient.fetch<Campaign | null>(CAMPAIGN_BY_SLUG_QUERY, { slug })
  if (!campaign) notFound()
  return <CampaignPageClient campaign={campaign} />
}
