<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ListingUrl from './components/ListingUrl.vue'
import Modal from './components/Modal.vue'
import { latestPackages, packageType, vccUrl } from './listing'
import type { PackageListing, PackageManifest } from './types/listing'
import source from '../source.json'

const listingInfo: {
  name: string
  url: string
  description?: string
  bannerUrl?: string
  author: { name: string; email?: string; url?: string }
  infoLink?: { text?: string; url?: string }
} = source

const packages = ref<PackageManifest[]>([])
const loading = ref(true)
const error = ref('')
const selectedPackage = ref<PackageManifest | null>(null)
const showHelp = ref(false)
const addRepoUrl = vccUrl(listingInfo.url)

const bannerUrl = computed(() => {
  const url = listingInfo.bannerUrl
  if (!url) return ''
  return /^(https?:)?\/\//.test(url) ? url : `${import.meta.env.BASE_URL}${url.replace(/^\//, '')}`
})

const loadPackages = async (): Promise<void> => {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}index.json`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const listing: PackageListing = await response.json()
    packages.value = latestPackages(listing)
  } catch {
    error.value = 'Could not load the package listing. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.title = listingInfo.name
  void loadPackages()
})
</script>

<template>
  <main class="main">
    <header class="main__header">
      <img v-if="bannerUrl" :src="bannerUrl" alt="" class="main__banner" />
      <h1>{{ listingInfo.name }}</h1>
      <p v-if="listingInfo.description">{{ listingInfo.description }}</p>
      <p>
        Published by
        <a
          v-if="listingInfo.author.url"
          :href="listingInfo.author.url"
          :title="listingInfo.author.email"
          target="_blank"
          rel="noopener noreferrer"
          >{{ listingInfo.author.name }}</a
        >
        <span v-else>{{ listingInfo.author.name }}</span>
      </p>
      <a
        v-if="listingInfo.infoLink?.url"
        :href="listingInfo.infoLink.url"
        target="_blank"
        rel="noopener noreferrer"
        >{{ listingInfo.infoLink.text || 'Learn More' }}</a
      >
    </header>

    <ListingUrl :url="listingInfo.url">
      <a class="button button--accent" :href="addRepoUrl">Add to VCC</a>
      <button type="button" @click="showHelp = true">How to add</button>
    </ListingUrl>

    <p v-if="loading" role="status">Loading…</p>
    <div v-else-if="error" role="alert">
      <p>{{ error }}</p>
      <button type="button" @click="loadPackages">Try again</button>
    </div>
    <section v-else class="main__packages" aria-label="Packages">
      <p v-if="!packages.length" class="main__packages__empty">
        No packages have been published yet.
      </p>
      <article v-for="pkg in packages" :key="pkg.name" class="main__packages__row">
        <div class="main__packages__info">
          <h2>{{ pkg.displayName || pkg.name }}</h2>
          <p>{{ pkg.description }}</p>
          <p class="main__packages__id">{{ pkg.name }}</p>
        </div>
        <span class="badge">{{ packageType(pkg) }}</span>
        <div class="main__packages__actions">
          <a class="button button--accent" :href="addRepoUrl">Add to VCC</a>
          <button
            type="button"
            :aria-label="`Package info: ${pkg.displayName || pkg.name}`"
            @click="selectedPackage = pkg">
            Info
          </button>
          <a v-if="pkg.url" class="button" :href="pkg.url" target="_blank" rel="noopener noreferrer">
            Download zip
            </a>
        </div>
      </article>
    </section>

    <footer v-if="listingInfo.infoLink?.url">
      <a :href="listingInfo.infoLink.url" target="_blank" rel="noopener noreferrer">
        {{ listingInfo.infoLink.text || 'Learn More' }}
      </a>
    </footer>

    <Modal
      v-if="selectedPackage && !showHelp"
      :title="selectedPackage.displayName || selectedPackage.name"
      @close="selectedPackage = null"
    >
      <p class="package-detail__id">{{ selectedPackage.name }} · v{{ selectedPackage.version }}</p>
      <h3>Package Info</h3>
      <p>{{ selectedPackage.description || 'No description provided.' }}</p>
      <h3>Author</h3>
      <p>
        <a
          v-if="selectedPackage.author?.url"
          :href="selectedPackage.author.url"
          target="_blank"
          rel="noopener noreferrer">
          {{ selectedPackage.author.name || selectedPackage.author.url }}
        </a>
        <span v-else>{{ selectedPackage.author?.name || 'Not specified' }}</span>
      </p>
      <h3>Dependencies</h3>
      <ul v-if="Object.keys(selectedPackage.vpmDependencies || {}).length">
        <li v-for="(version, name) in selectedPackage.vpmDependencies" :key="name">
          {{ name }} @ {{ version }}
        </li>
      </ul>
      <p v-else>None</p>
      <template v-if="selectedPackage.keywords?.length">
        <h3>Keywords</h3>
        <div class="package-detail__keywords">
          <span v-for="keyword in selectedPackage.keywords" :key="keyword" class="badge">
            {{ keyword }}
            </span>
        </div>
      </template>
      <template v-if="selectedPackage.license || selectedPackage.licensesUrl">
        <h3>License</h3>
        <a
          v-if="selectedPackage.licensesUrl"
          :href="selectedPackage.licensesUrl"
          target="_blank"
          rel="noopener noreferrer">
          {{ selectedPackage.license || 'See License' }}
        </a>
        <p v-else>{{ selectedPackage.license }}</p>
      </template>
      <h3>Listing URL</h3>
      <ListingUrl :url="listingInfo.url">
        <button type="button" @click="showHelp = true">How to add</button>
      </ListingUrl>
    </Modal>

    <Modal v-if="showHelp" title="How to add this listing to your VCC" @close="showHelp = false">
      <p>In VRChat Creator Companion:</p>
      <ol>
        <li>Open Settings and select the Packages tab.</li>
        <li>Click Add Repository.</li>
        <li>Paste the listing URL below and click Add.</li>
        <li>Review the repository information and click I Understand.</li>
        <li>Open a project to see the packages from this listing.</li>
      </ol>
      <h3>Listing URL</h3>
      <ListingUrl :url="listingInfo.url" />
      <p>
        Read more about
        <a href="https://vcc.docs.vrchat.com" target="_blank" rel="noopener noreferrer">
          package listings in the VCC docs
        </a>.
      </p>
    </Modal>
  </main>
</template>

<style lang="scss">
@use './styles/global.scss';

.main {
  max-width: 1000px;
  padding: 40px 24px;
  margin: 0 auto;

  &__header {
    text-align: center;
    margin-bottom: 32px;
  }

  &__banner {
    width: 100%;
    aspect-ratio: 5 / 1;
    object-fit: cover;
    border-radius: 6px;
  }
  
  footer {
    text-align: center;
    margin-top: 24px;
  }

  &__packages {
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: 6px;
    margin-top: 32px;

    &__row {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 20px;
      & + & {
        border-top: 1px solid var(--border);
      }
    }

    &__info {
      flex: 1;
      min-width: 0;

      h2 {
        font-size: 1.1rem;
        margin: 0 0 6px;
      }

      p {
        margin: 6px 0;
      }
    }

    &__id {
      font-size: 0.875rem;
      color: var(--muted);
      overflow-wrap: anywhere;
    }

    &__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    &__empty {
      padding: 12px 20px;
    }
  }
}

.package-detail {
  &__id {
    color: var(--muted);
    overflow-wrap: anywhere;
  }

  &__keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 760px) {
  .main {
    padding: 24px 16px;

    &__packages {
      &__row {
        flex-wrap: wrap;
      }

      &__info {
        flex-basis: calc(100% - 90px);
      }

      &__actions {
        width: 100%;
      }
    }
  }
}
</style>
