/**
 * One-shot polish: marketing copy + string cleanup + legal section fixes → ar.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arPath = path.join(root, 'src', 'i18n', 'locales', 'ar.json');
const legalDir = path.join(root, 'scripts', 'legal-content');
const patchPath = path.join(root, 'scripts', 'ar-marketing-polish.json');

function deepMerge(target, source) {
  if (source === null || typeof source !== 'object' || Array.isArray(source)) {
    return source;
  }
  const out = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = out[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
      out[key] = deepMerge(tv, sv);
    } else {
      out[key] = sv;
    }
  }
  return out;
}

function polishString(s) {
  if (typeof s !== 'string') return s;
  let t = s;
  t = t.replace(/\u2014/g, '،').replace(/—/g, '،');
  t = t.replace(/\s-\s/g, '، ');
  t = t.replace(/,\s(?=[\u0600-\u06FF])/g, '، ');
  t = t.replace(/ to /gi, (m, off, str) => {
    const before = str.slice(Math.max(0, off - 20), off);
    if (/[\u0600-\u06FF]/.test(before)) return ' إلى ';
    return m;
  });
  t = t.replace(/سيberani/g, 'السيبراني');
  return t;
}

function walkStrings(obj, fn) {
  if (typeof obj === 'string') return fn(obj);
  if (Array.isArray(obj)) return obj.map((v) => walkStrings(v, fn));
  if (obj && typeof obj === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(obj)) o[k] = walkStrings(v, fn);
    return o;
  }
  return obj;
}

const LEGAL_PHRASES = [
  ['لل engagements النشطة', 'للتعاقدات النشطة'],
  ['البometrics', 'القياسات الحيوية'],
  ['الت minimization', 'تقليل البيانات'],
  ['المعالجة السابقة lawful', 'المعالجة السابقة المشروعة'],
  ['ت relate بشخص', 'تتصل بشخص'],
  ['local storage', 'التخزين المحلي'],
  ['cookies', 'ملفات تعريف الارتباط'],
  ['Cookies', 'ملفات تعريف الارتباط'],
  ['opt-out', 'إلغاء الاشتراك'],
  ['suppression', 'قائمة الاستبعاد'],
  ['retention أطول', 'فترة احتفاظ أطول'],
  ['م hardened', 'مُقوّاة'],
  ['engagement', 'التعاقد'],
  ['relevant', 'ذات الصلة'],
  ['unsubscribe', 'إلغاء الاشتراك'],
  ['info@watadiq.com —', 'info@watadiq.com،'],
  ['البيانات in ', 'البيانات في '],
  [' in بنية', ' في بنية'],
  [' in دول', ' في دول'],
  [' in أوروبا', ' في أوروبا'],
  [' in العقد', ' في العقد'],
  ['about مواقع', 'عن مواقع'],
  ['voluntarily', 'طوعاً'],
  ['in وثيقة', 'في وثيقة'],
  ['m harassing', 'مضايقة'],
  ['agreement م written', 'اتفاق مكتوب'],
  ['ال scraping', 'الجمع الآلي'],
  ['force majeure', 'القوة القاهرة'],
  ['quote', 'تسعير'],
  ['retainers المتكررة renew as on الفاتورة until إلغاء per notice periods', 'تتجدد الاشتراكات الدورية كما هو موضح في الفاتورة حتى الإلغاء وفق مدة الإشعار'],
  ['الم deliverables', 'المخرجات'],
  ['الم created', 'المُنشأة'],
  ['الم used', 'المستخدمة'],
  ['know-how', 'الخبرة الفنية'],
  ['boilerplate', 'القوالب البرمجية'],
  ['portfolio', 'معرض الأعمال'],
  ['visuals', 'المواد المرئية'],
  ['open-source', 'مفتوحة المصدر'],
  ['ت indemnifies', 'تُ indemnifies'],
  ['gross negligence', 'الإهمال الجسيم'],
  ['public دون', 'علنية دون'],
  ['independently', 'بشكل مستقل'],
  ['legitimately', 'بشكل مشروع'],
  ['m advisers', 'المستشارين'],
  ['seeking protective measures', 'طلب إجراءات ح protective'],
  ['consistent with', 'بما يتوافق مع'],
  ['fitness لنتيجة business', 'ملاءمة لنتيجة تجارية'],
  ['beyond جهود integration', 'بما يتجاوز جهود الربط'],
  ['indirect', 'غير مباشرة'],
  ['theory of liability', 'نظرية المسؤولية'],
  ['involve risk', 'تتضمن مخاطر'],
  ['zero vulnerabilities', 'صفر ثغرات'],
  ['willful misconduct', 'سوء نية متعمد'],
  ['where non-waivable', 'حيث لا يجوز التنازل عنها'],
  ['misuse', 'إساءة الاستخدام'],
  ['wind-down', 'إنهاء التشغيل'],
  ['reasonable عند', 'معقولة عند'],
  ['handover', 'التسليم'],
  ['conflict-of-law', 'تعارض القوانين'],
  ['arbitration', 'التحكيم'],
  ['seeking injunctive relief', 'طلب أمر قضائي'],
  ['misuse IP', 'إساءة استخدام الملكية الفكرية'],
  ['unlawful', 'غير مشروع'],
  ['misrepresent', 'انتحال صفة'],
  ['end-user', 'المستخدم النهائي'],
  ['rules منصات', 'قواعد المنصات'],
  ['authorities', 'الجهات المختصة'],
  ['illegal activity credible', 'نشاط غير قانوني موثوق'],
  ['when required', 'عند الاقتضاء'],
  ['response لل bugs', 'زمن الاستجابة للأعطال'],
  ['depend on support tier in الاتفاق', 'تعتمد على مستوى الدعم في الاتفاق'],
  ['uptime محدد for staging', 'زمن تشغيل محدد لبيئة التجريب'],
  ['security patches for استضافة managed', 'تصحيحات أمنية للاستضافة المُدارة'],
  ['responsable', 'مسؤول'],
  ['events beyond control', 'ظروف خارجة عن السيطرة'],
  ['pandemics', 'الأوبئة'],
  ['outages', 'انقطاع الخدمات'],
  ['notify', 'يُخطر'],
  ['resume performance ASAP', 'استئناف التنفيذ في أقرب وقت'],
  ['on master service agreements', 'اتفاقيات خدمات رئيسية'],
  ['enterprise', 'المؤسسات الكبرى'],
  ['M engagement', 'المشروع'],
  ['hardening', 'التقوية'],
  ['staging', 'البيئة التجريبية'],
  ['production', 'الإنتاج'],
  ['written', 'مكتوب'],
  ['scope أمني', 'نطاق أمني'],
  ['NDA', 'اتفاقية سرية'],
  ['GPC', 'تفضيلات الخصوصية العالمية'],
  ['UTM', 'وسوم الحملات'],
  ['CDN', 'شبكة التوزيع'],
  ['WAF', 'جدار حماية التطبيقات'],
  ['HTTPS/TLS', 'HTTPS/TLS'],
  ['GDPR', 'GDPR'],
  ['OWASP', 'OWASP'],
  ['SSL', 'SSL'],
  ['API', 'واجهة برمجة التطبيقات'],
  ['APIs', 'واجهات برمجة التطبيقات'],
  ['iOS', 'iOS'],
  ['Android', 'Android'],
  ['React', 'React'],
  ['Node', 'Node'],
  ['DevOps', 'DevOps'],
  ['CI/CD', 'CI/CD'],
  ['CMS', 'نظام إدارة المحتوى'],
  ['SEO', 'تحسين محركات البحث'],
  ['PWA', 'تطبيق ويب تقدمي'],
  ['SLA', 'اتفاقية مستوى الخدمة'],
  ['IQD', 'دينار عراقي'],
  ['MVP', 'الحد الأدنى للمنتج'],
  ['UI/UX', 'تصميم الواجهات وتجربة المستخدم'],
  ['50-50', '50% و50%'],
  ['50 50', '50% و50%'],
  ['10–14', '10 إلى 14'],
  ['3–4', '3 إلى 4'],
  ['3–7', '3 إلى 7'],
  ['30–365', '30 إلى 365'],
  ['Workflow', 'سير العمل'],
  ['Learn:', 'وضع التعلّم:'],
  ['Watch Party', 'مشاهدة جماعية'],
  ['Netflix', 'منصات البث'],
  ['AI', 'الذكاء الاصطناعي'],
  ['with اتفاقية مستوى الخدمة إضافية', 'مع اتفاقية مستوى خدمة إضافية'],
  ['م harassing', 'مضايقة'],
  ['للم deliverables', 'للمخرجات'],
  ['م embedded', 'المدمجة'],
  ['كما intended', 'كما هو مقصود'],
  ['proprietary', 'ملكية'],
  ['misleading', 'مضللة'],
  ['malware', 'برمجيات خبيثة'],
  ['accessibility', 'إمكانية الوصول'],
  ['الم advisers', 'المستشارين'],
  ['consistent مع', 'بما يتوافق مع'],
  ['uptime', 'زمن التشغيل'],
  ['conversions', 'التحويلات'],
  ['viral', 'الانتشار'],
  ['incidental', 'عرضية'],
  ['special', 'خاصة'],
  ['consequential', 'تابعة'],
  ['punitive', 'عقابية'],
  ['software', 'البرمجيات'],
  ['vendor', 'مزود'],
  ['fraud', 'الاحتيال'],
  ['archive export', 'تصدير الأرشيف'],
  ['rules التي', 'التي'],
  [' malware', ' برمجيات خبيثة'],
  [' spam', ' رسائل مزعجة'],
  ['purchased', 'المشتراة'],
  ['prioritized by severity', 'حسب الخطورة'],
  ['لا يُ مسؤول', 'لا يكون أي طرف مسؤولاً'],
  ['عن delay', 'عن التأخير'],
  ['IP خلفية', 'ملكية فكرية خلفية'],
  ['open-source', 'مفتوحة المصدر'],
];

function polishLegalString(s) {
  let t = polishString(s);
  for (const [from, to] of LEGAL_PHRASES) {
    t = t.split(from).join(to);
  }
  t = t.replace(/تُ indemnifies/g, 'تُعوّض');
  t = t.replace(/طلب إجراءات ح protective/g, 'طلب إجراءات وقائية');
  return t;
}

function polishLegalFile(name) {
  const p = path.join(legalDir, name);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const polished = walkStrings(data, polishLegalString);
  fs.writeFileSync(p, `${JSON.stringify(polished, null, 2)}\n`, 'utf8');
  console.log(`Polished ${name}`);
}

let ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'));
ar = deepMerge(ar, patch);
ar = walkStrings(ar, polishString);

for (const name of ['privacy-sections.ar.json', 'terms-sections.ar.json']) {
  polishLegalFile(name);
}

const privacySections = JSON.parse(
  fs.readFileSync(path.join(legalDir, 'privacy-sections.ar.json'), 'utf8'),
);
const termsSections = JSON.parse(
  fs.readFileSync(path.join(legalDir, 'terms-sections.ar.json'), 'utf8'),
);
ar.privacyPage.sections = privacySections;
ar.termsPage.sections = termsSections;

const pageCopy = {
  about: {
    paragraphs: [
      'تأسست وتد لمنح الشركات والمبدعين العراقيين مستوى الحرفية الرقمية الذي تقدمه كبرى مراكز التقنية في العالم. نجمع تصميماً دقيقاً وهندسة موثوقة وتفكيراً أمنياً في صميم العمل، ليكون كل منتج نطلقه راقياً وصامداً في ظروف الاستخدام الحقيقية.',
      'من الشركات الناشئة التي تطلق تطبيقها الأول إلى الشركات الراسخة التي تجدد حضورها الرقمي، نبقى قريبين من عملائنا ونحوّل الأفكار الجريئة إلى برمجيات تُسلَّم في وقتها.',
    ],
    mission: [
      'تمكين أجيال من رواد الأعمال والفنانين والمؤسسات العراقية من تحقيق النجاح والتأثير في الثقافة وبناء مستقبل رقمي أفضل، منتجاً بعد منتج.',
    ],
    missionList: [
      'بناء تجارب رقمية سريعة وسهلة الوصول وجذابة.',
      'حماية ما يهم بممارسات أمن سيبراني حديثة.',
      'البقاء إلى جانب العملاء من الاستراتيجية حتى الإطلاق وما بعده.',
    ],
    cards: [
      'مواقع تسويقية ولوحات تحكم ومنصات متكاملة، سريعة ومتجاوبة ومصممة لتحقيق النتائج.',
      'تجارب سلسة على iOS وAndroid، من النسخة الأولى إلى الإطلاق الإنتاجي.',
      'تدقيق وتقوية وبنية آمنة لحماية مستخدميك وبياناتك.',
    ],
  },
  expertise: {
    howWeWork: [
      'نحدّد الأهداف والجمهور والقيود قبل كتابة أي سطر برمجي.',
      'نصمّم مخططات ومرئيات تعكس هوية علامتك بدقة.',
      'نبني على مراحل بمعالم واضحة يمكنك متابعتها والموافقة عليها.',
      'نطلق مع النشر والمراقبة والدعم بعد التشغيل.',
    ],
  },
  team: {
    cards: [
      'مؤسس ومطور تطبيقات ومواقع، خبير بعدة لغات برمجية.',
      'مؤسس ومسؤول التسويق، ينمّي حضور وتد وعلاقات العملاء.',
    ],
    together: [
      'فريق صغير وتواصل مباشر، دون طبقات إدارية أو تأخير غير مبرر.',
      'التصميم والهندسة في مسار واحد منذ اليوم الأول.',
      'مراجعة أمنية قبل كل إطلاق، دون استثناء.',
    ],
  },
  contact: {
    next: [
      'نرد على معظم الرسائل خلال يوم عمل عراقي واحد.',
      'شاركنا ملخصاً أو ميزانية تقريبية أو موعداً؛ لا حاجة لوثيقة رسمية في البداية.',
      'نؤكد النطاق والجدول الزمني قبل بدء العمل.',
    ],
  },
};

try {
  ar.pages.about.sections[0].paragraphs = pageCopy.about.paragraphs;
  ar.pages.about.sections[1].paragraphs = pageCopy.about.mission;
  ar.pages.about.sections[1].list = pageCopy.about.missionList;
  for (let i = 0; i < 3; i++) {
    ar.pages.about.sections[2].cards[i].text = pageCopy.about.cards[i];
  }
  ar.pages.expertise.sections[1].list = pageCopy.expertise.howWeWork;
  ar.pages.team.sections[0].cards[0].text = pageCopy.team.cards[0];
  ar.pages.team.sections[0].cards[1].text = pageCopy.team.cards[1];
  ar.pages.team.sections[1].list = pageCopy.team.together;
  const contactNext = ar.pages.contact.sections.find((s) => s.id === 'contact-next');
  if (contactNext) contactNext.list = pageCopy.contact.next;
} catch (e) {
  console.warn('Page section patch skipped:', e.message);
}

fs.writeFileSync(arPath, `${JSON.stringify(ar, null, 2)}\n`, 'utf8');
console.log('Updated src/i18n/locales/ar.json');
