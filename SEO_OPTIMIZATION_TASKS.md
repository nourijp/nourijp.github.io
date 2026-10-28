# SEO Optimization & Internal Link Tasks for hamednouri.com

**Created:** December 23, 2024  
**Status:** In Progress  
**Total HTML Pages:** 57 index.html files  
**Files with myportfolio references:** 93 files  

---

## Overview

This document tracks all tasks needed to make the portfolio website fully SEO-friendly and remove all external myportfolio.com references.

---

## Phase 0: Branding Updates (Priority: HIGHEST)

### Task 0.1: Rename "Hamed N." to "Hamed Nouri" ✅ COMPLETE
- [x] Replace all occurrences of "Hamed N." with "Hamed Nouri" in:
  - `<title>` tags
  - `<meta property="og:title">` tags
  - Page content
- **Files affected:** 98 HTML files
- **Method:** Bulk find/replace using sed
- **Completed:** December 23, 2024

---

## Phase 1: Critical SEO Infrastructure (Priority: HIGH)

### Task 1.1: Create robots.txt ✅ COMPLETE
- [x] Create `/robots.txt` file
- [x] Allow all crawlers
- [x] Point to sitemap.xml

### Task 1.2: Create sitemap.xml ✅ COMPLETE
- [x] Generate sitemap with all 57+ pages
- [x] Include changefreq and priority
- [ ] Submit to Google Search Console (manual step - user action required)

### Task 1.3: Fix Canonical URLs ✅ COMPLETE
- [x] Replace all `<link rel="canonical" href="https://ncc.myportfolio.com/...">` with `https://hamednouri.com/...`
- [x] Affects ~93 files - ALL UPDATED

---

## Phase 2: Meta Tag Optimization (Priority: HIGH)

### Task 2.1: Add Meta Descriptions ⬜
Each page needs a unique `<meta name="description" content="...">` tag.

**Pages to update:**
- [ ] Homepage (`/index.html`)
- [ ] Media section (`/media/index.html` + 4 sub-pages)
- [ ] Experience section (`/experience/index.html` + 11 sub-pages)
- [ ] Awards section (`/awards/index.html` + 5 sub-pages)
- [ ] Skills section (`/skills/index.html` + 20 sub-pages)
- [ ] Work section (`/work/` + 9 sub-pages)

### Task 2.2: Update og:title and og:image ⬜
- [ ] Ensure all pages have proper Open Graph tags
- [ ] Update og:url to use hamednouri.com domain

---

## Phase 3: Remove External MyPortfolio Links (Priority: HIGH)

### Task 3.1: Update Canonical URLs ✅ COMPLETE
All `ncc.myportfolio.com` canonical links replaced with `hamednouri.com`.

### Task 3.1b: Download CDN Images Locally ✅ COMPLETE
- Downloaded 152 images from `cdn.myportfolio.com` to `/cdn_images/` folder
- Updated all HTML files to reference local images
- Total local images: 123MB
- Removes external dependency on Adobe Portfolio CDN

### Task 3.2: Update Internal Navigation Links ⬜
- [ ] Check all `<a href="...">` links pointing to myportfolio.com
- [ ] Replace with internal relative paths

### Task 3.3: Update CSS/JS References ⬜
- [ ] Audit external CDN references
- [ ] Ensure all assets load from local files

---

## Phase 4: Image Optimization (Priority: MEDIUM)

### Task 4.1: Add Alt Text to Images ⬜
- [ ] Scan all `<img>` tags without alt attributes
- [ ] Add descriptive alt text for accessibility and SEO

### Task 4.2: Optimize Image Sizes ⬜
- [ ] Identify large images that could be compressed
- [ ] Consider WebP format for better performance

---

## Phase 5: Structured Data (Priority: MEDIUM)

### Task 5.1: Add JSON-LD Schema Markup ⬜
- [ ] Add Person schema to homepage
- [ ] Add WebSite schema
- [ ] Add BreadcrumbList schema for navigation

---

## Phase 6: Technical SEO (Priority: LOW)

### Task 6.1: Page Speed Optimization ⬜
- [ ] Minify CSS files
- [ ] Minify JS files
- [ ] Enable compression (handled by GitHub Pages)

### Task 6.2: Mobile-Friendly Check ⬜
- [ ] Verify all pages pass mobile-friendly test
- [ ] Check viewport meta tags

---

## Page Inventory

### Main Pages (5)
| Page | Path | Status |
|------|------|--------|
| Homepage | `/index.html` | ⬜ |
| Media | `/media/index.html` | ⬜ |
| Experience | `/experience/index.html` | ⬜ |
| Awards | `/awards/index.html` | ⬜ |
| Skills | `/skills/index.html` | ⬜ |

### Media Sub-Pages (4)
| Page | Path | Status |
|------|------|--------|
| Life in Hokkaido | `/media/life-in-hokkaido/` | ⬜ |
| NHK BS1 2018 | `/media/nhk-bs1-2018/` | ⬜ |
| NHK Isuramu Konna Kanji | `/media/nhk-isuramu-konna-kanji/` | ⬜ |
| NHK Manga de Shiru Isuramu | `/media/nhk-manga-de-shiru-isuramu/` | ⬜ |

### Experience Sub-Pages (11)
| Page | Path | Status |
|------|------|--------|
| Aya & Sura | `/experience/aya-sura/` | ⬜ |
| CiraConnect | `/experience/ciraconnect/` | ⬜ |
| DIYDaisy | `/experience/diydaisy/` | ⬜ |
| FANS Conference | `/experience/fans-conference/` | ⬜ |
| IELI | `/experience/ieli/` | ⬜ |
| JET Programme | `/experience/jet-programme/` | ⬜ |
| Muslim Manga | `/experience/mmanga/` | ⬜ |
| UKM | `/experience/ukm/` | ⬜ |
| Univ. of North Texas | `/experience/university-of-north-texas/` | ⬜ |
| Univ. of Texas | `/experience/university-of-texas/` | ⬜ |
| WWOOF Japan | `/experience/wwoof-japan/` | ⬜ |
| Zayn & Myza | `/experience/zayn-myza/` | ⬜ |

### Awards Sub-Pages (5)
| Page | Path | Status |
|------|------|--------|
| 1st Place BPA Web Design | `/awards/1st-place-bpa-web-design/` | ⬜ |
| 1st Place Dallas Japanese Speech | `/awards/1st-place-dallas-japanese-speech-contest/` | ⬜ |
| Best Global Comics | `/awards/best-global-comics-graphic-novels/` | ⬜ |
| JET Kizuna Ambassador | `/awards/jet-kizuna-ambassador/` | ⬜ |
| Narrative House 2nd Place | `/awards/narrative-house-2nd-place-apps-website/` | ⬜ |

### Skills Sub-Pages (20)
| Page | Path | Status |
|------|------|--------|
| Adobe | `/skills/adobe/` | ⬜ |
| Adobe Animate | `/skills/adobe-animate/` | ⬜ |
| Adobe Audition | `/skills/adobe-audition/` | ⬜ |
| Adobe Premiere Pro | `/skills/adobe-premier-pro/` | ⬜ |
| CSS | `/skills/css/` | ⬜ |
| Facebook Creator | `/skills/facebook-creator/` | ⬜ |
| GitHub | `/skills/github/` | ⬜ |
| Google Analytics | `/skills/google-analytics/` | ⬜ |
| HTML | `/skills/html/` | ⬜ |
| Illustrator | `/skills/illustrator/` | ⬜ |
| InDesign | `/skills/indesign/` | ⬜ |
| Java | `/skills/java/` | ⬜ |
| Linux | `/skills/linux/` | ⬜ |
| macOS/iOS/iPadOS | `/skills/macos-ios-ipados/` | ⬜ |
| Microsoft Windows | `/skills/microsoft-windows/` | ⬜ |
| More Skills | `/skills/more-skills/` | ⬜ |
| Notion | `/skills/notion/` | ⬜ |
| Photoshop | `/skills/photoshop/` | ⬜ |
| Procreate | `/skills/procreate/` | ⬜ |
| WordPress | `/skills/wordpress/` | ⬜ |

### Work Sub-Pages (9)
| Page | Path | Status |
|------|------|--------|
| Children's Books | `/work/childrens-books/` | ⬜ |
| Edit | `/work/edit/` | ⬜ |
| Manga | `/work/manga/` | ⬜ |
| Photography | `/work/photography/` | ⬜ |
| Social Media | `/work/social-media-accomplishments/` | ⬜ |
| Voice | `/work/voice/` | ⬜ |
| Web | `/work/web/` | ⬜ |
| Webtoons | `/work/webtoons/` | ⬜ |
| Writing/Editing | `/work/writingediting/` | ⬜ |

---

## Progress Log

| Date | Task | Status |
|------|------|--------|
| Dec 23, 2024 | Created task document | ✅ |
| Dec 23, 2024 | Task 0.1 - Rename Hamed N. to Hamed Nouri (98 files) | ✅ |
| Dec 23, 2024 | Task 1.1 - robots.txt | ✅ |
| Dec 23, 2024 | Task 1.2 - sitemap.xml | ✅ |
| Dec 23, 2024 | Task 1.3 - Fix canonical URLs | ✅ |
| Dec 23, 2024 | Task 3.1 - Update canonical URLs | ✅ |

---

## Notes

- GitHub Pages automatically handles gzip compression
- GitHub Pages has built-in CDN for fast delivery
- Custom domain `hamednouri.com` is already configured
- Site uses Typekit fonts (may need to verify domain in Adobe Fonts dashboard)
