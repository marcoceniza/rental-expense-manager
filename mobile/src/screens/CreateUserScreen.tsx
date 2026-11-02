import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { UserPlus, CheckCircle, ShieldCheck } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { RNCard } from '../components/NativeComponents';

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

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <UserPlus size={20} color="#1e293b" />
          <Text style={styles.titleText}>Create User</Text>
        </View>
        <Text style={styles.subtitleText}>
          Create a standard user account. Authentication remains managed by Fortify.
        </Text>
      </View>

      {success.length > 0 && (
        <View style={styles.successBanner}>
          <CheckCircle size={16} color="#059669" />
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      {/* Form Card */}
      <RNCard style={styles.formCard}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        </View>

        <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Create user</Text>
        </TouchableOpacity>
      </RNCard>

      {/* Current Users */}
      <RNCard style={styles.usersCard}>
        <View style={styles.usersHeader}>
          <ShieldCheck size={16} color="#2563eb" />
          <Text style={styles.usersTitle}>Active Accounts</Text>
        </View>

        <View style={styles.usersList}>
          {users.map((usr) => (
            <View key={usr.id} style={styles.userRow}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{usr.name[0]}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{usr.name}</Text>
                <Text style={styles.userEmail}>{usr.email}</Text>
              </View>
              <Text style={styles.roleBadge}>{usr.role}</Text>
            </View>
          ))}
        </View>
      </RNCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    gap: 14,
    paddingBottom: 36,
  },
  header: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748b',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    padding: 12,
    borderRadius: 10,
  },
  successText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '600',
  },
  formCard: {
    padding: 18,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  submitBtn: {
    backgroundColor: '#1a56db',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  usersCard: {
    padding: 16,
    gap: 12,
  },
  usersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  usersTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  usersList: {
    gap: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 10,
    color: '#64748b',
  },
  roleBadge: {
    fontSize: 10,
    color: '#475569',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: '600',
  },
});
