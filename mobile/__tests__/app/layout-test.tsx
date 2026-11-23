import type { ReactNode } from 'react';

jest.mock('../../global.css', () => ({}));

jest.mock('expo-router', () => {
  // jest.mock factories must not reference nativewind's injected _ReactNativeCSSInterop,
  // so create host elements via require('react').createElement instead of React.createElement.
  return {
    Stack: (props: { screenOptions?: unknown }) =>
      require('react').createElement('ExpoStack', {
        testID: 'stack',
        screenOptions: JSON.stringify(props.screenOptions ?? null),
      }),
  };
});

jest.mock('@/context/AppContext', () => {
  // jest.mock factories must not reference nativewind's injected _ReactNativeCSSInterop,
  // so create host elements via require('react').createElement instead of React.createElement.
  return {
    AppProvider: ({ children }: { children: ReactNode }) =>
      require('react').createElement('AppProviderMock', { testID: 'app-provider' }, children),
  };
});

jest.mock('react-native-safe-area-context', () => {
  // jest.mock factories must not reference nativewind's injected _ReactNativeCSSInterop,
  // so create host elements via require('react').createElement instead of React.createElement.
  return {
    SafeAreaProvider: ({ children }: { children: ReactNode }) =>
      require('react').createElement('SafeAreaProviderMock', { testID: 'safe-area-provider' }, children),
    SafeAreaView: ({ children }: { children: ReactNode }) =>
      require('react').createElement('SafeAreaViewMock', null, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

import { render } from '@testing-library/react-native';
import RootLayout from '@/app/_layout';

describe('<RootLayout />', () => {
  test('renders an expo-router Stack with headers hidden', async () => {
    const { getByTestId } = await render(<RootLayout />);

    expect(getByTestId('stack')).toBeTruthy();
    expect(getByTestId('stack').props.screenOptions).toBe('{"headerShown":false}');
  });

  test('nests Stack inside AppProvider inside SafeAreaProvider', async () => {
    const { getByTestId } = await render(<RootLayout />);
    const stack = getByTestId('stack');

    expect(stack.parent?.type).toBe('AppProviderMock');
    expect(stack.parent?.parent?.type).toBe('SafeAreaProviderMock');
  });
});
