import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Container, Input, ScreenHeader, Typography } from '@/src/components';
import type { InvestorProfileType, UserProfile, UserRole } from '@/src/domain/user';
import { useAuth } from '@/src/hooks/useAuth';
import { listUsersForAdmin } from '@/src/services/admin.service';
import { colors, radii, shadows, spacing } from '@/src/theme/tokens';

const ROLE_LABEL: Record<UserRole, string> = {
  investor: 'Investidor',
  admin: 'Admin',
  admin_readonly: 'Admin (leitura)',
};

const PROFILE_LABEL: Record<InvestorProfileType, string> = {
  conservative: 'Conservador',
  moderate: 'Moderado',
  aggressive: 'Arrojado',
};

export function AdminUsersScreen() {
  const { profile } = useAuth();
  const canAccess =
    profile?.role === 'admin' || profile?.role === 'admin_readonly';
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queryText, setQueryText] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<InvestorProfileType | 'all' | 'none'>(
    'all',
  );

  const refresh = useCallback(async () => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsersForAdmin());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Falha ao listar usuários. Verifique permissões e índices.',
      );
    } finally {
      setLoading(false);
    }
  }, [canAccess]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (riskFilter === 'none' && user.investorProfile) return false;
      if (
        riskFilter !== 'all' &&
        riskFilter !== 'none' &&
        user.investorProfile !== riskFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        user.email.toLowerCase().includes(q) ||
        user.displayName.toLowerCase().includes(q)
      );
    });
  }, [users, queryText, roleFilter, riskFilter]);

  if (!canAccess) {
    return (
      <Container contentStyle={styles.center} safeBottom>
        <ScreenHeader title="Admin" subtitle="Acesso restrito." showBack />
        <Typography variant="body" color={colors.textMuted}>
          Esta área é apenas para papéis admin / admin_readonly.
        </Typography>
      </Container>
    );
  }

  return (
    <Container scroll contentStyle={styles.content} safeBottom>
      <ScreenHeader
        title="Usuários"
        subtitle="Consulta para segmentação futura — sem disparo de campanhas nesta versão."
        showBack
      />

      <Input
        placeholder="Buscar nome ou e-mail"
        value={queryText}
        onChangeText={setQueryText}
        autoCapitalize="none"
      />

      <View style={styles.filters}>
        {(['all', 'investor', 'admin', 'admin_readonly'] as const).map((role) => (
          <Pressable
            key={role}
            onPress={() => setRoleFilter(role)}
            style={[styles.chip, roleFilter === role && styles.chipActive]}
          >
            <Typography variant="caption">
              {role === 'all' ? 'Todos' : ROLE_LABEL[role]}
            </Typography>
          </Pressable>
        ))}
      </View>

      <View style={styles.filters}>
        {(
          [
            ['all', 'Perfil'],
            ['conservative', 'Conservador'],
            ['moderate', 'Moderado'],
            ['aggressive', 'Arrojado'],
            ['none', 'Sem perfil'],
          ] as const
        ).map(([id, label]) => (
          <Pressable
            key={id}
            onPress={() => setRiskFilter(id)}
            style={[styles.chip, riskFilter === id && styles.chipActive]}
          >
            <Typography variant="caption">{label}</Typography>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : error ? (
        <Typography variant="caption" color={colors.danger}>
          {error}
        </Typography>
      ) : (
        <>
          <Typography variant="caption" color={colors.textMuted}>
            {filtered.length} usuário{filtered.length === 1 ? '' : 's'}
          </Typography>
          {filtered.map((user) => (
            <View key={user.id} style={styles.card}>
              <Typography variant="bodyStrong">
                {user.displayName || 'Sem nome'}
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {user.email}
              </Typography>
              <Typography variant="caption">
                {ROLE_LABEL[user.role]}
                {user.investorProfile
                  ? ` · ${PROFILE_LABEL[user.investorProfile]}`
                  : ' · perfil não definido'}
              </Typography>
            </View>
          ))}
        </>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...shadows.card,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  card: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 2,
    ...shadows.card,
  },
});
