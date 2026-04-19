/**
 * Terms of Service screen.
 * Required by Apple App Store + Google Play.
 *
 * Last updated: 2026-04-12
 */
import { ArrowLeft } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useI18n } from '../../../i18n';

interface Props {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: Props) {
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
        <h1 className="font-headline text-xl font-black uppercase tracking-widest text-tertiary">
          {t.legal.termsTitle}
        </h1>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 font-body text-on-surface-variant text-sm leading-relaxed">
        <p className="font-label text-micro uppercase tracking-widest text-on-surface-variant/60">
          {t.legal.lastUpdated}: 12 Abril 2026
        </p>

        <Section title={t.legal.terms.acceptance}>
          <p>Al descargar, instalar o usar RIAL ("la App"), aceptas estos Términos de Servicio. Si no los aceptas, no uses la App.</p>
        </Section>

        <Section title={t.legal.terms.service}>
          <p>RIAL es una aplicación de seguimiento nutricional y bienestar personal. La información proporcionada es de carácter general y <strong className="text-on-surface">no sustituye el consejo médico profesional</strong>. Consulta siempre con un profesional de la salud antes de realizar cambios significativos en tu dieta.</p>
        </Section>

        <Section title={t.legal.terms.account}>
          <ul className="list-disc pl-5 space-y-1">
            <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
            <li>Debes tener al menos 16 años para crear una cuenta.</li>
            <li>Cada usuario puede tener una sola cuenta.</li>
            <li>Nos reservamos el derecho de suspender cuentas que violen estos términos.</li>
          </ul>
        </Section>

        <Section title={t.legal.terms.subscription}>
          <ul className="list-disc pl-5 space-y-1">
            <li>RIAL+ es una suscripción de pago con planes mensual y anual.</li>
            <li>Los pagos se procesan mediante App Store (Apple) o Google Play.</li>
            <li>La suscripción se renueva automáticamente salvo que la canceles al menos 24h antes del período de renovación.</li>
            <li>Puedes cancelar en cualquier momento desde los ajustes de tu tienda de apps.</li>
            <li>No emitimos reembolsos excepto en los casos requeridos por ley o por las políticas de Apple/Google.</li>
          </ul>
        </Section>

        <Section title={t.legal.terms.prohibited}>
          <p>Queda prohibido:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Usar la App para fines ilegales o fraudulentos.</li>
            <li>Intentar acceder sin autorización a nuestros sistemas.</li>
            <li>Distribuir, modificar o hacer ingeniería inversa de la App.</li>
            <li>Publicar contenido ofensivo, falso o que infrinja derechos de terceros.</li>
          </ul>
        </Section>

        <Section title={t.legal.terms.disclaimer}>
          <p>RIAL se proporciona "tal cual". No garantizamos resultados específicos de salud, pérdida de peso ni rendimiento deportivo. En ningún caso seremos responsables de daños indirectos, incidentales o consecuentes derivados del uso de la App.</p>
        </Section>

        <Section title={t.legal.terms.intellectual}>
          <p>Todos los derechos de propiedad intelectual de la App pertenecen a Novarabbs. No puedes copiar, distribuir ni crear obras derivadas sin autorización expresa.</p>
        </Section>

        <Section title={t.legal.terms.governing}>
          <p>Estos términos se rigen por la legislación española. Cualquier disputa se someterá a los tribunales de Madrid, España.</p>
        </Section>

        <Section title={t.legal.terms.contact}>
          <p>Para consultas legales: <strong className="text-on-surface">legal@novarabbs.com</strong></p>
        </Section>
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-2">{title}</h2>
      {children}
    </div>
  );
}
