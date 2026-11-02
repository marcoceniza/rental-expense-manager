import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export function RNCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function RNBadge({
  label,
  type = 'DEFAULT',
  style,
  textStyle,
}: {
  label: string;
  type?: 'INCOME' | 'EXPENSE' | 'LIABILITY' | 'DEFAULT' | 'SUCCESS';
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  let bg = '#f1f5f9';
  let color = '#475569';
  let border = '#e2e8f0';

  if (type === 'INCOME') {
    bg = '#eff6ff';
    color = '#2563eb';
    border = '#bfdbfe';
  } else if (type === 'EXPENSE') {
    bg = '#fef2f2';
    color = '#dc2626';
    border = '#fecaca';
  } else if (type === 'LIABILITY') {
    bg = '#fffbeb';
    color = '#d97706';
    border = '#fde68a';
  } else if (type === 'SUCCESS') {
    bg = '#ecfdf5';
    color = '#059669';
    border = '#a7f3d0';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[styles.badgeText, { color }, textStyle]}>{label}</Text>
    </View>
  );
}

export function RNButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  style,
  textStyle,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  let bg = '#1a56db';
  let txtColor = '#ffffff';
  let border = 'transparent';

  if (variant === 'secondary') {
    bg = '#f1f5f9';
    txtColor = '#334155';
  } else if (variant === 'outline') {
    bg = '#ffffff';
    txtColor = '#334155';
    border = '#cbd5e1';
  } else if (variant === 'danger') {
    bg = '#fee2e2';
    txtColor = '#dc2626';
    border = '#fca5a5';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.button, { backgroundColor: bg, borderColor: border }, style]}
    >
      {icon && <View style={styles.btnIcon}>{icon}</View>}
      <Text style={[styles.buttonText, { color: txtColor }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function RNStatCard({
  title,
  amount,
  icon,
  iconBg = '#eff6ff',
  textColor = '#0f172a',
  style,
}: {
  title: string;
  amount: string;
  icon: React.ReactNode;
  iconBg?: string;
  textColor?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.statCard, style]}>
      <View style={[styles.statIconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statAmount, { color: textColor }]}>{amount}</Text>
      </View>
    </View>
  );
}

export function RNInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  style,
}: {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnIcon: {
    marginRight: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    flex: 1,
    minWidth: 160,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statContent: {
    gap: 2,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
});
