import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import { Badge, Card, EmptyState, StatCard } from '@/components/DisplayComponents';

describe('<Card />', () => {
  test('renders its children', async () => {
    const { getByText } = await render(
      <Card>
        <Text>Income summary</Text>
      </Card>,
    );

    expect(getByText('Income summary')).toBeTruthy();
  });

  test('merges the default styling with a custom className', async () => {
    const { toJSON } = await render(
      <Card className="shadow-lg">
        <Text>Content</Text>
      </Card>,
    );
    const tree = JSON.stringify(toJSON());

    expect(tree).toContain('rounded-2xl');
    expect(tree).toContain('border-slate-200');
    expect(tree).toContain('shadow-lg');
  });
});

describe('<EmptyState />', () => {
  test('renders the supplied message', async () => {
    const { getByText } = await render(<EmptyState message="No transactions yet" />);

    expect(getByText('No transactions yet')).toBeTruthy();
  });

  test('uses dashed-border, centered styling', async () => {
    const { toJSON } = await render(<EmptyState message="Nothing here" />);
    const tree = JSON.stringify(toJSON());

    expect(tree).toContain('border-dashed');
    expect(tree).toContain('text-center');
  });
});

describe('<Badge />', () => {
  const variants = [
    ['DEFAULT', 'bg-slate-100', 'text-slate-600'],
    ['INCOME', 'bg-blue-50', 'text-blue-600'],
    ['EXPENSE', 'bg-red-50', 'text-red-600'],
    ['LIABILITY', 'bg-amber-50', 'text-amber-600'],
    ['SUCCESS', 'bg-emerald-50', 'text-emerald-600'],
  ] as const;

  test.each(variants)('applies the %s variant classes', async (type, containerClass, labelClass) => {
    const { getByText, toJSON } = await render(<Badge label={`Badge ${type}`} type={type} />);
    const tree = JSON.stringify(toJSON());

    expect(getByText(`Badge ${type}`)).toBeTruthy();
    expect(tree).toContain(containerClass);
    expect(tree).toContain(labelClass);
  });

  test('defaults to the DEFAULT variant', async () => {
    const { getByText, toJSON } = await render(<Badge label="Neutral" />);

    expect(getByText('Neutral')).toBeTruthy();
    expect(JSON.stringify(toJSON())).toContain('bg-slate-100');
  });

  test('forwards numberOfLines, ellipsizeMode and style to the label', async () => {
    const { getByText, toJSON } = await render(
      <Badge
        label="A very long label"
        numberOfLines={1}
        ellipsizeMode="middle"
        style={{ marginTop: 6 }}
      />,
    );
    const label = getByText('A very long label');

    expect(label.props.numberOfLines).toBe(1);
    expect(label.props.ellipsizeMode).toBe('middle');
    expect(JSON.stringify(toJSON())).toContain('"marginTop":6');
  });
});

describe('<StatCard />', () => {
  test('renders the title, amount and icon', async () => {
    const { getByText } = await render(
      <StatCard title="Total income" amount="₱1,000.00" icon={<Text>icon-node</Text>} />,
    );

    expect(getByText('Total income')).toBeTruthy();
    expect(getByText('₱1,000.00')).toBeTruthy();
    expect(getByText('icon-node')).toBeTruthy();
  });

  test('uses the default icon background', async () => {
    const { toJSON } = await render(
      <StatCard title="Income" amount="₱1" icon={<Text>i</Text>} />,
    );

    expect(JSON.stringify(toJSON())).toContain('#eff6ff');
  });

  test('applies a custom iconBg and className', async () => {
    const { toJSON } = await render(
      <StatCard
        title="Expense"
        amount="₱2"
        icon={<Text>i</Text>}
        iconBg="#ff0000"
        className="mt-4"
      />,
    );
    const tree = JSON.stringify(toJSON());

    expect(tree).toContain('#ff0000');
    expect(tree).toContain('mt-4');
  });
});
