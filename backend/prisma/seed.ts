import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedCurrency {
  code: string;
  name: string;
  symbol: string;
  minorUnits: number;
  isDefault: boolean;
}

const currencies: SeedCurrency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', minorUnits: 2, isDefault: true },
  { code: 'USD', name: 'Dólar estadounidense', symbol: 'US$', minorUnits: 2, isDefault: false },
  { code: 'COP', name: 'Peso colombiano', symbol: '$', minorUnits: 0, isDefault: false },
  { code: 'MXN', name: 'Peso mexicano', symbol: '$', minorUnits: 2, isDefault: false },
  { code: 'ARS', name: 'Peso argentino', symbol: '$', minorUnits: 2, isDefault: false },
  { code: 'CLP', name: 'Peso chileno', symbol: '$', minorUnits: 0, isDefault: false },
  { code: 'PEN', name: 'Sol peruano', symbol: 'S/', minorUnits: 2, isDefault: false },
];

async function main(): Promise<void> {
  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {
        name: currency.name,
        symbol: currency.symbol,
        minorUnits: currency.minorUnits,
        isDefault: currency.isDefault,
      },
      create: currency,
    });
  }

  console.log(`✅ Monedas sembradas: ${currencies.length}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    return prisma.$disconnect();
  });
