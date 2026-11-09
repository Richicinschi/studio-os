# Asset approval checklist

Run this before a marketing asset goes out.

## First pass

- [ ] The asset does the job it was made for
- [ ] The audience is the right one
- [ ] Nothing is visibly broken
- [ ] It fits the campaign goal

## Look

### Logo
- [ ] Right variant for this setting
- [ ] Clear space respected
- [ ] Not below the smallest allowed size
- [ ] Only approved colours
- [ ] Untouched: no edits to the mark
- [ ] Sits well on its background

### Colour
- [ ] Palette colours only
- [ ] Primary-to-secondary balance follows the 60/30/10 split
- [ ] Success, warning, error and info colours used for those meanings only
- [ ] No stray colours
- [ ] Applied the same way everywhere in the piece

### Type
- [ ] Brand fonts throughout
- [ ] Correct weights
- [ ] A clear hierarchy
- [ ] Sizes suit the medium
- [ ] Line height is comfortable
- [ ] No orphans or widows in body text (a lone line left at the top or bottom of a column, or a one-word last line)

### Imagery
- [ ] Follows the photography style
- [ ] Subjects are suitable
- [ ] Resolution and quality are good enough
- [ ] Licence held, credit given where owed
- [ ] Prepared for where it will be shown

## Accessibility

### Seeing it
- [ ] Normal text reaches 4.5:1 contrast and large text 3:1 (WCAG 2.1 success criterion 1.4.3, Contrast (Minimum), level AA)
- [ ] Interactive parts show focus
- [ ] Colour is never the only carrier of meaning
- [ ] Every image has alt text

### Reading it
- [ ] The layout can be scanned
- [ ] Font sizes are readable
- [ ] The reading order makes sense
- [ ] Headings form a real outline
- [ ] Link text says where the link goes

## Words

### Copy
- [ ] Sounds like the brand
- [ ] Tone fits the setting
- [ ] No banned words
- [ ] The offer is clear
- [ ] The call to action is clear and strong
- [ ] Proofread

### Messaging
- [ ] Agrees with the key messages
- [ ] Says what makes the brand different
- [ ] Leads with benefits, not features
- [ ] Speaks to the intended audience
- [ ] No claims that contradict each other

## Technical

### File
- [ ] Correct format
- [ ] Enough resolution
- [ ] Size kept down
- [ ] Named by the convention
- [ ] Metadata filled in

### Per platform
| Platform | Check |
|----------|-------|
| Instagram | [ ] Dimensions correct |
| Twitter/X | [ ] Requirements met |
| LinkedIn | [ ] Professional standard met |
| Facebook | [ ] Platform rules followed |
| Email | [ ] Light enough to load quickly in a mail client |
| Web | [ ] Optimised for the web |

## Legal

### Rights
- [ ] Stock images licensed
- [ ] Music and audio cleared
- [ ] No trademark conflict
- [ ] Permission for any user-made content
- [ ] Credits added where required

### Rules
- [ ] Required disclosures present
- [ ] Nothing misleading
- [ ] Prices correct
- [ ] Terms linked where needed
- [ ] Privacy obligations met

## Sign-off

Each area gets a reviewer name, a date and one outcome: passed, or sent back for changes.

- Visual design: reviewer ____ date ____ outcome ____
- Copy and content: reviewer ____ date ____ outcome ____
- Brand compliance: reviewer ____ date ____ outcome ____
- Technical: reviewer ____ date ____ outcome ____
- Legal: reviewer ____ date ____ outcome ____

When every outcome reads passed:

- [ ] Every area passed
- [ ] Any revisions are done
- [ ] The final file is uploaded
- [ ] Metadata is current
- [ ] Cleared for use

**Approved by:** _______________

**Date:** _______________

**Version:** _______________

## Frequent faults

| Fault | Remedy |
|-------|--------|
| Logo too small | Scale it up to the minimum |
| Wrong font | Swap in the brand font |
| Weak contrast | Change colours until the ratio passes |
| Colour outside the palette | Use the nearest palette colour |
| Soft or blurry image | Start from a larger source |
| No alt text | Write a description |
| Flat call to action | Rewrite it around the action |

## The automated part

`validate-asset.cjs` covers the file-level items only: filename convention, format, size limits and manifest registration. It does not check colours or pixel dimensions, so those boxes stay manual.

```bash
node brand/scripts/validate-asset.cjs <asset-path>
```

## After approval

- Mark the asset approved in `manifest.json`, with the approver's name and the time.
- Move earlier versions into the archive.
- Refresh the campaign tracker.
- Let the teams that use the asset know.
