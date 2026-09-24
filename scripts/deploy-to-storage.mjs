// T-01: uploads the built site (dist/) to an Azure Storage static website ($web container).
// Used by the Azure Pipeline on main. Needs the secret AZURE_STORAGE_CONNECTION_STRING.
//
// Usage:  node scripts/deploy-to-storage.mjs [folder] [--dry-run]
//   --dry-run  only lists what would be uploaded (no connection string needed)

import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { BlobServiceClient } from '@azure/storage-blob'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const sourceDir = path.resolve(args.find((arg) => !arg.startsWith('--')) ?? 'dist')

// Browsers need the right Content-Type, otherwise e.g. JavaScript files are not executed
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
}

// index.html must always be re-checked so users get the newest version;
// files in assets/ have a content hash in their name, so they can be cached for a long time
function cacheControlFor(blobName) {
  return blobName.startsWith('assets/') ? 'public, max-age=31536000, immutable' : 'no-cache'
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true })
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
}

const files = await listFiles(sourceDir)
if (files.length === 0) throw new Error(`No files found in ${sourceDir}. Did the build run?`)

// 'C:\\...\\dist\\assets\\index.js' -> 'assets/index.js'
const uploads = files.map((file) => {
  const blobName = path.relative(sourceDir, file).split(path.sep).join('/')
  const contentType = CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream'
  return { file, blobName, contentType, cacheControl: cacheControlFor(blobName) }
})

if (dryRun) {
  console.log(`Dry run: would upload ${uploads.length} files from ${sourceDir}`)
  for (const u of uploads) console.log(`  ${u.blobName}  (${u.contentType}; ${u.cacheControl})`)
  process.exit(0)
}

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
if (!connectionString) throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set.')

const container = BlobServiceClient.fromConnectionString(connectionString).getContainerClient('$web')

for (const u of uploads) {
  await container.getBlockBlobClient(u.blobName).uploadFile(u.file, {
    blobHTTPHeaders: { blobContentType: u.contentType, blobCacheControl: u.cacheControl },
  })
  console.log(`Uploaded ${u.blobName}`)
}

// Remove files from earlier deployments that are no longer part of the build (old hashed assets)
const current = new Set(uploads.map((u) => u.blobName))
for await (const blob of container.listBlobsFlat()) {
  if (!current.has(blob.name)) {
    await container.deleteBlob(blob.name)
    console.log(`Deleted old ${blob.name}`)
  }
}

console.log(`Deployed ${uploads.length} files to the static website.`)
