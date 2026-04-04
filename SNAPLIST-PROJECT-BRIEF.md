# SnapList — Project Brief & V1 Specification

## TL;DR

**SnapList** is a mobile-first PWA that lets users snap a photo of any item, uses AI to identify it and auto-generate a complete marketplace listing (title, description, category, price), then cross-posts it to connected platforms (eBay, Facebook Marketplace, Mercari, OfferUp, etc.) in one tap.

The core value prop: **collapse the entire reselling workflow into one action.** Photo → AI → Listing → Post everywhere.

---

## Problem

Reselling is a massive market, but the listing process is the #1 friction point. To sell one item across multiple platforms, you currently have to:

1. Take photos and resize them per platform
2. Write a title and description (differently for each platform)
3. Research pricing / check comps
4. Select the right category (every platform uses different taxonomies)
5. Repeat steps 2-4 for every platform you want to list on

Most people have stuff sitting around they'd sell if it weren't such a pain. SnapList eliminates that friction entirely.

---

## Target User

- Casual resellers (closet cleanouts, moving, decluttering)
- Side-hustle resellers who flip items across platforms
- Anyone who thinks "I should sell this" but never does because listing is tedious

---

## Core User Flow (V1)

```
1. Open app → Tap camera icon
2. Take photo of item (or select from camera roll)
3. AI identifies the item and auto-generates:
   - Title
   - Description
   - Category
   - Suggested price (based on recent sold comps)
   - Condition estimate
4. User reviews the generated listing → edits anything the AI got wrong
5. User selects which connected platforms to post to (toggle checkboxes)
6. Tap "Post" → listing goes live on all selected platforms
7. Dashboard shows all active listings, views, and messages across platforms
```

---

## Feature Breakdown — V1 (MVP)

### 1. Photo Capture & AI Identification
- Camera integration (capture or select from gallery)
- Support multiple photos per listing (up to 8)
- AI-powered item identification using image recognition
- Auto-generate: title, description, category, condition, price suggestion
- Price suggestion pulled from recent sold/active comps across platforms

### 2. Listing Editor
- Pre-filled form with AI-generated content
- Editable fields: title, description, price, condition, category, shipping preferences
- Photo reorder / crop / rotate
- Preview how the listing will look on each platform

### 3. Platform Connections
- OAuth-based account linking for each marketplace
- V1 target platforms (prioritize based on API availability):
  - **eBay** (robust API, well-documented)
  - **Facebook Marketplace** (via Facebook Graph API — may have limitations)
  - **Mercari** (API access may require partnership)
  - **OfferUp** (limited API — may need workaround)
  - **Poshmark** (limited official API)
- Platform connection management screen (connect/disconnect)
- Status indicators showing which platforms are active

### 4. Cross-Post Engine
- Map one listing to each platform's unique format:
  - Category taxonomy translation (eBay categories ≠ FB categories ≠ Mercari categories)
  - Photo resizing/formatting per platform requirements
  - Field mapping (each platform has different required/optional fields)
  - Character limit enforcement per platform
- One-tap posting to all selected platforms simultaneously

### 5. Listing Dashboard
- View all active listings across all platforms in one place
- Status per platform (active, sold, expired, pending)
- Basic analytics: views, saves, messages
- Quick actions: mark as sold, edit, delete, relist

### 6. Auth & Onboarding
- Sign up / login (email + social auth)
- Guided onboarding: connect at least one platform
- Quick tutorial showing the snap → post flow

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React (PWA) | Mobile-first, installable, offline-capable |
| **Backend / DB** | Supabase | Auth, Postgres DB, Edge Functions, Realtime |
| **Image Recognition** | OpenAI Vision API (GPT-4o) | Primary — identify items, generate descriptions |
| **Fallback Recognition** | Google Cloud Vision API | Secondary — product detection, label detection |
| **Price Comps** | eBay Browse API + web scraping | Sold listings data for price suggestions |
| **Hosting** | Vercel | Frontend deployment |
| **Image Storage** | Supabase Storage | Photo uploads with CDN |
| **Platform APIs** | eBay API, Facebook Graph API, etc. | OAuth flows + listing creation endpoints |

---

## Data Model (Supabase / Postgres)

### Core Tables

```sql
-- Users
users (
  id uuid PRIMARY KEY,
  email text,
  display_name text,
  created_at timestamptz
)

-- Connected marketplace accounts
platform_connections (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  platform text, -- 'ebay', 'facebook', 'mercari', etc.
  access_token text (encrypted),
  refresh_token text (encrypted),
  platform_user_id text,
  connected_at timestamptz,
  status text -- 'active', 'expired', 'revoked'
)

-- Listings (source of truth)
listings (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  title text,
  description text,
  price decimal,
  condition text,
  category text,
  shipping_preference text,
  status text, -- 'draft', 'active', 'sold', 'expired'
  ai_generated_data jsonb, -- raw AI output for reference
  created_at timestamptz,
  updated_at timestamptz
)

-- Photos for each listing
listing_photos (
  id uuid PRIMARY KEY,
  listing_id uuid REFERENCES listings(id),
  storage_path text,
  display_order int,
  original_url text
)

-- Cross-post tracking
platform_listings (
  id uuid PRIMARY KEY,
  listing_id uuid REFERENCES listings(id),
  platform text,
  platform_listing_id text, -- ID on the external platform
  platform_url text,
  status text, -- 'pending', 'active', 'sold', 'error', 'expired'
  posted_at timestamptz,
  platform_specific_data jsonb -- category mappings, etc.
)
```

---

## AI Pipeline Detail

### Step 1: Image Recognition
```
Input: User photo(s)
Process:
  1. Send to OpenAI Vision API (GPT-4o)
  2. Prompt: "Identify this item. Return: product name, brand (if visible),
     category, estimated condition, key features, and a marketplace-ready
     title and description."
  3. Parse structured response
Output: { title, description, category, condition, brand, features[] }
```

### Step 2: Price Suggestion
```
Input: Identified item details (title, brand, category)
Process:
  1. Query eBay Browse API for recently sold items matching the identification
  2. Calculate: median sold price, price range (low/high), avg days to sell
  3. Factor in condition estimate
Output: { suggested_price, price_range: { low, high }, avg_days_to_sell }
```

### Step 3: Category Mapping
```
Input: AI-determined category
Process:
  1. Map to each platform's taxonomy using a maintained lookup table
  2. eBay: category_id from eBay taxonomy
  3. Facebook: product_category from FB commerce categories
  4. Mercari: category/subcategory from Mercari system
Output: { ebay_category_id, fb_category, mercari_category, ... }
```

---

## Design Direction

- **Dark mode forward** — primary dark UI with vibrant accent colors
- **Bold, high-contrast** — colorful CTAs, clear visual hierarchy
- **Playful micro-animations** — satisfying interactions on snap, post, sold
- **Mobile-first** — thumb-friendly, bottom navigation, swipe gestures
- **Camera-centric** — the camera/snap action should feel like the hero of the app
- **Minimal friction** — every screen should push toward "just post it"

### Key Screens
1. **Home / Dashboard** — active listings, quick stats, prominent "Snap" FAB button
2. **Camera / Capture** — full-screen camera with gallery option
3. **AI Review / Edit** — pre-filled listing form with AI confidence indicators
4. **Platform Select** — toggle which platforms to post to, preview per platform
5. **Post Confirmation** — success state with links to live listings
6. **Connections** — manage linked marketplace accounts
7. **Settings / Profile**

---

## Revenue Model (Future)

- **Freemium**: 5 free listings/month, unlimited with subscription
- **Pro tier**: $9.99/mo — unlimited listings, priority AI, analytics
- **Seller tier**: $19.99/mo — bulk listing tools, inventory management, sales tracking
- Optional: small % fee per tracked sale (if we can track conversions)

---

## Competitive Landscape

| Competitor | What they do | Where SnapList wins |
|-----------|-------------|-------------------|
| **Vendoo** | Cross-posting tool | No AI identification, manual entry still required |
| **List Perfectly** | Cross-posting + templates | Clunky UI, no photo-to-listing AI |
| **Crosslist** | Cross-posting | Desktop-focused, no mobile-first experience |
| **Google Lens** | Image identification | No listing creation or marketplace integration |

**SnapList's moat**: The AI-first, photo-to-post pipeline. Nobody owns the "snap a photo and it's listed everywhere" experience.

---

## V1 Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project scaffolding (React PWA + Supabase + Vercel)
- [ ] Auth flow (Supabase Auth — email + Google)
- [ ] Database schema setup
- [ ] Basic navigation and screen structure
- [ ] Dark mode UI foundation + design system

### Phase 2: Core AI Flow (Week 3-4)
- [ ] Camera integration (capture + gallery select)
- [ ] OpenAI Vision API integration for item identification
- [ ] Listing editor with AI pre-fill
- [ ] Photo upload to Supabase Storage
- [ ] Price suggestion engine (eBay comps API)

### Phase 3: Platform Integration (Week 5-7)
- [ ] eBay OAuth + listing creation API (start here — best documented)
- [ ] Facebook Marketplace integration
- [ ] Cross-post engine: category mapping + field translation
- [ ] Platform connection management UI
- [ ] Post to multiple platforms simultaneously

### Phase 4: Dashboard & Polish (Week 8)
- [ ] Listing dashboard with cross-platform status
- [ ] Edit / relist / mark as sold flows
- [ ] Micro-animations and transitions
- [ ] Error handling and edge cases
- [ ] PWA optimization (offline support, install prompt)

---

## Developer Accounts Needed

- [ ] **Supabase** — supabase.com (DB, auth, storage, edge functions)
- [ ] **Vercel** — vercel.com (frontend hosting + deployment)
- [ ] **OpenAI** — platform.openai.com (Vision API for item identification)
- [ ] **eBay Developer Program** — developer.ebay.com (listing API)
- [ ] **Facebook for Developers** — developers.facebook.com (Marketplace API)
- [ ] **Google Cloud** — console.cloud.google.com (Vision API fallback, Places API if needed)

---

## Key Technical Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Facebook Marketplace API is restrictive / requires app review | Start with eBay as primary, add FB in V1.1. Explore if Commerce API works for individual sellers. |
| Mercari / OfferUp / Poshmark don't have public APIs | V1 focuses on platforms with APIs. Explore browser automation or partnerships for others later. |
| AI misidentifies items | Always show AI output as editable suggestions, never auto-post without review. Show confidence score. |
| Price suggestions are inaccurate | Show price as a range with comps data, let user override easily. Label as "suggested." |
| Category mapping is complex | Build a maintained mapping table. Start with top 20 categories, expand over time. Use AI to help map. |

---

## Notes for Development

- **Primary target**: iOS users via PWA (add to home screen)
- **Build on Mac** using Cursor + Claude Code + Warp terminal
- **Git repo**: Set up on GitHub, deploy to Vercel via Git integration
- **Supabase project**: One project for auth + DB + storage + edge functions
- **Start with one platform** (eBay) and nail the AI → listing → post flow before adding more platforms
- **Design system first**: Establish colors, typography, components before building screens

---

## Working Name Options

- **SnapList** (snap + list — describes the action perfectly)
- **FlipSnap** (flip/resell + snap a photo)
- **ListLens** (listing + lens/camera)
- **PostSnap**
- **SnapSell**

Pick whatever feels right — or come up with something better.
