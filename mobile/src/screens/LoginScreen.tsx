import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { isAxiosError } from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, isAuthenticated, isAuthLoading, authError } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/');
    } catch (error: unknown) {
      const responseData = isAxiosError<{
        message?: string;
        errors?: Record<string, string | string[]>;
      }>(error)
        ? error.response?.data
        : undefined;
      const validationMessage = responseData?.errors
        ? Object.values(responseData.errors).flat().join(' ')
        : undefined;
      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : undefined;
      const message =
        responseData?.message ??
        validationMessage ??
        errorMessage ??
        'Unable to sign in. Please try again.';
      Alert.alert('Sign in failed', message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  if (isAuthenticated) return <Redirect href="/" />;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0c1427]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: keyboardVisible ? 'flex-start' : 'center',
          paddingHorizontal: 24,
          paddingTop: keyboardVisible ? Math.max(100, insets.top + 16) : insets.top + 24,
          paddingBottom: keyboardVisible ? 16 : insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <View className="rounded-2xl bg-white p-7">
        <View className="mb-4 h-14 w-14 self-center items-center justify-center rounded-full border-2 border-blue-700">
          <Text className="text-lg font-extrabold text-blue-700">RM</Text>
        </View>
        <Text className="mb-1 text-center text-xl font-extrabold text-slate-950">
          Rental Expense Manager
        </Text>
        <Text className="mb-7 text-center text-sm text-slate-500">
          Sign in to continue
        </Text>

        {authError ? (
          <Text className="mb-4 text-center text-xs text-red-700">{authError}</Text>
        ) : null}

        <View className="mb-3 flex-row items-center overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
          <View className="justify-center pl-3 pr-2">
            <Mail size={18} color="#64748b" />
          </View>
          <TextInput
            className="flex-1 py-3 text-[18px] text-slate-950"
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View className="mb-3 flex-row items-center overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
          <View className="justify-center pl-3 pr-2">
            <Lock size={18} color="#64748b" />
          </View>
          <View className="flex-1 flex-row items-center">
            <TextInput
              className="flex-1 py-3 text-[18px] text-slate-950"
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword((show) => !show)}
              className="p-3"
            >
              {showPassword ? (
                <EyeOff size={18} color="#64748b" />
              ) : (
                <Eye size={18} color="#64748b" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className={`mt-2 items-center rounded-[10px] bg-blue-700 py-3.5 ${loading ? 'opacity-60' : ''}`}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-bold text-white">Sign In</Text>
          )}
        </TouchableOpacity>

        <Text className="mt-5 text-center text-xs text-slate-400">
          Use your Rental Expense Manager account.
        </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
