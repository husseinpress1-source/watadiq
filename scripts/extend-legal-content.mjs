/**
 * Appends extra sections & paragraphs to legal-content JSON (run before merge-legal-sections).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'legal-content');

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
}

function save(name, data) {
  fs.writeFileSync(path.join(dir, name), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function appendParagraphs(sections, extras) {
  for (const [key, lines] of Object.entries(extras)) {
    if (!sections[key]) continue;
    sections[key].paragraphs ??= [];
    sections[key].paragraphs.push(...lines);
  }
}

const privacyEnExtra = {
  intro: [
    "This Policy is designed to meet expectations of international clients while reflecting how we operate from Iraq. It should be read together with our Terms of Service and any project-specific data addendum.",
    "We publish this document in Arabic and English. If translations differ, we work in good faith to align them; contact us if you need clarification for compliance reviews.",
  ],
  collect: [
    "We minimize collection: we do not ask for government ID on the marketing site, and we discourage sending passwords in plain email—use agreed secure channels for credentials during projects.",
  ],
  cookies: [
    "You may use browser controls to block cookies; essential site features may degrade. We honor Global Privacy Control (GPC) signals where technically feasible for optional analytics.",
  ],
  rights: [
    "For EU/UK visitors, we aim to respect applicable GDPR-style rights even when Iraq is our primary jurisdiction. Response times follow reasonable industry practice unless law sets a shorter deadline.",
  ],
  security: [
    "We maintain incident response playbooks, restrict production access, and review vendor security periodically. Clients may request a summary of controls relevant to their project under NDA.",
  ],
};

const privacyArExtra = {
  intro: [
    "صُمّمت هذه السياسة لتلبية توقعات العملاء الدوليين مع انعكاس طريقة عملنا من العراق. يُفضّل قراءتها مع شروط الخدمة وأي ملحق بيانات خاص بالمشروع.",
    "ننشر هذه الوثيقة بالعربية والإنجليزية. عند اختلاف الترجمات نعمل بحسن نية للتوافق؛ راسلنا إن احتجت توضيحاً لمراجعات الامتثال.",
  ],
  collect: [
    "نقلّل الجمع: لا نطلب هوية حكومية على الموقع التسويقي، وننصح بعدم إرسال كلمات مرور في البريد العادي—استخدم قنوات آمنة متفق عليها أثناء المشاريع.",
  ],
  cookies: [
    "يمكنك حجب cookies من المتصفح؛ قد تتأثر ميزات أساسية. نحترم إشارات GPC حيث أمكن تقنياً للتحليلات الاختيارية.",
  ],
  rights: [
    "لزوار الاتحاد الأوروبي/المملكة المتحدة نسعى لاحترام حقوق GDPR حيث تنطبق حتى عندما يكون العراق اختصاصنا الأساسي.",
  ],
  security: [
    "نحتفظ بخطط استجابة للحوادث ونقيّد الوصول للإنتاج ونراجع أمن الموردين دورياً. قد يطلب العميل ملخص ضوابط relevant للمشروع بموجب NDA.",
  ],
};

const privacyNewEn = {
  definitions: {
    title: "Definitions",
    bullets: [
      "«Personal data»: information relating to an identified or identifiable individual.",
      "«Processing»: any operation on personal data (collection, storage, use, disclosure, deletion).",
      "«Controller»: entity that decides why and how personal data is processed (usually WATAD for watadiq.com operations).",
      "«Processor»: entity processing data on behalf of a controller (hosting, email, analytics vendors).",
      "«Cookies»: small text files stored on your device; «local storage» includes similar browser storage APIs.",
    ],
    paragraphs: [
      "Project-specific definitions may appear in your statement of work or data processing addendum.",
    ],
  },
  international: {
    title: "International transfers",
    paragraphs: [
      "Our infrastructure and subprocessors may process data in countries other than your own (for example cloud regions in Europe, the United States, or the Middle East).",
      "When we transfer personal data internationally, we use appropriate safeguards such as standard contractual clauses, vendor certifications, or your written instructions in project contracts.",
      "You may request information about primary processing locations for your project by contacting info@watadiq.com.",
    ],
  },
  marketing: {
    title: "Marketing communications",
    paragraphs: [
      "We may send newsletters or service updates if you opt in or if we have another lawful basis under applicable law.",
      "Every marketing email includes an unsubscribe link or instructions. Transactional messages (invoices, project updates you requested) are not marketing.",
      "We do not sell your email address to list brokers.",
    ],
  },
};

const privacyNewAr = {
  definitions: {
    title: "تعريفات",
    bullets: [
      "«بيانات شخصية»: معلومات ت relate بشخص طبيعي محدد أو قابل للتحديد.",
      "«معالجة»: أي عملية على البيانات (جمع، تخزين، استخدام، إفصاح، حذف).",
      "«متحكم»: الجهة التي تحدد لماذا وكيف تُعالج البيانات (عادة وتد لعمليات watadiq.com).",
      "«معالج»: جهة تعالج نيابة عن المتحكم (استضافة، بريد، تحليلات).",
      "«Cookies»: ملفات نصية صغيرة على جهازك؛ «local storage» يشمل واجهات تخزين مشابهة في المتصفح.",
    ],
    paragraphs: ["قد تظهر تعريفات خاصة بالمشروع in وثيقة نطاق العمل أو ملحق معالجة البيانات."],
  },
  international: {
    title: "نقل دولي للبيانات",
    paragraphs: [
      "قد تُعالَج البيانات in بنية تحتية أو لدى معالجين in دول غير بلدك (مثل مناطق سحابية in أوروبا أو أمريكا أو الشرق الأوسط).",
      "عند النقل الدولي نستخدم ضمانات مناسبة مثل البنود التعاقدية المعيارية أو شهادات الموردين أو تعليماتك in العقد.",
      "يمكنك طلب معلومات about مواقع المعالجة الأساسية لمشروعك عبر info@watadiq.com.",
    ],
  },
  marketing: {
    title: "اتصالات تسويقية",
    paragraphs: [
      "قد نرسل نشرات أو تحديثات خدمة إذا اشتركت voluntarily أو عند وجود أساس قانوني آخر.",
      "كل رسالة تسويقية تتضمن إلغاء اشتراك. رسائل المعاملات (فواتير، تحديثات طلبتها) ليست تسويقاً.",
      "لا نبيع عنوان بريدك لوسطاء قوائم.",
    ],
  },
};

const termsEnExtra = {
  intro: [
    "These Terms are a general framework. Enterprise clients may negotiate master service agreements with additional security, insurance, or SLA commitments.",
  ],
  payment: [
    "Recurring retainers renew monthly or annually as stated on your invoice until cancelled per agreement notice periods.",
  ],
  liability: [
    "Client acknowledges that software and security involve inherent risk; no vendor can guarantee zero vulnerabilities.",
  ],
};

const termsArExtra = {
  intro: ["هذه الشروط إطار عام. عملاء enterprise قد يتفاوون on master service agreements with SLA إضافية."],
  payment: [" retainers المتكررة renew as on الفاتورة until إلغاء per notice periods."],
  liability: ["يقر العميل أن software والأمن involve risk؛ لا vendor يضمن zero vulnerabilities."],
};

const termsNewEn = {
  acceptable: {
    title: "Acceptable use",
    bullets: [
      "Do not use deliverables to distribute malware, spam, or unlawful content.",
      "Do not attempt unauthorized access to WATAD or client systems.",
      "Do not misrepresent WATAD as the publisher of your end-user content.",
      "Respect third-party platform rules (app stores, ad networks, payment providers).",
    ],
    paragraphs: [
      "We may report credible illegal activity to authorities when required or when necessary to protect victims.",
    ],
  },
  sla: {
    title: "Support & SLA",
    paragraphs: [
      "Response times for bugs and incidents depend on your support tier in the signed agreement (business hours vs 24/7).",
      "Unless an SLA is explicitly purchased, we do not guarantee specific uptime percentages for staging or internal tools.",
      "Emergency security patches for WATAD-managed hosting are prioritized according to severity and contract.",
    ],
  },
  forceMajeure: {
    title: "Force majeure",
    paragraphs: [
      "Neither party is liable for delay or failure caused by events beyond reasonable control (natural disasters, war, widespread outages, government actions, pandemics, major internet failures).",
      "The affected party will notify the other and resume performance as soon as practicable.",
    ],
  },
};

const termsNewAr = {
  acceptable: {
    title: "استخدام مقبول",
    bullets: [
      "لا تستخدم الم deliverables ل malware أو spam أو محتوى unlawful.",
      "لا تحاول وصولاً غير مصرح لأنظمة وتد أو العميل.",
      "لا ت misrepresent وتد as ناشر محتوى end-user.",
      "احترم rules منصات طرف ثالث (متاجر، إعلانات، دفع).",
    ],
    paragraphs: ["قد نبلّغ authorities عند illegal activity credible when required."],
  },
  sla: {
    title: "الدعم واتفاقية مستوى الخدمة",
    paragraphs: [
      "أزمنة ال response لل bugs depend on support tier in الاتفاق.",
      "بدون SLA purchased لا نضمن uptime محدد for staging.",
      "security patches for استضافة managed prioritized by severity والعقد.",
    ],
  },
  forceMajeure: {
    title: "قوة قاهرة",
    paragraphs: [
      "لا يُ responsable طرف عن delay بسبب events beyond control (كوارث، حرب، outages، إجراءات حكومية، pandemics).",
      "يُ notify الطرف المتأثر وي resume performance ASAP.",
    ],
  },
};

for (const [file, extras, extraSections] of [
  ['privacy-sections.en.json', privacyEnExtra, privacyNewEn],
  ['privacy-sections.ar.json', privacyArExtra, privacyNewAr],
  ['terms-sections.en.json', termsEnExtra, termsNewEn],
  ['terms-sections.ar.json', termsArExtra, termsNewAr],
]) {
  const data = load(file);
  appendParagraphs(data, extras);
  Object.assign(data, extraSections);
  save(file, data);
}

console.log('Extended legal content JSON files.');
