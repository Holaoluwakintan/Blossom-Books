# Blossom Stories: Play Store Readiness Plan

**Repository:** `Holaoluwakintan/Blossom-Books`  
**Assessment:** The current repository is a web application. It is not yet an Android application package and cannot be submitted to Google Play in its present form.

## Executive conclusion

The immediate task is not simply to “upload the website to Play Store.” The team must first choose an Android delivery path, make the product reliable as a mobile experience, satisfy Google Play policy requirements, and establish a repeatable release process.

The current codebase has a useful backend and a functional web MVP. It now includes database-backed catalog content, safer mutations, foreign-key/index migrations, API validation, rate limiting, security headers, pagination, and six automated tests. It still lacks Android project configuration, account deletion, a privacy policy, a Data safety declaration basis, mobile-specific navigation and offline behavior, production observability, content-rights operations, and a release pipeline.

Google’s current requirement is that new apps and app updates submitted from **August 31, 2026** target **Android 16 / API level 36 or higher**. [1] This repository currently contains no Android manifest, Gradle project, Expo configuration, Capacitor configuration, signing setup, or Play App Bundle workflow. The app therefore has substantial product and mobile packaging work remaining before submission.

## Current blockers in this repository

### No Android application exists yet

The project is built as a React/Vite web application served by an Express server. There is no `android/` directory, `AndroidManifest.xml`, Gradle configuration, package name, app signing configuration, Play App Signing setup, or Android release workflow.

Choose one path before building more mobile-specific features:

1. **React Native with Expo:** best if Blossom will become a deeply mobile product with offline reading, push notifications, native navigation, downloads, and device features. This usually means creating a separate mobile app that consumes the existing tRPC/API backend.
2. **Capacitor wrapper:** fastest route to package the existing React application, but it requires careful mobile UX work and native plugins for downloads, push notifications, secure storage, and deep links.
3. **Trusted Web Activity/PWA:** appropriate only if the primary experience remains a high-quality, installable website. It is not a substitute for fixing mobile UX, account deletion, offline expectations, and app-store quality.

For Blossom, the recommended path is **a dedicated Expo mobile client sharing the current backend and domain types**. The current web client should remain the desktop/web experience rather than being forced into a thin wrapper.

### Account deletion is not implemented

The app supports account creation and authenticated profiles, but there is no visible in-app delete-account flow, server-side account deletion procedure, deletion request page, or documented retention policy.

Google Play requires apps that allow account creation to provide both an in-app path to request account deletion and a web resource where users can request deletion of their account and associated data. [2]

Implement:

- `account.requestDeletion` or equivalent protected API procedure.
- A confirmation flow that explains what is deleted and what may be retained for legal or financial reasons.
- Deletion or anonymization of the user profile, saved stories, progress, comments, reviews, follows, notifications, reports, and uploaded content according to a documented policy.
- A public `/delete-account` web page that accepts a request and explains the process.
- An admin queue for exceptional cases such as copyright disputes, financial records, or abuse investigations.
- Tests proving that deletion cannot affect another user’s data.

### Privacy policy and Data safety preparation are missing

Google requires every published app to complete the Data safety form, including apps in testing tracks other than internal testing, and requires a privacy policy link as part of that process. The declaration must include data handled by third-party SDKs and libraries. [3]

Blossom will likely handle account identity, email or login metadata, profile information, reading activity, saved content, reviews, comments, follows, uploaded covers, notifications, and analytics. The exact declaration must match the final mobile build and its SDKs.

Prepare:

- Public privacy policy URL.
- Terms of use.
- Community guidelines.
- Copyright and takedown policy.
- Creator agreement covering rights, licensing, moderation, and payouts.
- Data inventory mapping each field to purpose, retention, sharing, and deletion behavior.
- Google Play Data safety answers based on the actual release artifact.
- Secure storage and transport documentation.

Do not complete the Data safety form by guessing. Google places responsibility for accuracy on the developer, including data collected by third-party code. [3]

## Ordered roadmap to submission

### Stage 1: Finish the product contract

Before building Android screens, define the first release precisely. The first Play Store version should be a focused reading/community app, not an unfinished marketplace.

The release should contain:

- Public discovery and search.
- Authentication and profile management.
- Published story detail pages.
- Chapter reading.
- Saved library.
- Reading progress.
- Writer submission flow.
- Admin moderation.
- Reports and community guidelines.
- Account deletion.
- Privacy policy and terms links.

Do not advertise paid books, downloads, subscriptions, or creator earnings until those systems exist. The repository currently has no products, prices, orders, entitlements, payments, refunds, or payout ledger.

### Stage 2: Build the Android client

Create a mobile project with:

- A unique reverse-domain package name such as `com.blossomstories.app`.
- Android API 36 target support.
- Release signing through Play App Signing.
- Separate development, staging, and production API URLs.
- Secure token storage rather than browser-only session assumptions.
- Deep links for books, authors, and journals.
- A mobile navigation model that does not depend on desktop header behavior.
- Android back-button handling.
- Loading, empty, offline, and retry states.
- Screen-reader labels, scalable text, sufficient contrast, and touch targets.
- Crash reporting that excludes tokens and private content.

For reading, implement a reliable mobile model:

- Resume the last chapter.
- Save progress with retry and conflict-safe behavior.
- Keep the current chapter available when the network briefly drops.
- Clearly distinguish cached reading from downloaded offline books.
- Avoid storing unrestricted premium content locally until entitlement and DRM decisions are complete.

### Stage 3: Complete backend production readiness

The backend is improved but still needs release-grade operations.

Implement:

- Account deletion and anonymization.
- Email verification or an explicit trust model for the selected identity provider.
- Session revocation and account recovery.
- Centralized error tracking.
- Structured logs with request IDs.
- API latency and database query metrics.
- Alerting for elevated error rates, failed uploads, failed notifications, and database saturation.
- Redis-backed rate limiting once more than one server instance is used.
- Background jobs for notifications, moderation processing, image resizing, and search indexing.
- Database backups and tested restoration.
- Migration checks against a clean database and a copy of production data.
- A rollback plan for every release.

The current in-memory rate limiter is only a baseline. It does not coordinate across multiple server processes and its state disappears when the process restarts.

### Stage 4: Make user-generated content policy-ready

Blossom is a user-generated content platform. Google’s review process will care about how users publish and interact, not only about the reader UI.

Implement and document:

- Terms of service acceptance.
- Community guidelines at onboarding and from the report flow.
- Report, block, and mute actions.
- Moderation queues with priority and SLA.
- Moderator audit logs.
- Repeat-offender actions.
- Copyright complaint and takedown workflow.
- Age/content classification appropriate to the catalog.
- Automated spam and abuse detection.
- A support contact and escalation process.

A Christian positioning does not remove the need for objective moderation rules. The rules must cover harassment, hate, sexual content, exploitation, spam, copyright infringement, impersonation, and unsafe links.

### Stage 5: Add commerce only after the free loop retains users

If premium books are part of the business plan, implement the commercial model before advertising it in the Play listing.

The backend needs separate concepts for:

- A work and its editions.
- Offers, prices, currencies, and regional availability.
- Orders and payment-provider references.
- Entitlements that control chapter access.
- Refunds and revocations.
- Creator earnings ledger.
- Payout thresholds and payout status.
- Receipts and customer support records.

For Android distribution, confirm the applicable Google Play payments requirements before choosing a payment flow. Do not add an external checkout link to bypass required Play billing rules without a policy review.

### Stage 6: Release engineering and Play Console

Create a release pipeline that produces an Android App Bundle (`.aab`) for each environment.

The pipeline should:

- Run typecheck and tests.
- Run mobile lint and unit tests.
- Run backend integration tests.
- Build a signed staging bundle.
- Run smoke tests on physical and emulator devices.
- Upload symbols and crash metadata.
- Generate a production bundle only from a protected tag.
- Record the commit SHA in the app.
- Support staged rollout and rollback.

Prepare Play Console assets and declarations:

- App name and short description.
- Full description that matches the actual app.
- App icon.
- Feature graphic.
- Phone screenshots at required sizes.
- Tablet screenshots if tablet support is claimed.
- Content rating questionnaire.
- Target audience and age declarations.
- Data safety form.
- Privacy policy URL.
- Account deletion URL.
- App access instructions for reviewers.
- Test credentials if parts of the app require login.
- Support email and website.
- Countries and age availability.

Run internal testing first, then closed testing with real readers and writers. Track crash-free sessions, sign-in success, first chapter completion, progress persistence, upload success, report handling, and account deletion before requesting production access.

## Definition of “ready for Play Store submission”

The app is ready to submit only when all of the following are true:

| Area | Exit condition |
|---|---|
| Android packaging | Signed `.aab` builds successfully and targets API 36 or higher |
| Authentication | Sign-in, sign-out, session expiry, recovery, and reviewer access work on Android |
| Reader | A user can discover, read, resume, and complete a real published story |
| Offline behavior | Network failures are handled without corrupting progress or showing misleading states |
| Account deletion | In-app and web deletion request paths exist and are tested |
| Privacy | Privacy policy, terms, data inventory, and Data safety answers match the release build |
| Community safety | Report, moderation, block/mute, copyright, and escalation processes are operational |
| Backend | Rate limits, backups, monitoring, migrations, and rollback are tested |
| Content | There is enough legitimate, moderated, high-quality content for a first-time user |
| Store listing | Screenshots, descriptions, ratings, support contact, and access instructions are complete |
| Testing | Internal and closed testing have no release-blocking crashes or data-loss defects |

## Recommended next engineering tickets

1. Create the mobile project and choose Expo or Capacitor after deciding the offline and notification requirements.
2. Implement `delete account` API, UI, public web request page, and tests.
3. Add privacy policy, terms, community guidelines, and copyright policy pages.
4. Create a data inventory for the Data safety form.
5. Add centralized error tracking and request correlation IDs.
6. Add integration tests using a disposable MySQL-compatible database.
7. Add block, mute, report triage, and moderator audit events.
8. Add mobile deep links and secure authentication storage.
9. Add mobile reader retry/offline states and progress conflict handling.
10. Build a signed API 36 Android App Bundle in CI.
11. Conduct internal testing with at least one writer, one moderator, and several readers.
12. Decide whether monetization is part of version one; if yes, implement entitlements before publishing any premium claim.

## Final recommendation

Do not submit the current web repository to Play Store yet. First create the Android delivery layer and close the policy blockers, especially account deletion, privacy, Data safety, content moderation, and reviewer access. At the same time, keep the first Android release narrow: reliable discovery, reading, saving, progress, community safety, and writer publishing.

Once that version works on real Android devices and survives closed testing, add monetization and deeper creator economics. This sequence reduces review risk and prevents the app from becoming a store listing that promises more than the product can deliver.

## References

[1]: https://developer.android.com/google/play/requirements/target-sdk "Meet Google Play's target API level requirement"
[2]: https://support.google.com/googleplay/android-developer/answer/13327111?hl=en "Understanding Google Play’s app account deletion requirements"
[3]: https://support.google.com/googleplay/android-developer/answer/10787469?hl=en "Provide information for Google Play's Data safety section"
