import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { useImageCapture } from './useImageCapture';

type Props = {
  patientId: string;
  patientName: string;
};

export function ImageCaptureScreen({ patientId, patientName }: Props) {
  const router  = useRouter();

  const { imageUri, source, pickFromCamera, pickFromGallery, clearImage, error } =
    useImageCapture();

  const handleAnalyze = () => {
    if (!imageUri) return;
    const params = [
      `patientId=${encodeURIComponent(patientId)}`,
      `patientName=${encodeURIComponent(patientName)}`,
      `imageUri=${encodeURIComponent(imageUri)}`,
    ];
    if (source) params.push(`source=${source}`);
    router.push(`/analysis-result?${params.join('&')}` as any);
  };

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStep}>Nuevo análisis</Text>
          <Text style={styles.headerTitle}>Paso 2 de 3 — Imagen</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      {/* ── Patient badge ──────────────────────────────── */}
      <View style={styles.patientBadge}>
        <Ionicons name="person-circle-outline" size={16} color={colors.accent} />
        <Text style={styles.patientBadgeText} numberOfLines={1}>{patientName}</Text>
      </View>

      {/* ── Image area ─────────────────────────────────── */}
      <View style={styles.imageArea}>
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
            <TouchableOpacity style={styles.clearBtn} onPress={clearImage}>
              <Ionicons name="close-circle" size={28} color={colors.white} />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="image-outline" size={48} color={colors.textDisabled} />
            </View>
            <Text style={styles.placeholderTitle}>Sin imagen seleccionada</Text>
            <Text style={styles.placeholderSub}>
              Usa los botones de abajo para capturar o seleccionar una imagen endoscópica
            </Text>
          </View>
        )}
      </View>

      {/* ── Actions ────────────────────────────────────── */}
      <View style={styles.actions}>
        {error && error !== 'MODEL_UNAVAILABLE' ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!imageUri ? (
          <View style={styles.pickRow}>
            <TouchableOpacity style={styles.pickBtn} onPress={pickFromCamera} activeOpacity={0.85}>
              <Ionicons name="camera-outline" size={24} color={colors.accent} />
              <Text style={styles.pickBtnText}>Cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickBtn} onPress={pickFromGallery} activeOpacity={0.85}>
              <Ionicons name="images-outline" size={24} color={colors.accent} />
              <Text style={styles.pickBtnText}>Galería</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.analyzeRow}>
            <TouchableOpacity style={styles.changeBtn} onPress={clearImage} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={18} color={colors.textSub} />
              <Text style={styles.changeBtnText}>Cambiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.analyzeBtn}
              onPress={handleAnalyze}
              activeOpacity={0.85}
            >
              <Ionicons name="scan-outline" size={18} color={colors.white} />
              <Text style={styles.analyzeBtnText}>Analizar imagen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Steps indicator */}
        <View style={styles.steps}>
          <View style={styles.stepDot} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepDot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: { padding: 6, width: 34 },
  headerCenter: { alignItems: 'center' },
  headerStep: { ...typography.caption, color: colors.accent, fontWeight: '700' },
  headerTitle: { ...typography.bodySm, fontWeight: '600', color: colors.text },

  // Patient badge
  patientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accentLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  patientBadgeText: { ...typography.bodySm, fontWeight: '600', color: colors.accent, flex: 1 },

  // Image area
  imageArea: {
    flex: 1,
    margin: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: { flex: 1 },
  clearBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.full,
    padding: 2,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  placeholderTitle: { ...typography.heading, color: colors.text },
  placeholderSub: { ...typography.bodySm, color: colors.textSub, textAlign: 'center' },

  // Actions
  actions: {
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorLight,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  errorText: { ...typography.bodySm, color: colors.error, flex: 1 },

  pickRow: { flexDirection: 'row', gap: spacing.md },
  pickBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent + '33',
  },
  pickBtnText: { ...typography.bodySm, fontWeight: '700', color: colors.accent },

  analyzeRow: { flexDirection: 'row', gap: spacing.md },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  changeBtnText: { ...typography.bodySm, fontWeight: '600', color: colors.textSub },
  analyzeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 13,
  },
  analyzeBtnDisabled: { opacity: 0.6 },
  analyzeBtnText: { ...typography.body, fontWeight: '700', color: colors.white },

  // Steps
  steps: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    width: 20,
    backgroundColor: colors.accent,
  },
});
