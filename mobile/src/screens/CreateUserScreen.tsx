import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { UserPlus, CheckCircle, ShieldCheck } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/DisplayComponents';

export default function CreateUserScreen() {
  const { addUser, users } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return;
    if (password !== confirmPassword) {
      Alert.alert('Invalid password', 'Passwords do not match.');
      return;
    }

    addUser(name.trim(), email.trim());
    setSuccess(`User "${name}" created successfully.`);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');

    setTimeout(() => setSuccess(''), 4000);
  };

  const inputClassName = 'rounded-lg border border-slate-300 bg-white px-3 py-[9px] text-[13px] text-slate-900';

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1 bg-slate-50"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <View className="gap-3.5 px-4 pb-9 pt-4">
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <UserPlus size={20} color="#1e293b" />
            <Text className="text-xl font-extrabold text-slate-900">Create User</Text>
          </View>
          <Text className="text-xs text-slate-500">
            Create a standard user account. Authentication remains managed by Fortify.
          </Text>
        </View>

        {success.length > 0 && (
          <View className="flex-row items-center gap-2 rounded-[10px] border border-emerald-200 bg-emerald-50 p-3">
            <CheckCircle size={16} color="#059669" />
            <Text className="text-xs font-semibold text-emerald-800">{success}</Text>
          </View>
        )}

        <Card className="gap-3.5 p-[18px]">
          <View className="gap-1.5">
            <Text className="text-xs font-semibold text-slate-700">Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="#94a3b8"
              className={inputClassName}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-xs font-semibold text-slate-700">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              className={inputClassName}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-xs font-semibold text-slate-700">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              className={inputClassName}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-xs font-semibold text-slate-700">Confirm password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              className={inputClassName}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            className="mt-1.5 items-center rounded-lg bg-blue-700 py-[11px]"
          >
            <Text className="text-[13px] font-bold text-white">Create user</Text>
          </TouchableOpacity>
        </Card>

        <Card className="gap-3 p-4">
          <View className="flex-row items-center gap-1.5">
            <ShieldCheck size={16} color="#2563eb" />
            <Text className="text-[13px] font-bold text-slate-900">Active Accounts</Text>
          </View>

          <View className="gap-2.5">
            {users.map((user) => (
              <View
                key={user.id}
                className="flex-row items-center justify-between py-1.5"
              >
                <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-blue-100">
                  <Text className="text-xs font-extrabold text-blue-700">{user.name[0]}</Text>
                </View>
                <View className="ml-2.5 flex-1">
                  <Text className="text-xs font-bold text-slate-900">{user.name}</Text>
                  <Text className="text-[10px] text-slate-500">{user.email}</Text>
                </View>
                <Text className="rounded-md bg-slate-100 px-2 py-[3px] text-[10px] font-semibold text-slate-600">
                  {user.role}
                </Text>
              </View>
            ))}
          </View>
        </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
