import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { Typography } from '@/src/components/Typography';
import type { PortfolioTradeSide } from '@/src/domain/portfolio';
import { colors, radii, shadows, spacing } from '@/src/theme/tokens';
import { formatBrl } from '@/src/utils/format';

interface TradeSheetProps {
  visible: boolean;
  side: PortfolioTradeSide;
  ticker: string;
  maxQuantity?: number;
  unitPrice: number;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
}

export function TradeSheet({
  visible,
  side,
  ticker,
  maxQuantity,
  unitPrice,
  onClose,
  onConfirm,
}: TradeSheetProps) {
  const [quantity, setQuantity] = useState('10');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setQuantity(side === 'sell' && maxQuantity ? String(Math.min(10, maxQuantity)) : '10');
      setError(null);
      setLoading(false);
    }
  }, [visible, side, maxQuantity]);

  const qty = Number(quantity);
  const total = Number.isFinite(qty) && qty > 0 ? qty * unitPrice : 0;
  const isBuy = side === 'buy';

  const handleConfirm = async () => {
    setError(null);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Informe uma quantidade válida.');
      return;
    }
    if (side === 'sell' && maxQuantity != null && qty > maxQuantity) {
      setError(`Você só tem ${maxQuantity} cotas.`);
      return;
    }

    setLoading(true);
    try {
      await onConfirm(Math.floor(qty));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.handle} />
            <Typography variant="h2" color={colors.black}>
              {isBuy ? 'Comprar' : 'Vender'} {ticker}
            </Typography>
            <Typography variant="body" color={colors.textMuted}>
              Cotação atual {formatBrl(unitPrice)}
              {!isBuy && maxQuantity != null ? ` · disponível ${maxQuantity} cotas` : ''}
            </Typography>

            <Input
              label="Quantidade de cotas"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              error={error ?? undefined}
            />

            <View style={styles.totalBox}>
              <Typography variant="caption" color={colors.textMuted}>
                Total estimado
              </Typography>
              <Typography variant="h2" color={colors.black}>
                {formatBrl(total)}
              </Typography>
            </View>

            <View style={styles.actions}>
              <Button label="Cancelar" variant="outline" onPress={onClose} />
              <Button
                label={isBuy ? 'Confirmar compra' : 'Confirmar venda'}
                variant={isBuy ? 'primary' : 'danger'}
                loading={loading}
                onPress={() => void handleConfirm()}
              />
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13,13,13,0.35)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  totalBox: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
  },
  actions: {
    gap: spacing.sm,
  },
});
