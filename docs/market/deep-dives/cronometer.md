# Cronometer

**Categoría:** Directo tracking (precisión premium)
**ICP primario:** Quantified-self 30–55, celiacos, personas con condición médica que necesita trackear micronutrientes (anemia, osteoporosis), nutricionistas profesionales, biohackers.
**Geografías clave:** Canadá (home), US, UK, Australia, Europa occidental. Nicho pero global.
**Pricing (2026):** Free (Basic) / Gold $10.99/mes o $59.88/año. Pricing estable desde 2022 (no ha subido tanto como MFP).
**Tracción conocida:** ~15M usuarios acumulados reportados (source needed para cifra 2026). Percibido como gold standard de precisión en comunidades nutri profesionales.
**Última revisión:** 2026-04-17

## Qué hace bien
- **84 micronutrientes USDA-verified** — tracking no solo de macros sino de vitaminas y minerales individuales (B12, hierro, zinc, folato, etc.) contra RDI. Incomparable en el sector consumer.
- **DB "Verified Foods" sin ruido user-submitted** — opción de filtrar solo entries verificadas (USDA, NCCDB, IFCT). Elimina el problema MFP de "elegir entre 5 duplicados".
- **Oracle AI** — feature 2024-2025 que responde preguntas sobre tu diario ("¿por qué no me suficiente hierro?") usando tus datos reales. Coach data-informed, no genérico.
- **Integración biomarker / CGM** — nativa con Dexcom, Levels, Oura; muestra correlaciones glucosa vs comidas registradas. Único en el segment consumer nutri.
- **Custom recipes con macro + micro breakdown** — crear receta recalcula todo el breakdown completo incluyendo micros, no solo macros.

## Qué hace mal / gaps
- **UI técnica, abrumadora para casual user** — diseño funcional pero denso; muchos números y tablas. No atrae al ICP "solo quiero perder 5 kilos".
- **Sin planner semanal visual** — tiene meal plans pero más como "diary programmado" que calendar drag-drop. Flaco para ICP household.
- **Sin cobertura de comida procesada / marca comercial** — el foco en USDA y ingredientes crudos significa que "la pizza del Mercadona" o "cereales Kellogg's" tienen cobertura débil vs MFP.

## Patrones UX destacables
- **Nutrient targets ring grid** — pantalla única de todos los nutrientes con ring por cada uno (target vs consumido). Glanceable pero denso. Modelo de "dashboard quantified".
- **Oracle AI como panel lateral** — no es un chat central; es un panel que responde preguntas específicas con referencias directas a tus entradas. Trust por transparencia.
- **Recipe factory con micro breakdown** — al crear receta el usuario ve no solo kcal/P/C/G sino B12, vitamin D, etc. Refuerza identidad "nutrient density".
- **Pro tier desbloquea widgets específicos** — no paywall de features básicos; paywall de visualizaciones avanzadas (temporal trends, mineral balance diagrams, biomarker overlays). Menos hostil que MFP.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | ✓ | Gold standard |
| Recetas propias (creación manual) | ✓ | CRUD con micro breakdown |
| Multi-media recetas (fotos + video) | parcial | Foto única, sin video |
| Import recetas URL | parcial | Extension web / copy-paste, no pulido |
| Barcode scanner | ✓ | Free, rápido |
| Photo recognition comida | parcial | Añadido pero no core |
| Planner semanal (MealSlot) | parcial | Meal plans programables, no drag-drop |
| Batch cooking logic | ✗ | No |
| Ayuno intermitente integrado | parcial | Timer + intake windows |
| AI Coach contextual | ✓ | Oracle AI data-informed |
| Social / creator content | ✗ | No |
| Progreso fotos (Body snapshot) | parcial | Biometrics + weight; fotos no core |
| Pantry / despensa | ✗ | No |
| Shopping list auto | ✗ | No |
| Wellness (Real Feel / mood) | parcial | Mood + energy log simple |
| Wearable integration | ✓ | Dexcom, Oura, Apple Health, Garmin |

## Lecciones aplicables a RIAL
1. **Copiar:** el modelo Oracle AI — coach que responde preguntas con referencias explícitas a tus datos reales, no genérico. RIAL AI Coach hoy no inyecta sistemáticamente contexto del usuario (`docs/market/README.md` lo marca como riesgo). Oracle es el patrón correcto: citar entradas concretas del diario como evidencia. También el pricing non-hostile — paywall de visualizaciones, no de features core — modelo más saludable que MFP.
2. **Evitar:** UI técnica/densa. Cronometer tiene la ventaja en precisión pero pierde en mass market por abrumar al usuario. RIAL con Q15.5 design system debe mantener glanceable+drill-down, no replicar dashboards quantified.
3. **Diferenciarnos en:** recetas propias con video (Cronometer no); planner drag-drop semanal (no); batch cooking (no); cocina ES/LatAm (Cronometer es USDA-centric); Real Feel subjetivo rico (Cronometer tiene mood simple, no multi-eje); real-food identity narrativa (Cronometer es quantified neutral, no tiene opinión sobre calidad de comida).

## Fuentes
- App Store listing: https://apps.apple.com/us/app/cronometer/id1145935738
- Play Store listing: https://play.google.com/store/apps/details?id=com.cronometer.android.gold
- Cronometer corporate + founders: https://cronometer.com/about/
- Oracle AI announcement 2024: https://cronometer.com/blog/ (search Oracle)
- Dexcom / Levels integration: https://cronometer.com/help/ (search CGM / biomarker)
