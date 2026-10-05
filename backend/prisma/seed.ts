import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import type { CategoryType } from '@prisma/client';

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

const defaultCategories: { type: CategoryType; name: string }[] = [
  { type: 'INCOME', name: 'Sueldo fijo' },
  { type: 'INCOME', name: 'Sueldo variable' },
  { type: 'INCOME', name: 'Otros ingresos' },
  { type: 'EXPENSE', name: 'Vivienda' },
  { type: 'EXPENSE', name: 'Alimentación' },
  { type: 'EXPENSE', name: 'Transporte' },
  { type: 'EXPENSE', name: 'Salud' },
  { type: 'EXPENSE', name: 'Ocio' },
  { type: 'EXPENSE', name: 'Educación' },
  { type: 'EXPENSE', name: 'Servicios' },
  { type: 'EXPENSE', name: 'Ropa' },
  { type: 'EXPENSE', name: 'Otros gastos' },
];

async function seedCurrencies(): Promise<void> {
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

async function seedDefaultCategories(): Promise<void> {
  let created = 0;
  for (const category of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, type: category.type, name: category.name },
    });
    if (!existing) {
      await prisma.category.create({ data: { ...category, isDefault: true } });
      created += 1;
    }
  }
  console.log(`✅ Categorías por defecto creadas: ${created}`);
}

async function seedSuperAdmin(): Promise<void> {
  const email = process.env.SUPER_ADMIN_EMAIL ?? 'admin@misgastos.app';
  const password = process.env.SUPER_ADMIN_PASSWORD ?? 'admin-misgastos-2024';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('ℹ️ Super admin ya existe, se omite');
    return;
  }

  const defaultCurrency = await prisma.currency.findFirst({ where: { isDefault: true } });
  const passwordHash = await hash(password);

  await prisma.user.create({
    data: {
      email,
      name: 'Administrador',
      passwordHash,
      role: 'SUPER_ADMIN',
      currencyCode: defaultCurrency?.code ?? 'EUR',
    },
  });

  console.log(`✅ Super admin creado: ${email}`);
}

async function main(): Promise<void> {
  await seedCurrencies();
  await seedDefaultCategories();
  await seedSuperAdmin();
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    return prisma.$disconnect();
  });
