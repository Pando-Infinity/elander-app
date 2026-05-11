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

export function urlFor(
  source: { asset: { _ref: string } },
  opts?: { w?: number; h?: number },
): string | undefined {
  const ref = source.asset._ref
  const match = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/)
  if (!match) return undefined
  const [, id, dimensions, format] = match
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  if (!projectId || !dataset) return undefined
  let url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`
  if (opts?.w || opts?.h) {
    const params = new URLSearchParams()
    if (opts.w) params.set('w', String(opts.w))
    if (opts.h) params.set('h', String(opts.h))
    params.set('fit', 'crop')
    params.set('auto', 'format')
    url += `?${params.toString()}`
  }
  return url
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
