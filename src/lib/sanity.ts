import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})

export const ACTIVE_CAMPAIGN_QUERY = `
  *[_type == "campaign" && status == "active"][0]{
    _id,
    "slug": slug.current,
    title,
    type,
    status,
    description,
    howItWorks,
    rewardDetails,
    startDate,
    endDate,
    winnerCount,
    banner
  }
`

export function urlFor(source: { asset: { _ref: string } }): string {
  const ref = source.asset._ref
  const match = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/)
  if (!match) return ''
  const [, id, dimensions, format] = match
  return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${id}-${dimensions}.${format}`
}

export const CAMPAIGN_BY_SLUG_QUERY = `
  *[_type == "campaign" && slug.current == $slug][0]{
    _id,
    "slug": slug.current,
    title,
    type,
    status,
    description,
    howItWorks,
    rewardDetails,
    startDate,
    endDate,
    winnerCount,
    banner
  }
`
