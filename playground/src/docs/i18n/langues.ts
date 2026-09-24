/**
 * Les trente-deux langues du site.
 *
 * ## Le nom est dans la langue, pas dans la notre
 *
 * « Deutsch », pas « Allemand ». Quelqu un qui cherche sa langue dans une
 * liste ne lit pas la langue courante — c est meme precisement ce qu il n
 * arrive pas a faire. Un endonyme se reconnait sans etre lu.
 *
 * ## Ce que « traduction automatique » signale
 *
 * Le francais est la langue source : la prose y est ecrite, relue, et les
 * termes du domaine y ont ete choisis. L anglais est traduit a la main, parce
 * que c est la langue des identifiants et du code, et qu un decalage entre les
 * deux se verrait tout de suite.
 *
 * Les trente autres sont produites par machine. Le dire est le minimum : un
 * terme technique mal rendu n a pas la meme portee selon qu on le croit relu
 * ou non, et cacher l origine d une traduction fait porter au lecteur un doute
 * qu il ne peut pas lever.
 *
 * @module
 */

/** Ce qu on sait d une langue. */
export interface Langue {
  /** L etiquette BCP 47, posee sur `<html lang>`. */
  readonly code: string
  /** Le nom dans cette langue. */
  readonly nom: string
  /** Le drapeau, en emoji. */
  readonly drapeau: string
  /** Droite a gauche. Absent quand c est gauche a droite. */
  readonly rtl?: true
  /** Relue par une personne. Absent quand la machine a fait seule. */
  readonly relue?: true
}

/**
 * Les langues, dans l ordre ou elles se presentent.
 *
 * Les deux relues d abord, puis les autres par nombre de locuteurs. Un ordre
 * alphabetique sur les endonymes placerait le japonais et l arabe selon leur
 * graphie, ce qui ne veut rien dire pour personne.
 */
export const LANGUES: readonly Langue[] = [
  { code: 'fr', nom: 'Français', drapeau: '🇫🇷', relue: true },
  { code: 'en', nom: 'English', drapeau: '🇬🇧', relue: true },
  { code: 'es', nom: 'Español', drapeau: '🇪🇸' },
  { code: 'de', nom: 'Deutsch', drapeau: '🇩🇪' },
  { code: 'it', nom: 'Italiano', drapeau: '🇮🇹' },
  { code: 'pt', nom: 'Português', drapeau: '🇵🇹' },
  { code: 'nl', nom: 'Nederlands', drapeau: '🇳🇱' },
  { code: 'pl', nom: 'Polski', drapeau: '🇵🇱' },
  { code: 'ru', nom: 'Русский', drapeau: '🇷🇺' },
  { code: 'uk', nom: 'Українська', drapeau: '🇺🇦' },
  { code: 'cs', nom: 'Čeština', drapeau: '🇨🇿' },
  { code: 'sv', nom: 'Svenska', drapeau: '🇸🇪' },
  { code: 'da', nom: 'Dansk', drapeau: '🇩🇰' },
  { code: 'fi', nom: 'Suomi', drapeau: '🇫🇮' },
  { code: 'nb', nom: 'Norsk', drapeau: '🇳🇴' },
  { code: 'el', nom: 'Ελληνικά', drapeau: '🇬🇷' },
  { code: 'ro', nom: 'Română', drapeau: '🇷🇴' },
  { code: 'hu', nom: 'Magyar', drapeau: '🇭🇺' },
  { code: 'tr', nom: 'Türkçe', drapeau: '🇹🇷' },
  { code: 'ja', nom: '日本語', drapeau: '🇯🇵' },
  { code: 'ko', nom: '한국어', drapeau: '🇰🇷' },
  { code: 'zh', nom: '简体中文', drapeau: '🇨🇳' },
  { code: 'zh-TW', nom: '繁體中文', drapeau: '🇹🇼' },
  { code: 'th', nom: 'ไทย', drapeau: '🇹🇭' },
  { code: 'vi', nom: 'Tiếng Việt', drapeau: '🇻🇳' },
  { code: 'id', nom: 'Bahasa Indonesia', drapeau: '🇮🇩' },
  { code: 'hi', nom: 'हिन्दी', drapeau: '🇮🇳' },
  { code: 'bn', nom: 'বাংলা', drapeau: '🇧🇩' },
  { code: 'ar', nom: 'العربية', drapeau: '🇸🇦', rtl: true },
  { code: 'he', nom: 'עברית', drapeau: '🇮🇱', rtl: true },
  { code: 'fa', nom: 'فارسی', drapeau: '🇮🇷', rtl: true },
  { code: 'sw', nom: 'Kiswahili', drapeau: '🇰🇪' },
]

/** La langue source. Tout part d elle, et elle ne manque jamais une cle. */
export const LANGUE_SOURCE = 'fr'

/** La langue d un code, ou la source quand il ne dit rien de connu. */
export function langueDe(code: string): Langue {
  return (
    LANGUES.find((l) => l.code === code) ??
    (LANGUES[0] as Langue)
  )
}

/**
 * La langue a ouvrir, dans l ordre : le choix garde, puis celle du navigateur,
 * puis la source.
 *
 * Le navigateur annonce `fr-CA` la ou nous n avons que `fr` : on compare donc
 * sur la sous-etiquette principale, faute de quoi un visiteur canadien
 * tomberait sur l anglais par defaut sans que rien ne le justifie.
 */
export function langueInitiale(garde: string | null, annoncees: readonly string[]): string {
  if (garde !== null && LANGUES.some((l) => l.code === garde)) return garde

  for (const annoncee of annoncees) {
    const exacte = LANGUES.find((l) => l.code.toLowerCase() === annoncee.toLowerCase())
    if (exacte !== undefined) return exacte.code

    const racine = annoncee.split('-')[0]?.toLowerCase()
    const proche = LANGUES.find((l) => l.code.split('-')[0]?.toLowerCase() === racine)
    if (proche !== undefined) return proche.code
  }

  return LANGUE_SOURCE
}
