/**
 * Merges scripts/legal-content/*.json into src/i18n/locales/{en,ar}.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = path.join(root, 'src', 'i18n', 'locales');
const legalDir = path.join(root, 'scripts', 'legal-content');

for (const lng of ['en', 'ar']) {
  const localePath = path.join(localesDir, `${lng}.json`);
  const locale = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  locale.privacyPage.sections = JSON.parse(
    fs.readFileSync(path.join(legalDir, `privacy-sections.${lng}.json`), 'utf8'),
  );
  locale.termsPage.sections = JSON.parse(
    fs.readFileSync(path.join(legalDir, `terms-sections.${lng}.json`), 'utf8'),
  );
  fs.writeFileSync(localePath, `${JSON.stringify(locale, null, 2)}\n`, 'utf8');
  console.log(`Merged legal sections → ${lng}.json`);
}
