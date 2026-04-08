import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Fonts } from '../theme';
import { logScreen } from '../services/analytics';

interface Props {
  onBack?: () => void;
}

const VERSION = '1.0.0';
const BUILD = '1';

export default function AboutScreen({ onBack }: Props) {
  const navigation = useNavigation<any>();
  const handleBack = onBack ?? (() => navigation.goBack());

  React.useEffect(() => {
    logScreen('About');
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Hero header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {true && (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
        )}
        <View style={styles.heroLogo}>
          <Icon name="music-circle" size={52} color={Colors.white} />
        </View>
        <Text style={styles.heroApp}>Sonata</Text>
        <Text style={styles.heroVersion}>Versión {VERSION} (build {BUILD})</Text>
        <Text style={styles.heroStudio}>by TECNO BROS</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* About card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: Colors.primary + '18' }]}>
              <Icon name="information-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Sobre la aplicación</Text>
          </View>
          <Text style={styles.cardBody}>
            Desarrollado por{' '}
            <Text style={styles.highlight}>TECNO BROS</Text>
            , estudio especializado en software y experiencias digitales. Esta aplicación ha sido creada por{' '}
            <Text style={styles.highlight}>Ilyas (1ly4s0)</Text>
            , con un enfoque en rendimiento, estabilidad y una experiencia de usuario moderna.
          </Text>
        </View>

        {/* Credits card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#6B7ED5' + '18' }]}>
              <Icon name="account-group-outline" size={20} color="#6B7ED5" />
            </View>
            <Text style={styles.cardTitle}>Créditos</Text>
          </View>

          <CreditRow
            icon="office-building-outline"
            iconColor={Colors.primary}
            label="Desarrollado por"
            value="TECNO BROS"
          />
          <View style={styles.divider} />
          <CreditRow
            icon="account-circle-outline"
            iconColor="#6B7ED5"
            label="Dirección y desarrollo"
            value="Ilyas / 1ly4s0"
          />
          <View style={styles.divider} />
          <CreditRow
            icon="tag-outline"
            iconColor={Colors.textSecondary}
            label="Versión"
            value={`${VERSION} (build ${BUILD})`}
          />
          <View style={styles.divider} />
          <CreditRow
            icon="calendar-outline"
            iconColor={Colors.textSecondary}
            label="Año"
            value="2026"
          />
        </View>

        {/* Tech stack card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#FFA040' + '18' }]}>
              <Icon name="code-tags" size={20} color="#FFA040" />
            </View>
            <Text style={styles.cardTitle}>Tecnologías</Text>
          </View>
          <View style={styles.pillRow}>
            {['React Native', 'TypeScript', 'Redux', 'Firebase', 'Android'].map(tech => (
              <View key={tech} style={styles.pill}>
                <Text style={styles.pillText}>{tech}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Links */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: Colors.heart + '18' }]}>
              <Icon name="link-variant" size={20} color={Colors.heart} />
            </View>
            <Text style={styles.cardTitle}>Contacto</Text>
          </View>
          <LinkRow
            icon="email-outline"
            label="contacto@tecnobros.es"
            onPress={() => Linking.openURL('mailto:contacto@tecnobros.es')}
          />
          <View style={styles.divider} />
          <LinkRow
            icon="github"
            label="github.com/1ly4s0"
            onPress={() => Linking.openURL('https://github.com/1ly4s0')}
          />
        </View>

        {/* Legal */}
        <Text style={styles.legal}>
          © 2026 TECNO BROS. Todos los derechos reservados.{'\n'}
          Sonata es un reproductor de música local. No distribuye ni aloja contenido musical de terceros.
        </Text>
      </ScrollView>
    </View>
  );
}

function CreditRow({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.creditRow}>
      <Icon name={icon} size={18} color={iconColor} style={styles.creditIcon} />
      <Text style={styles.creditLabel}>{label}</Text>
      <Text style={styles.creditValue}>{value}</Text>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.linkRow} onPress={onPress} activeOpacity={0.7}>
      <Icon name={icon} size={18} color={Colors.primary} style={styles.creditIcon} />
      <Text style={styles.linkText}>{label}</Text>
      <Icon name="chevron-right" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl + Spacing.xl,
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.xxxl,
    left: Spacing.lg,
    padding: Spacing.xs,
  },
  heroLogo: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroApp: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
  heroVersion: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  heroStudio: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  cardBody: {
    fontSize: Fonts.sizes.sm + 1,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  highlight: {
    color: Colors.text,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
    marginVertical: Spacing.xs,
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  creditIcon: {
    width: 22,
  },
  creditLabel: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  creditValue: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  pill: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  pillText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  linkText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  legal: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
});
