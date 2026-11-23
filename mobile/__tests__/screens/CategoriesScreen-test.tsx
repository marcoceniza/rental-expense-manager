import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { useApp } from '@/context/AppContext';
import type { Category } from '@/types';
import CategoriesScreen from '@/screens/CategoriesScreen';

jest.mock('@/context/AppContext', () => ({
  useApp: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Icon = () => ReactModule.createElement(View, null);
  return new Proxy(
    { __esModule: true },
    { get: (_target, prop) => (prop === '__esModule' ? true : Icon) },
  );
});

const mockUseApp = useApp as jest.MockedFunction<typeof useApp>;
const addCategory = jest.fn<Promise<void>, unknown[]>();
const updateCategory = jest.fn<Promise<void>, unknown[]>();
const deleteCategory = jest.fn<Promise<void>, unknown[]>();

const categories: Category[] = [
  { id: '1', name: 'Rent', type: 'EXPENSE', transactionsCount: 3 },
  { id: '2', name: 'Salary', type: 'INCOME', transactionsCount: 0 },
  { id: '3', name: 'Loan', type: 'LIABILITY' },
];

const setCategories = (value: Category[]) => {
  mockUseApp.mockReturnValue({
    categories: value,
    addCategory,
    updateCategory,
    deleteCategory,
  } as unknown as ReturnType<typeof useApp>);
};

beforeEach(() => {
  jest.clearAllMocks();
  addCategory.mockResolvedValue(undefined);
  updateCategory.mockResolvedValue(undefined);
  deleteCategory.mockResolvedValue(undefined);
  setCategories(categories);
});

describe('<CategoriesScreen />', () => {
  test('renders the header and categories from context', async () => {
    const screen = await render(<CategoriesScreen />);

    expect(screen.getByText('Categories')).toBeTruthy();
    expect(screen.getByText('Rent')).toBeTruthy();
    expect(screen.getByText('Salary')).toBeTruthy();
    expect(screen.getByText('Loan')).toBeTruthy();
    expect(screen.getByText('3 transaction(s)')).toBeTruthy();
    expect(screen.getByText('EXPENSE')).toBeTruthy();
  });

  test('filters categories by type', async () => {
    const screen = await render(<CategoriesScreen />);

    await fireEvent.press(screen.getByText('Income'));
    await waitFor(() => {
      expect(screen.getByText('Salary')).toBeTruthy();
      expect(screen.queryByText('Rent')).toBeNull();
      expect(screen.queryByText('Loan')).toBeNull();
    });
  });

  test('filters categories by search text', async () => {
    const screen = await render(<CategoriesScreen />);

    await fireEvent.changeText(screen.getByPlaceholderText('Search categories...'), 'loan');
    await waitFor(() => {
      expect(screen.getByText('Loan')).toBeTruthy();
      expect(screen.queryByText('Rent')).toBeNull();
    });
  });

  test('opens the create modal and saves a new category', async () => {
    const screen = await render(<CategoriesScreen />);

    await fireEvent.press(screen.getByLabelText('Add category'));
    await waitFor(() => expect(screen.getByText('Add Category')).toBeTruthy());

    await fireEvent.changeText(screen.getByPlaceholderText('Category name'), 'Groceries');
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Category name')).toHaveProperty('props.value', 'Groceries');
    });
    await fireEvent.press(screen.getByText('Save Category'));

    await waitFor(() => {
      expect(addCategory).toHaveBeenCalledWith({
        name: 'Groceries',
        type: 'expense',
        is_tuition: false,
        is_other: false,
      });
    });
    await waitFor(() => expect(screen.queryByText('Add Category')).toBeNull());
  });

  test('prefills the edit modal and updates an existing category', async () => {
    const screen = await render(<CategoriesScreen />);

    await fireEvent.press(screen.getByLabelText('Edit Salary'));
    await waitFor(() => expect(screen.getByText('Edit Category')).toBeTruthy());
    expect(screen.getByPlaceholderText('Category name')).toHaveProperty('props.value', 'Salary');

    await fireEvent.changeText(screen.getByPlaceholderText('Category name'), 'Salary Updated');
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Category name')).toHaveProperty('props.value', 'Salary Updated');
    });
    await fireEvent.press(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(updateCategory).toHaveBeenCalledWith('2', {
        name: 'Salary Updated',
        type: 'income',
        is_tuition: false,
        is_other: false,
      });
    });
  });

  test('alerts when saving without a name', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const screen = await render(<CategoriesScreen />);

    await fireEvent.press(screen.getByLabelText('Add category'));
    await waitFor(() => expect(screen.getByText('Add Category')).toBeTruthy());
    await fireEvent.press(screen.getByText('Save Category'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Category name required',
      'Enter a name for this category.',
    );
    expect(addCategory).not.toHaveBeenCalled();
  });

  test('shows an empty state when there are no categories', async () => {
    setCategories([]);
    const screen = await render(<CategoriesScreen />);

    expect(screen.getByText('No categories yet. Add a category to get started.')).toBeTruthy();
  });
});
