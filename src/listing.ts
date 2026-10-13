import { rcompare, valid } from 'semver'
import type { PackageListing, PackageManifest } from './types/listing'

export const latestPackages = (listing: PackageListing): PackageManifest[] =>
  Object.values(listing.packages).flatMap(({ versions }) =>
    Object.values(versions)
      .filter((pkg) => valid(pkg.version))
      .sort((a, b) => rcompare(a.version, b.version))
      .slice(0, 1)
  )

export const packageType = (pkg: PackageManifest): string => {
  if (pkg.vpmDependencies?.['com.vrchat.avatars']) return 'Avatar'
  if (pkg.vpmDependencies?.['com.vrchat.worlds']) return 'World'
  return 'Any'
}

export const vccUrl = (url: string): string =>
  `vcc://vpm/addRepo?url=${encodeURIComponent(url)}`
