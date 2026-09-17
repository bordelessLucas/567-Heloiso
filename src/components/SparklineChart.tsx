import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/src/components/Typography';
import type { PricePoint } from '@/src/domain/portfolio';
import { colors, radii, spacing, typography, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { formatBrl, formatCompactBrl } from '@/src/utils/format';

const MAX_VISIBLE_BARS = 32;

interface SparklineChartProps {
  series: PricePoint[];
  height?: number;
  positive?: boolean;
  showRange?: boolean;
}

function downsample(series: PricePoint[], maxPoints: number): PricePoint[] {
  if (series.length <= maxPoints) {
    return series;
  }

  const result: PricePoint[] = [];
  const lastIndex = series.length - 1;

  for (let i = 0; i < maxPoints; i += 1) {
    const index = Math.round((i / (maxPoints - 1)) * lastIndex);
    const point = series[index];
    if (point) {
      result.push(point);
    }
  }

  return result;
}

function formatDayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function SparklineChart({
  series,
  height = 140,
  positive,
  showRange = true,
}: SparklineChartProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const opacity = useSharedValue(1);
  const widthRef = useRef(0);
  const countRef = useRef(0);

  const visible = useMemo(() => downsample(series, MAX_VISIBLE_BARS), [series]);
  countRef.current = visible.length;

  const stats = useMemo(() => {
    if (visible.length === 0) {
      return { min: 0, max: 1, first: 0, last: 0, up: true };
    }
    const values = visible.map((point) => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = values[0] ?? 0;
    const last = values[values.length - 1] ?? 0;
    return {
      min,
      max: max === min ? min + 1 : max,
      first,
      last,
      up: last >= first,
    };
  }, [visible]);

  useEffect(() => {
    opacity.value = 0.45;
    opacity.value = withTiming(1, { duration: 320 });
    setActiveIndex(null);
  }, [series, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const isUp = positive ?? stats.up;
  const tone = isUp ? colors.success : colors.danger;
  const fill = isUp ? colors.surfaceWarm : colors.surfaceMuted;

  const bars = useMemo(() => {
    if (visible.length === 0) return [];
    const range = stats.max - stats.min;
    return visible.map((point, index) => {
      const ratio = (point.value - stats.min) / range;
      return {
        key: `${point.dateKey}-${index}`,
        height: Math.max(8, 10 + ratio * (height - 28)),
        point,
        index,
      };
    });
  }, [visible, stats.max, stats.min, height]);

  const pickIndex = (locationX: number) => {
    const w = widthRef.current;
    const count = countRef.current;
    if (w <= 0 || count <= 0) return;
    const pad = 6;
    const gap = 2;
    const inner = Math.max(0, w - pad * 2);
    const slot = count > 0 ? (inner - gap * Math.max(0, count - 1)) / count : inner;
    const x = Math.max(pad, Math.min(w - pad, locationX));
    const index = Math.floor((x - pad) / Math.max(slot + gap, 1));
    setActiveIndex(Math.max(0, Math.min(count - 1, index)));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          pickIndex(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          pickIndex(event.nativeEvent.locationX);
        },
        onPanResponderRelease: () => {
          setActiveIndex(null);
        },
        onPanResponderTerminate: () => {
          setActiveIndex(null);
        },
      }),
    [],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    widthRef.current = next;
    setWidth(next);
  };

  const active = activeIndex !== null ? visible[activeIndex] : null;
  const activeBar = activeIndex !== null ? bars[activeIndex] : null;

  const crosshair = useMemo(() => {
    if (activeIndex === null || !activeBar || width <= 0 || visible.length === 0) {
      return null;
    }
    const pad = 6;
    const gap = 2;
    const n = visible.length;
    const inner = Math.max(0, width - pad * 2);
    const slot = (inner - gap * Math.max(0, n - 1)) / n;
    const lineX = pad + activeIndex * (slot + gap) + slot / 2;
    // Topo da barra (ponto do valor) — cruz no centro do eixo X da barra
    const markerY = height - 4 - activeBar.height;
    return { lineX, markerY };
  }, [activeIndex, activeBar, width, visible.length, height]);


  if (series.length === 0) {
    return (
      <View style={[styles.chart, { height, backgroundColor: colors.surfaceMuted }]}>
        <Typography variant="caption" color={colors.textMuted}>
          Sem dados no período
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {showRange ? (
        <View style={styles.rangeRow}>
          <View style={styles.rangeCell}>
            <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
              Mín
            </Typography>
            <Typography
              variant="caption"
              color={colors.textMuted}
              numberOfLines={1}
              style={styles.rangeValue}
            >
              {formatCompactBrl(stats.min)}
            </Typography>
          </View>
          <View style={[styles.rangeCell, styles.rangeCenter]}>
            <Typography variant="caption" color={tone} numberOfLines={1}>
              Atual
            </Typography>
            <Typography
              variant="caption"
              color={tone}
              numberOfLines={1}
              style={styles.rangeValue}
            >
              {formatCompactBrl(stats.last)}
            </Typography>
          </View>
          <View style={[styles.rangeCell, styles.rangeEnd]}>
            <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
              Máx
            </Typography>
            <Typography
              variant="caption"
              color={colors.textMuted}
              numberOfLines={1}
              style={styles.rangeValue}
            >
              {formatCompactBrl(stats.max)}
            </Typography>
          </View>
        </View>
      ) : null}

      {active ? (
        <View style={styles.tooltip}>
          <Typography variant="caption" color={colors.textMuted}>
            {formatDayLabel(active.dateKey)}
          </Typography>
          <Typography variant="bodyStrong" color={colors.black}>
            {formatBrl(active.value)}
          </Typography>
        </View>
      ) : (
        <Typography variant="caption" color={colors.textMuted}>
          Toque e arraste no gráfico para ver o dia e o preço
        </Typography>
      )}

      <Animated.View
        style={[styles.chart, { height, backgroundColor: fill }, animatedStyle]}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        {width > 0 ? (
          <View style={styles.barsRow} pointerEvents="none">
            {bars.map((bar) => {
              const isActive = bar.index === activeIndex;
              return (
                <View key={bar.key} style={styles.barSlot}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: bar.height,
                        backgroundColor: tone,
                        opacity: activeIndex === null ? 0.9 : isActive ? 1 : 0.35,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        ) : null}

        {crosshair ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={[styles.crossX, { left: crosshair.lineX }]} />
            <View style={[styles.crossY, { top: crosshair.markerY }]} />
            <View
              style={[
                styles.marker,
                {
                  left: crosshair.lineX - 5,
                  top: crosshair.markerY - 5,
                  borderColor: tone,
                },
              ]}
            />
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    width: '100%',
    overflow: 'hidden',
  },
  rangeRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.xs,
  },
  rangeCell: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  rangeCenter: {
    alignItems: 'center',
  },
  rangeEnd: {
    alignItems: 'flex-end',
  },
  rangeValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
  },
  tooltip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 2,
    alignSelf: 'flex-start',
  },
  chart: {
    width: '100%',
    borderRadius: radii.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingHorizontal: 6,
    paddingBottom: 4,
    paddingTop: 8,
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  barSlot: {
    flex: 1,
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  crossX: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: colors.black,
    opacity: 0.55,
  },
  crossY: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.black,
    opacity: 0.35,
  },
  marker: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
  },
}); }
