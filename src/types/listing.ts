export interface PackageManifest {
  name: string
  version: string
  displayName?: string
  description?: string
  url?: string
  author?: { name?: string; email?: string; url?: string }
  vpmDependencies?: Record<string, string>
  keywords?: string[]
  license?: string
  licensesUrl?: string
}

export interface PackageListing {
  packages: Record<string, { versions: Record<string, PackageManifest> }>
}
