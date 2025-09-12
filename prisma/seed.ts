import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Create countries with their currency info
  const countries = [
    {
      code: 'US',
      name: 'United States',
      currencyCode: 'USD',
      currencySymbol: '$',
    },
    {
      code: 'CN',
      name: 'China',
      currencyCode: 'CNY',
      currencySymbol: '¥',
    },
    {
      code: 'JP',
      name: 'Japan',
      currencyCode: 'JPY',
      currencySymbol: '¥',
    },
    {
      code: 'GB',
      name: 'United Kingdom',
      currencyCode: 'GBP',
      currencySymbol: '£',
    },
    {
      code: 'DE',
      name: 'Germany',
      currencyCode: 'EUR',
      currencySymbol: '€',
    },
    {
      code: 'AU',
      name: 'Australia',
      currencyCode: 'AUD',
      currencySymbol: 'A$',
    },
    {
      code: 'CA',
      name: 'Canada',
      currencyCode: 'CAD',
      currencySymbol: 'C$',
    },
    {
      code: 'IN',
      name: 'India',
      currencyCode: 'INR',
      currencySymbol: '₹',
    },
    {
      code: 'KR',
      name: 'South Korea',
      currencyCode: 'KRW',
      currencySymbol: '₩',
    },
    {
      code: 'BR',
      name: 'Brazil',
      currencyCode: 'BRL',
      currencySymbol: 'R$',
    },
  ]

  // Create countries
  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    })
  }

  // Create some sample apps for testing
  const sampleApps = [
    {
      bundleId: 'com.spotify.music',
      name: 'Spotify',
      category: 'Music',
      developer: 'Spotify AB',
      description: 'Music streaming service',
    },
    {
      bundleId: 'com.netflix.NetFlix',
      name: 'Netflix',
      category: 'Entertainment',
      developer: 'Netflix, Inc.',
      description: 'Video streaming service',
    },
    {
      bundleId: 'com.adobe.creativecloud',
      name: 'Adobe Creative Cloud',
      category: 'Productivity',
      developer: 'Adobe Inc.',
      description: 'Creative software suite',
    },
  ]

  for (const app of sampleApps) {
    await prisma.app.upsert({
      where: { bundleId: app.bundleId },
      update: {},
      create: app,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })