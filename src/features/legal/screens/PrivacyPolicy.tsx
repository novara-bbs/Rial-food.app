/**
 * Privacy Policy screen — GDPR compliant.
 * Required by Apple App Store + Google Play + EU law.
 *
 * Fill in: company name, contact email, DPO contact (if applicable).
 * Last updated: 2026-04-12
 */
import { ArrowLeft } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useI18n } from '../../../i18n';
import { Heading, Text } from '@/components/ui/Typography';

interface Props {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: Props) {
  const { t } = useI18n();

  return (
    <PageShell maxWidth="default" spacing="lg">
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={onBack}
          aria-label={t.common.back}
          className="w-11 h-11 flex items-center justify-center rounded-sm hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-on-surface" aria-hidden="true" />
        </button>
        <Heading level="h1" className="font-black tracking-widest">
          {t.legal.privacyTitle}
        </Heading>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 font-body text-on-surface-variant text-sm leading-relaxed">
        <Text variant="micro" className="text-on-surface-variant/60">
          {t.legal.lastUpdated}: 12 Abril 2026
        </Text>

        <Section title={t.legal.privacy.whoWeAre}>
          <p>RIAL es una aplicación de nutrición desarrollada por Novarabbs. Puedes contactarnos en <strong className="text-on-surface">privacidad@novarabbs.com</strong>.</p>
        </Section>

        <Section title={t.legal.privacy.dataWeCollect}>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-on-surface">Datos de perfil</strong>: nombre, edad, peso, altura, objetivos nutricionales (almacenados localmente o en tu cuenta Supabase si inicias sesión).</li>
            <li><strong className="text-on-surface">Registros de alimentación</strong>: alimentos consumidos, porciones, macros (almacenados en tu dispositivo, sincronizados si tienes cuenta).</li>
            <li><strong className="text-on-surface">Datos de bienestar</strong>: estado de ánimo, sueño, síntomas — únicamente si los introduces voluntariamente.</li>
            <li><strong className="text-on-surface">Datos de uso</strong>: informes de errores anónimos mediante Sentry (sin datos personales identificables).</li>
            <li><strong className="text-on-surface">Datos de compra</strong>: estado de suscripción gestionado por RevenueCat (no almacenamos datos de tarjetas de crédito).</li>
          </ul>
        </Section>

        <Section title={t.legal.privacy.howWeUse}>
          <ul className="list-disc pl-5 space-y-1">
            <li>Proporcionar y mejorar la app.</li>
            <li>Calcular objetivos nutricionales personalizados.</li>
            <li>Sincronizar tus datos entre dispositivos (si tienes cuenta).</li>
            <li>Diagnosticar errores técnicos (Sentry, sin PII).</li>
            <li>Gestionar tu suscripción RIAL+ (RevenueCat).</li>
          </ul>
          <p className="mt-2">No vendemos ni compartimos tus datos con terceros para publicidad.</p>
        </Section>

        <Section title={t.legal.privacy.dataStorage}>
          <p>Tus datos se almacenan <strong className="text-on-surface">localmente en tu dispositivo</strong> (IndexedDB / localStorage). Si creas una cuenta, se sincronizan de forma cifrada con Supabase (servidores en la UE).</p>
        </Section>

        <Section title={t.legal.privacy.yourRights}>
          <p>Bajo el RGPD tienes derecho a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-on-surface">Acceder</strong> a tus datos — usa "Exportar datos" en Ajustes.</li>
            <li><strong className="text-on-surface">Rectificar</strong> tus datos — edita tu perfil en cualquier momento.</li>
            <li><strong className="text-on-surface">Eliminar</strong> tus datos — usa "Borrar todos los datos" en Ajustes o "Eliminar cuenta".</li>
            <li><strong className="text-on-surface">Portabilidad</strong> — descarga tus datos en formato JSON desde Ajustes.</li>
            <li><strong className="text-on-surface">Oponerte</strong> al tratamiento — contáctanos en privacidad@novarabbs.com.</li>
          </ul>
        </Section>

        <Section title={t.legal.privacy.thirdParties}>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-on-surface">Supabase</strong> — base de datos y autenticación (RGPD compliant, servidores UE).</li>
            <li><strong className="text-on-surface">Sentry</strong> — informes de errores anónimos.</li>
            <li><strong className="text-on-surface">RevenueCat</strong> — gestión de suscripciones (PCI DSS compliant).</li>
            <li><strong className="text-on-surface">Google Gemini API</strong> — procesamiento de consultas al AI Coach (sin almacenamiento de conversaciones).</li>
          </ul>
        </Section>

        <Section title={t.legal.privacy.children}>
          <p>RIAL no está dirigida a menores de 16 años. No recopilamos conscientemente datos de menores. Si eres padre/madre y crees que tu hijo ha proporcionado datos, contáctanos.</p>
        </Section>

        <Section title={t.legal.privacy.changes}>
          <p>Podemos actualizar esta política. Te notificaremos de cambios significativos en la app. La fecha de última actualización siempre aparece al inicio de este documento.</p>
        </Section>

        <Section title={t.legal.privacy.contact}>
          <p>Para cualquier consulta sobre privacidad: <strong className="text-on-surface">privacidad@novarabbs.com</strong></p>
        </Section>
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Heading level="h2" variant="overline" className="mb-2">{title}</Heading>
      {children}
    </div>
  );
}
