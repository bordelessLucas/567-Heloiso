import { useEffect, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { FadeEdgeScrollVertical } from '@/src/components/FadeEdgeScrollVertical';
import { ModuleIcon } from '@/src/components/ModuleIcon';
import { Typography } from '@/src/components/Typography';
import type { PortfolioPositionView } from '@/src/services/portfolio.service';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { formatBrl, formatCompactBrl, formatPercent } from '@/src/utils/format';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SEGMENT_COLORS = [
  '#F0B429',
  '#1A1A1A',
  '#C49214',
  '#0F7A4A',
  '#8A857C',
  '#B54708',
  '#E5C76B',
  '#5C5650',
  '#D4A017',
  '#3D3D3D',
] as const;

const GAP_DEG = 2.2;
const LEGEND_SLIDE_HEIGHT = 188;

export interface AllocationSlice {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  weight: number;
  marketValue: number;
  changePercent: number | null;
  metaLabel: string;
}

export type AllocationGroupBy = 'ticker' | 'segment';

interface AllocationRingProps {
  positions: PortfolioPositionView[];
  size?: number;
  onPress?: () => void;
  /** `hero` = Home (mais respirado). `compact` = Carteira. */
  variant?: 'hero' | 'compact';
  title?: string;
  /** Agrupa o anel por ativo ou por segmento do FII. */
  groupBy?: AllocationGroupBy;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (sweep <= 0.2) {
    return '';
  }
  const large = sweep > 180 ? 1 : 0;
  const os = polar(cx, cy, rOuter, startAngle);
  const oe = polar(cx, cy, rOuter, endAngle);
  const ie = polar(cx, cy, rInner, endAngle);
  const is = polar(cx, cy, rInner, startAngle);

  return [
    `M ${os.x} ${os.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${is.x} ${is.y}`,
    'Z',
  ].join(' ');
}

export function buildAllocationSlices(
  positions: PortfolioPositionView[],
): AllocationSlice[] {
  const total = positions.reduce((acc, item) => acc + item.marketValue, 0);
  if (total <= 0) return [];

  return [...positions]
    .sort((a, b) => b.marketValue - a.marketValue)
    .map((position, index) => ({
      id: position.ticker,
      title: position.ticker,
      subtitle: position.name,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length] ?? colors.primary,
      weight: position.marketValue / total,
      marketValue: position.marketValue,
      changePercent: position.changePercent,
      metaLabel: `${position.quantity} cotas`,
    }));
}

export function buildSegmentAllocationSlices(
  positions: PortfolioPositionView[],
): AllocationSlice[] {
  const total = positions.reduce((acc, item) => acc + item.marketValue, 0);
  if (total <= 0) return [];

  const map = new Map<
    string,
    {
      title: string;
      marketValue: number;
      changeAmount: number;
      holdingsCount: number;
    }
  >();

  positions.forEach((position) => {
    const key = position.segment;
    const current = map.get(key) ?? {
      title: position.segmentLabel,
      marketValue: 0,
      changeAmount: 0,
      holdingsCount: 0,
    };
    current.marketValue += position.marketValue;
    current.changeAmount += position.marketValue * ((position.changePercent ?? 0) / 100);
    current.holdingsCount += 1;
    map.set(key, current);
  });

  return [...map.entries()]
    .map(([id, data], index) => ({
      id,
      title: data.title,
      subtitle: `${data.holdingsCount} ativo${data.holdingsCount === 1 ? '' : 's'}`,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length] ?? colors.primary,
      weight: data.marketValue / total,
      marketValue: data.marketValue,
      changePercent:
        data.marketValue > 0 ? (data.changeAmount / data.marketValue) * 100 : null,
      metaLabel: formatPercent(data.marketValue / total * 100, 0),
    }))
    .sort((a, b) => b.marketValue - a.marketValue);
}

export function AllocationRing({
  positions,
  size = 200,
  onPress,
  variant = 'hero',
  title = 'Sua carteira agora',
  groupBy = 'ticker',
}: AllocationRingProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selected, setSelected] = useState<string | null>(null);
  const appear = useSharedValue(0);

  const slices = useMemo(
    () =>
      groupBy === 'segment'
        ? buildSegmentAllocationSlices(positions)
        : buildAllocationSlices(positions),
    [positions, groupBy],
  );
  const totalValue = useMemo(
    () => positions.reduce((acc, item) => acc + item.marketValue, 0),
    [positions],
  );

  const daily = useMemo(() => {
    if (totalValue <= 0) {
      return { percent: 0, amount: 0 };
    }
    const amount = positions.reduce((acc, item) => {
      const change = item.changePercent ?? 0;
      return acc + item.marketValue * (change / 100);
    }, 0);
    return {
      percent: (amount / totalValue) * 100,
      amount,
    };
  }, [positions, totalValue]);

  useEffect(() => {
    appear.value = 0;
    appear.value = withDelay(80, withTiming(1, { duration: 520 }));
    setSelected(null);
  }, [positions, groupBy, appear]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ scale: 0.94 + appear.value * 0.06 }],
  }));

  const cx = size / 2;
  const cy = size / 2;
  const isHero = variant === 'hero';
  const rOuter = size * (isHero ? 0.44 : 0.42);
  const rInner = size * (isHero ? 0.3 : 0.29);
  const usable = 360 - GAP_DEG * Math.max(0, slices.length);

  let angle = 0;
  const arcs = slices.map((slice) => {
    const sweep = Math.max(2, slice.weight * usable);
    const start = angle + GAP_DEG / 2;
    const end = start + sweep;
    angle += sweep + GAP_DEG;
    const isActive = selected === slice.id;
    const grow = isActive ? 4 : 0;
    return {
      ...slice,
      d: arcPath(cx, cy, rOuter + grow, rInner - grow * 0.2, start, end),
      isActive,
    };
  });

  const activeSlice = selected
    ? slices.find((slice) => slice.id === selected) ?? null
    : null;
  const positive = daily.percent >= 0;
  const edgeColor = isHero ? colors.surfaceFeature : colors.surfaceElevated;

  const selectSlice = (id: string) => {
    LayoutAnimation.configureNext({
      duration: 220,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
    setSelected((current) => (current === id ? null : id));
  };

  return (
    <View style={[styles.card, isHero && styles.cardHero]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.titleRow, pressed && onPress && styles.pressed]}
      >
        <ModuleIcon name="portfolio" size={18} tone="yellow" />
        <Typography variant="h3" color={colors.black} style={styles.title}>
          {title}
        </Typography>
        {onPress ? (
          <View style={styles.ctaPill}>
            <Typography variant="label" color={colors.black}>
              Abrir
            </Typography>
          </View>
        ) : null}
      </Pressable>

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.valueBlock, pressed && onPress && styles.pressed]}
      >
        <Typography variant="caption" color={colors.textMuted}>
          {groupBy === 'segment'
            ? 'Composição por segmento · valor de mercado'
            : 'Composição · valor de mercado'}
        </Typography>
        <Typography variant="h2" color={colors.black} numberOfLines={1}>
          {formatBrl(totalValue)}
        </Typography>
      </Pressable>

      <Pressable onPress={onPress} disabled={!onPress}>
        <Animated.View style={[styles.ringWrap, ringStyle]}>
          <Svg width={size} height={size}>
            <Circle
              cx={cx}
              cy={cy}
              r={(rOuter + rInner) / 2}
              stroke={isHero ? '#EFE6D4' : colors.borderSubtle}
              strokeWidth={rOuter - rInner + 8}
              fill="none"
            />
            <G>
              {arcs.map((arc) =>
                arc.d ? (
                  <Path
                    key={arc.id}
                    d={arc.d}
                    fill={arc.color}
                    opacity={selected && !arc.isActive ? 0.28 : 1}
                  />
                ) : null,
              )}
            </G>
          </Svg>

          <View
            style={[
              styles.center,
              {
                width: rInner * 2 - 10,
                height: rInner * 2 - 10,
              },
            ]}
          >
            {activeSlice ? (
              <>
                <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {activeSlice.title}
                </Typography>
                <Typography variant="h3" color={colors.black} numberOfLines={1}>
                  {formatPercent(activeSlice.weight * 100, 0)}
                </Typography>
                <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {formatCompactBrl(activeSlice.marketValue)}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="caption" color={colors.textMuted}>
                  Hoje
                </Typography>
                <Typography
                  variant="h2"
                  color={positive ? colors.success : colors.danger}
                  numberOfLines={1}
                >
                  {positive ? '+' : ''}
                  {formatPercent(daily.percent)}
                </Typography>
                <Typography
                  variant="caption"
                  color={positive ? colors.success : colors.danger}
                  numberOfLines={1}
                >
                  {positive ? '+' : ''}
                  {formatCompactBrl(daily.amount)}
                </Typography>
              </>
            )}
          </View>
        </Animated.View>
      </Pressable>

      <View style={styles.slideHeader}>
        <Typography variant="label" color={colors.black}>
          {groupBy === 'segment' ? 'Por segmento' : 'Suas cotas'}
        </Typography>
        <Typography variant="caption" color={colors.textMuted}>
          Deslize para ver todas
        </Typography>
      </View>

      <FadeEdgeScrollVertical
        edgeColor={edgeColor}
        preferBottomFade
        style={styles.legendSlide}
        contentContainerStyle={styles.legendContent}
      >
        {slices.map((slice) => {
          const active = selected === slice.id;
          const sliceUp = (slice.changePercent ?? 0) >= 0;
          return (
            <Pressable
              key={slice.id}
              onPress={() => selectSlice(slice.id)}
              style={({ pressed }) => [
                styles.legendItem,
                isHero && styles.legendItemHero,
                active && styles.legendItemActive,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.dot, { backgroundColor: slice.color }]} />
              <View style={styles.legendMeta}>
                <Typography variant="label" color={colors.black} numberOfLines={1}>
                  {slice.title}
                </Typography>
                <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {slice.subtitle}
                </Typography>
                <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {slice.metaLabel} · {formatPercent(slice.weight * 100, 0)}
                </Typography>
              </View>
              <Typography
                variant="caption"
                color={sliceUp ? colors.success : colors.danger}
                numberOfLines={1}
              >
                {slice.changePercent == null
                  ? '—'
                  : `${sliceUp ? '+' : ''}${formatPercent(slice.changePercent)}`}
              </Typography>
            </Pressable>
          );
        })}
      </FadeEdgeScrollVertical>
    </View>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  cardHero: {
    backgroundColor: colors.surfaceFeature,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.94,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  ctaPill: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  valueBlock: {
    gap: 2,
  },
  ringWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    ...shadows.card,
  },
  slideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  legendSlide: {
    height: LEGEND_SLIDE_HEIGHT,
    width: '100%',
  },
  legendContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  legendItemHero: {
    backgroundColor: colors.surfaceElevated,
  },
  legendItemActive: {
    backgroundColor: '#FFF8E8',
  },
  legendMeta: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
}); }
