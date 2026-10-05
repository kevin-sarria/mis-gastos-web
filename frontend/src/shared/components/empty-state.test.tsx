import { render, screen } from '@testing-library/react';
import { Wallet } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('muestra el título y la descripción', () => {
    render(
      <EmptyState icon={Wallet} title="Sin gastos" description="Registra tu primer gasto" />,
    );

    expect(screen.getByText('Sin gastos')).toBeInTheDocument();
    expect(screen.getByText('Registra tu primer gasto')).toBeInTheDocument();
  });
});
