import { mkdir, readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const listingFile = new URL('public/index.json', root)
const refresh = process.argv.includes('--refresh')

try {
  validateListing(await readFile(listingFile, 'utf8'), 'Invalid listing')
  if (!refresh) process.exit(0)
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

if (process.env.CI && !refresh) {
  throw new Error('Missing public/index.json. Generate the VPM listing before building in CI.')
}

const source = JSON.parse(await readFile(new URL('source.json', root), 'utf8'))

console.log(`Downloading package data from ${source.url}`)

const response = await fetch(source.url, { signal: AbortSignal.timeout(30000) })

if (!response.ok) {
  throw new Error(`Listing download failed: HTTP ${response.status}`)
}

const json = await response.text()
validateListing(json, 'Invalid listing response')
await mkdir(new URL('public/', root), { recursive: true })
await writeFile(listingFile, json)

console.log('Saved public/index.json')

function validateListing(json, message) {
  const listing = JSON.parse(json)
  
  if (!listing.packages || typeof listing.packages !== 'object') {
    throw new Error(message)
  }
}
