# Security Policy

RIAL FOOD WORLD S.L. takes the security of its software products seriously. This document describes how to report vulnerabilities and what to expect from us.

## Supported versions

| Version | Supported |
| --- | --- |
| 1.5.x   | ✓ |
| < 1.5   | ✗ |

## Scope

The following components are in scope for security reports:
- Web application (React 19 + Vite build, production deployment on Vercel).
- Native shell (Capacitor iOS / Android wrappers).
- Supabase Edge Functions in `supabase/functions/` (`gemini-proxy`, `delete-account`, `validate-receipt`).
- Client-side handling of Gemini, Supabase, RevenueCat, and Sentry credentials.

Out of scope:
- Third-party platforms and services (report directly to their vendors).
- Denial-of-service via volumetric traffic.
- Social engineering of RIAL staff or contributors.

## Reporting a vulnerability

**Do not open a public GitHub Issue for security reports.**

Please email `security@rialfoodworld.com` with:
- A clear description of the issue.
- Steps to reproduce.
- Affected version or commit SHA if known.
- Impact assessment (data exposure, auth bypass, privilege escalation, etc.).
- Your contact details and preferred disclosure timeline.

## Our response

| Step | SLA |
| --- | --- |
| Acknowledgement of receipt | within 72 hours |
| Triage and initial severity assessment | within 7 days |
| Fix target for critical issues | within 30 days |
| Coordinated disclosure window | negotiated case-by-case |

We will keep you informed throughout the process and credit reporters publicly if they wish.

## Safe harbor

Good-faith security research that follows this policy will not be subject to legal action by RIAL FOOD WORLD S.L. We ask reporters to:
- Avoid privacy violations, data destruction, or service degradation.
- Only interact with accounts they own or have explicit permission to test.
- Refrain from publicly disclosing an issue until we have confirmed remediation.

## Secret handling

RIAL follows the principle that secrets never live in tracked repository configuration:
- Server-side secrets (e.g. `GEMINI_API_KEY`) are provisioned in Supabase Edge Functions.
- Client builds receive only `VITE_*` variables supplied via Vercel environment settings or GitHub Actions secrets.
- `.env.local` is ignored by git; see `.env.example` for the full contract.
