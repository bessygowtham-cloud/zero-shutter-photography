# Zero Shutter Photography

Static single-page site for Zero Shutter Photography — wedding, maternity, baby and portrait photography.

## Structure

```
index.html              all page content
assets/css/style.css    styles (white theme, teal accent)
assets/js/main.js       nav, reveals, portfolio filters, lightbox, enquiry form
assets/images/          logo variants + gallery
```

## Run locally

```bash
npx serve -l 4321 .
```

## Notes for the client handover

- **Photos are Instagram-resolution (512×640).** They look fine on screen but should be
  replaced with full-resolution exports before launch. Drop replacements into
  `assets/images/gallery/` using the same filenames.
- **No maternity photographs were available** on either public Instagram account, so the
  portfolio filters are Weddings / Couples / Baby / Family. Add maternity images and a
  `data-cat="maternity"` filter once the photos exist.
- The enquiry form has no backend — it composes a WhatsApp message to +91 73585 61772.
  Swap for a form service (Formspree, Web3Forms) if email delivery is wanted.
- Testimonials are placeholder copy pending real client quotes.
