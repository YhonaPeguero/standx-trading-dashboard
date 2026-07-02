# Spec: UX Refresh — "Premium DeFi" pass

Fecha: 2026-07-02 · Estado: pendiente de aprobación · Modo: SDD

## Objective

Elevar percepción premium (materialidad, momento compartible, personalidad) y
reducir fricción de import, sin tocar invariantes. Usuario: trader StandX que
comparte resultados en X. Éxito = la app se ve/siente top-tier 2026 dentro Y
fuera (link previews), e importar datos toma segundos.

## Tech Stack

React 18 + Vite 5 + TS estricto. CSS puro (styles.css tokens). Sin deps nuevas.
`sharp` solo como herramienta temporal de assets (`--no-save`, luego uninstall).

## Commands

- Dev: `cd app && npm run dev` (5173)
- Build: `npm run build` · Typecheck: `npm run typecheck`
- No hay test runner: verificación = preview MCP (snapshot/inspect/eval) + build

## Project Structure

Sin cambios. Nuevos archivos: `app/public/og.png`, este spec.

## Alcance (aprobado por Yhona)

### Tier 1
1. **OG/Twitter meta + og.png 1200×630** (mascota + wordmark sobre moss)
2. **Grain overlay** global (`body::after`, SVG feTurbulence data-URI, ~2.5%
   opacidad, pointer-events none) — fuera de `#share-card`, export queda limpio
3. **Glass sutil** en cards del dashboard (surface translúcido + backdrop-blur).
   `#share-card` y sus tiles quedan **opacos** (html-to-image no captura
   backdrop-filter)
4. **Hero espectacular** (decisión Yhona: NO bento; layout alineado, mejor uso
   lateral): shell 1140→1240px en ≥1280px; número PnL con gradiente
   (verde→menta) + spotlight radial suave detrás; corner brackets HUD (mismo
   lenguaje de la share card)
5. **Drag & drop ventana completa** (overlay "suelta para analizar", solo
   vista empty)
6. **Footer: link GitHub** ("código abierto") junto a los créditos
7. **Fix chips móvil** (sin huérfano en 375px)

### Tier 2
8. **Pegar JSON** (Ctrl+V en vista empty → parse directo, toast feedback)
9. **Micro-personalidad mascota** (poses actuales): al agregar archivos
   (drop/picker/paste) → hop + swap happy→hype ~1.2s, luego vuelve
10. **Share card toggle formato**: Post (actual) / Story 9:16 (re-stack
    vertical, export ≥1080px de ancho vía pixelRatio)

## Code Style

Como el existente: tokens CSS en `:root`, keyframes en styles.css, componentes
función + props tipadas, comentarios solo para restricciones no obvias.

## Testing Strategy

Por task: typecheck + build + verificación preview (estados: empty, dashboard
demo ganancia/pérdida, share ambos formatos, export PNG/copy, móvil 375px,
reduced-motion razonable). Export PNG se re-verifica en CADA task que toque
ShareCard o estilos globales.

## Boundaries

- **Siempre**: mantener 100% local / cero storage / CSP intacto / ES+EN /
  verde=ganancia rojo=pérdida / export limpio
- **Preguntar antes**: dependencias nuevas, cambios al parser/stats, cambios de
  copy de seguridad
- **Nunca**: analytics, wallet-connect, light mode, tocar `lib/standx.ts`
  (matemática), romper `npm run build`

## Success Criteria

- Link pegado en X muestra card grande con mascota+marca
- Pegar JSON crudo → dashboard sin tocar filesystem
- Story 9:16 exporta ≥1080px ancho, composición correcta
- Bundle JS +<15 KB gzip vs actual (71.7 KB); export PNG sigue funcionando
- Cero regresión: móvil, reduced-motion, focus-visible, consola limpia

## Orden de implementación

Grain+glass+hero (visual base) → OG → drag-window+paste+mascota (flujo) →
story format → verificación integral → commit/push por bloques.

## Open Questions

Ninguna — 4 preguntas gate respondidas 2026-07-02.

## Addendum 2026-07-02 (post-implementación)

1. **Validación de exactitud (core)**: suite `npm test` permanente en
   `app/scripts/accuracy.test.mjs` — corre los módulos reales (bundle esbuild)
   contra 43 expectativas calculadas a mano. Además se validó una vez contra
   los exports reales del usuario: conservación exacta vs sumas crudas del
   JSON (net/fees/volumen/fills/taker%) y reconstrucción idéntica a una
   implementación de referencia independiente (874 round-trips). 55/55.
2. **Landing split** (feedback Yhona: "no moviste a la derecha"): el landing
   quedaba en columna única — corregido con grid-areas: head+card izquierda,
   mascota+privacidad+guía+referral derecha en ≥1080px; móvil intacto.
3. **Referral**: tarjeta amigable en la columna derecha →
   `https://standx.com/referral?code=Yhona` (ES/EN, target _blank noopener).
