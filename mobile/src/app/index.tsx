import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import ManagerLayout from '@/components/ManagerLayout';
import { useApp } from '@/context/AppContext';

export default function HomeScreen() {
  const { isAuthenticated, isAuthLoading } = useApp();

  if (isAuthLoading) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-slate-950">
        <ActivityIndicator color="#ffffff" />
        <Text className="text-sm text-slate-300">Checking your session...</Text>
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/login" />;

  return <ManagerLayout />;
}
