# Lance McHan, REALTOR® — Cornerstone Real Estate Group

Static marketing site for Lance McHan, REALTOR® (Stockton, CA) built with vanilla
HTML, CSS and JavaScript. No build step: every page is a plain `index.html`.

## Structure

```
index.html                  Home
sell/                       Sell my home + free home value form
buy/                        Buyer help + mortgage calculator + consultation
probate-trust/              Probate & trust property sales
divorce/                    Certified Divorce Real Estate Expert
55-plus/                    55+ community moves
areas/<city>/               Stockton, Lodi, Manteca, Tracy, Modesto, Elk Grove
neighborhood/<id>/<name>/   Elk Grove, Escalon, French Camp, Ripon
listing-detail/<id>/<slug>/ Featured property pages
featured-listing/  listing/  sold-listing/  open-house-listings/
open-house-listings-3/  mortgage-calculator/  home-mortgage/
about-lance-mchan/  reviews/  zillow-reviews/  contact/
assets/css/site.css         Design system (navy/charcoal + warm gold)
assets/js/site.js           Nav, scroll reveal, carousel, chooser, FAQ,
                            mortgage calculator, form handling
images/source/              Photography and logos from the business
sitemap.xml  robots.txt  favicon.svg
```

## Contact details used site-wide

- Phone: (209) 279-2235 (tap-to-call)
- Email: lance@lancemchan.com
- Office: 611 Lincoln Center, Stockton, CA 95207
- Lance McHan License ID 01987449 · Cornerstone Real Estate Group DRE 01037761

## Forms

Every form posts to the LeadrVision endpoint
`https://vision.leadrai.com/api/forms/5bb3e59ad8e846e89cd27d9cfe82b59f` with a
`_form` name, a `_page` return URL and a hidden `_gotcha` honeypot. Forms work
without JavaScript (plain POST, returning with `?submitted=1`); with JavaScript
they submit via `fetch()` and show the confirmation inline.

## Local preview

```
python3 -m http.server 8000
```

Root-relative links require serving over HTTP rather than opening files directly.
