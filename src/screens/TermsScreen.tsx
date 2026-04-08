import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Fonts } from '../theme';
import { logTermsAccepted } from '../services/analytics';

interface Props {
  onAccept: () => void;
}

const LAST_UPDATED = '8 de abril de 2026';

export default function TermsScreen({ onAccept }: Props) {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 60;
    if (nearBottom && !scrolled) setScrolled(true);
  };

  const handleAccept = async () => {
    await logTermsAccepted();
    onAccept();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Icon name="file-document-outline" size={28} color={Colors.primary} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Términos y Condiciones</Text>
          <Text style={styles.headerSub}>Actualizado el {LAST_UPDATED}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
      >
        <Section title="1. Aceptación de los términos">
          Al usar Sonata, aceptas estos términos de uso. Si no estás de acuerdo, no utilices la aplicación.
        </Section>

        <Section title="2. Uso de la aplicación">
          Sonata es un reproductor de música local que accede únicamente a los archivos de audio almacenados en tu dispositivo. No recopila ni transmite el contenido de tus archivos de música a ningún servidor externo.
        </Section>

        <Section title="3. Permisos requeridos">
          La aplicación requiere permiso de lectura de archivos de audio para funcionar correctamente. Este permiso se utiliza exclusivamente para acceder a tu biblioteca musical local.
        </Section>

        <Section title="4. Análisis y mejora">
          Sonata utiliza Google Firebase Analytics para recopilar datos anonimizados sobre el uso de la aplicación (pantallas visitadas, acciones realizadas). Estos datos no incluyen información personal ni el contenido de tus archivos. Se utilizan para mejorar la experiencia de usuario.
        </Section>

        <Section title="5. Privacidad">
          No recopilamos nombre, correo electrónico, contraseñas ni ningún dato de identificación personal. Los datos de analítica son completamente anónimos y se procesan de acuerdo con la{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://policies.google.com/privacy')}
          >
            Política de privacidad de Google
          </Text>
          .
        </Section>

        <Section title="6. Contenido de terceros">
          Sonata reproduce exclusivamente archivos de audio almacenados localmente en tu dispositivo. No proporcionamos, distribuimos ni alojamos contenido musical de terceros. Eres responsable de asegurarte de que el contenido que reproduces respeta los derechos de autor aplicables.
        </Section>

        <Section title="7. Sin garantías">
          La aplicación se proporciona "tal cual", sin garantías de ningún tipo. TECNO BROS no se hace responsable de pérdidas de datos, fallos del dispositivo ni daños derivados del uso de Sonata.
        </Section>

        <Section title="8. Actualizaciones de los términos">
          Podemos actualizar estos términos ocasionalmente. Cuando lo hagamos, actualizaremos la fecha indicada en la parte superior. El uso continuado de Sonata con la nueva versión implica la aceptación de los nuevos términos.
        </Section>

        <Section title="9. Contacto">
          Para cualquier consulta relacionada con estos términos, puedes contactarnos en:{'  '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('mailto:contacto@tecnobros.es')}
          >
            contacto@tecnobros.es
          </Text>
        </Section>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Accept button */}
      <View style={styles.footer}>
        {!scrolled && (
          <Text style={styles.scrollHint}>
            <Icon name="chevron-down" size={14} color={Colors.textSecondary} />
            {' '}Desplázate para leer todos los términos
          </Text>
        )}
        <TouchableOpacity
          style={[styles.acceptBtn, !scrolled && styles.acceptBtnDisabled]}
          onPress={handleAccept}
          activeOpacity={scrolled ? 0.8 : 1}
        >
          <Icon
            name="check-circle"
            size={20}
            color={scrolled ? Colors.white : Colors.textMuted}
            style={styles.acceptIcon}
          />
          <Text style={[styles.acceptText, !scrolled && styles.acceptTextDisabled]}>
            Acepto los Términos y Condiciones
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
    gap: Spacing.md,
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSub: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionBody: {
    fontSize: Fonts.sizes.sm + 1,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  link: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    backgroundColor: Colors.background,
    gap: Spacing.sm,
  },
  scrollHint: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xxl,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  acceptBtnDisabled: {
    backgroundColor: Colors.backgroundAlt,
    elevation: 0,
    shadowOpacity: 0,
  },
  acceptIcon: {
    marginRight: Spacing.sm,
  },
  acceptText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.white,
  },
  acceptTextDisabled: {
    color: Colors.textMuted,
  },
});
