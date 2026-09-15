import { existsSync } from 'node:fs'
import { readdir, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { type ModuleId } from './modules.js'
import { scaffold } from './scaffold.js'
import { VERSIONS_FAMILLE } from './versions-famille.generated.js'
import {
  availableTemplates,
  detectPackageManager,
  inspectTarget,
  installCommand,
  runCommand,
  targetFileName,
  templatesRoot,
  toPackageName,
  validatePackageName,
} from './utils.js'

describe('detectPackageManager', () => {
  it.each([
    ['pnpm/10.28.2 npm/? node/v22.14.0 win32 x64', 'pnpm'],
    ['npm/10.9.0 node/v22.14.0 win32 x64', 'npm'],
    ['yarn/4.5.0 npm/? node/v22.14.0', 'yarn'],
    ['bun/1.1.30 npm/? node/v22.14.0', 'bun'],
  ])('reconnait %j', (agent, expected) => {
    expect(detectPackageManager(agent)).toBe(expected)
  })

  it('retombe sur npm face a un agent inconnu', () => {
    expect(detectPackageManager('gestionnaire-inconnu/1.0.0')).toBe('npm')
    expect(detectPackageManager('')).toBe('npm')
  })

  it('retombe sur npm quand l environnement ne dit rien', () => {
    // La valeur par defaut lit `npm_config_user_agent` : le test doit donc
    // maitriser l'environnement, sans quoi il mesure le gestionnaire qui a
    // lance la suite plutot que le comportement de la fonction.
    const previous = process.env['npm_config_user_agent']
    delete process.env['npm_config_user_agent']
    try {
      expect(detectPackageManager()).toBe('npm')
    } finally {
      if (previous !== undefined) process.env['npm_config_user_agent'] = previous
    }
  })
})

describe('commandes des gestionnaires', () => {
  it('produit la commande d installation', () => {
    expect(installCommand('pnpm')).toBe('pnpm install')
    expect(installCommand('yarn')).toBe('yarn')
  })

  it('produit la commande d execution de script', () => {
    expect(runCommand('npm', 'dev')).toBe('npm run dev')
    expect(runCommand('pnpm', 'dev')).toBe('pnpm dev')
  })
})

describe('toPackageName', () => {
  it.each([
    ['Mon Super Site !', 'mon-super-site'],
    ['  Espaces  ', 'espaces'],
    ['_prive', 'prive'],
    ['deja-valide', 'deja-valide'],
    ['---', 'odoro-app'],
  ])('transforme %j en %j', (input, expected) => {
    expect(toPackageName(input)).toBe(expected)
  })
})

describe('validatePackageName', () => {
  it('accepte un nom valide', () => {
    expect(validatePackageName('mon-site')).toBeUndefined()
  })

  it.each([
    ['', /vide/],
    ['Mon Site', /minuscules/],
    ['.cache', /commencer/],
    ['_prive', /commencer/],
  ])('refuse %j', (input, pattern) => {
    expect(validatePackageName(input)).toMatch(pattern)
  })

  it('refuse un nom trop long', () => {
    expect(validatePackageName('a'.repeat(215))).toMatch(/214/)
  })
})

describe('targetFileName', () => {
  it('restitue les fichiers pointes', () => {
    // npm renomme `.gitignore` en `.npmignore` a la publication : le fichier
    // est stocke sous `_gitignore` et restitue a la copie.
    expect(targetFileName('_gitignore')).toBe('.gitignore')
    expect(targetFileName('_env.example')).toBe('.env.example')
  })

  it('laisse les autres noms intacts', () => {
    expect(targetFileName('package.json')).toBe('package.json')
  })
})

describe('templatesRoot', () => {
  it('resout les templates depuis l emplacement du module, pas le dossier courant', () => {
    const root = templatesRoot()
    expect(existsSync(root)).toBe(true)
    expect(availableTemplates(root).length).toBeGreaterThan(0)
  })

  it('echoue clairement si les templates sont introuvables', () => {
    expect(() => templatesRoot(join(tmpdir(), 'nulle-part', 'module.js'))).toThrow(
      /introuvable/,
    )
  })
})

describe('echafaudage', () => {
  let workspace: string
  let templates: string
  let target: string

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'odoro-scaffold-'))
    templates = join(workspace, 'templates')
    target = join(workspace, 'projet')

    await mkdir(join(templates, 'demo', 'src'), { recursive: true })
    await writeFile(
      join(templates, 'demo', 'package.json'),
      JSON.stringify({ name: 'odoro-app', version: '0.0.0', private: true }, null, 2),
      'utf8',
    )
    await writeFile(join(templates, 'demo', '_gitignore'), 'node_modules/\n', 'utf8')
    await writeFile(join(templates, 'demo', 'src', 'main.ts'), 'export {}\n', 'utf8')
  })

  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true })
  })

  it('copie l arborescence du template', async () => {
    const { files } = await scaffold({
      target,
      template: 'demo',
      packageName: 'mon-site',
      root: templates,
    })

    expect([...files].sort()).toEqual(['.gitignore', 'package.json', 'src/main.ts'])
    expect(existsSync(join(target, 'src', 'main.ts'))).toBe(true)
  })

  it('restitue le nom des fichiers pointes', async () => {
    await scaffold({ target, template: 'demo', packageName: 'mon-site', root: templates })
    expect(existsSync(join(target, '.gitignore'))).toBe(true)
    expect(existsSync(join(target, '_gitignore'))).toBe(false)
  })

  it('reecrit le nom du paquet', async () => {
    await scaffold({ target, template: 'demo', packageName: 'mon-site', root: templates })
    const manifest = JSON.parse(await readFile(join(target, 'package.json'), 'utf8')) as {
      name: string
      private: boolean
    }
    expect(manifest.name).toBe('mon-site')
    // Le reste du manifeste est preserve.
    expect(manifest.private).toBe(true)
  })

  it('echoue sur un template inconnu', async () => {
    await expect(
      scaffold({ target, template: 'absent', packageName: 'x', root: templates }),
    ).rejects.toThrow(/Template inconnu/)
  })

  it('fusionne dans un dossier occupe', async () => {
    await mkdir(target, { recursive: true })
    await writeFile(join(target, 'NOTES.md'), 'a conserver\n', 'utf8')

    await scaffold({
      target,
      template: 'demo',
      packageName: 'mon-site',
      overwrite: 'fusionner',
      root: templates,
    })

    expect(existsSync(join(target, 'NOTES.md'))).toBe(true)
    expect(existsSync(join(target, 'package.json'))).toBe(true)
  })

  it('vide le dossier avant de copier, en conservant le depot git', async () => {
    await mkdir(join(target, '.git'), { recursive: true })
    await writeFile(join(target, 'ancien.txt'), 'a supprimer\n', 'utf8')

    await scaffold({
      target,
      template: 'demo',
      packageName: 'mon-site',
      overwrite: 'ecraser',
      root: templates,
    })

    expect(existsSync(join(target, 'ancien.txt'))).toBe(false)
    expect(existsSync(join(target, '.git'))).toBe(true)
    expect(existsSync(join(target, 'package.json'))).toBe(true)
  })
})

describe('inspectTarget', () => {
  let workspace: string

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'odoro-target-'))
  })

  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true })
  })

  it('signale un dossier absent', () => {
    expect(inspectTarget(join(workspace, 'nulle-part'))).toBe('absent')
  })

  it('signale un dossier vide', () => {
    expect(inspectTarget(workspace)).toBe('vide')
  })

  it('considere un dossier ne contenant qu un depot git comme vide', async () => {
    await mkdir(join(workspace, '.git'), { recursive: true })
    expect(inspectTarget(workspace)).toBe('vide')
  })

  it('signale un dossier occupe', async () => {
    await writeFile(join(workspace, 'fichier.txt'), 'x', 'utf8')
    expect(inspectTarget(workspace)).toBe('occupe')
  })
})

describe('aucune version inventee ne sort de l echafaudeur', () => {
  it('ne demande que des versions relevees, quelle que soit celle de la CLI', async () => {
    // Le defaut qui a motive ce releve : `odoro` en 1.0.3 demandait
    // `@odoro-cli/libs@^1.0.3`, restee en 1.0.2. La version n'existait pas et
    // `npm install` echouait a la premiere commande d'un projet neuf.
    const cible = await mkdtemp(join(tmpdir(), 'odoro-inventee-'))
    await scaffold({
      target: cible,
      template: 'react-ts',
      packageName: 'essai',
      modules: ['libs', 'router', 'icons', 'engine'],
      version: '42.0.0',
    })

    const manifeste = JSON.parse(await readFile(join(cible, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
    }

    for (const [nom, plage] of Object.entries({
      ...manifeste.dependencies,
      ...manifeste.devDependencies,
    })) {
      if (nom === 'odoro' || !nom.startsWith('@odoro-cli/')) continue
      expect(plage, nom).toBe(`^${VERSIONS_FAMILLE[nom] ?? ''}`)
      expect(plage, nom).not.toContain('42.0.0')
    }
  })
})

describe('les versions Odoro du manifeste', () => {
  it('posent la version de la CLI sur odoro, et la version publiee sur les voisins', async () => {
    // Les gabarits portaient `^0.0.0`, la version d'avant la premiere
    // publication. Un caret sur `0.0.x` est le plus etroit de tous : `^0.0.0`
    // ne correspond qu'a `0.0.0`. Chaque projet echafaude echouait donc a
    // l'installation, sur une erreur de resolution que personne n'aurait
    // rattachee au gabarit.
    const cible = await mkdtemp(join(tmpdir(), 'odoro-versions-'))

    try {
      await scaffold({
        target: cible,
        template: 'react-ts',
        packageName: 'essai',
        version: '1.2.3',
      })

      const manifeste = JSON.parse(
        await readFile(join(cible, 'package.json'), 'utf8'),
      ) as {
        dependencies: Record<string, string>
        devDependencies: Record<string, string>
      }

      // `odoro` est le seul paquet dont la CLI connait la version : la sienne.
      expect(manifeste.devDependencies['odoro']).toBe('^1.2.3')

      // Les voisins prennent la version relevee a la compilation, et non celle
      // de la CLI. Depuis la sortie du groupe `fixed`, les paquets avancent
      // chacun a leur rythme : poser le numero de la CLI sur tous demandait une
      // version qui n'existe pas, et l'installation echouait des la creation.
      const libs = manifeste.dependencies['@odoro-cli/libs']
      expect(libs).toBe(`^${VERSIONS_FAMILLE['@odoro-cli/libs'] ?? ''}`)
      expect(libs).not.toBe('^1.2.3')

      // Ce qui n'est pas de la famille ne bouge pas.
      expect(manifeste.dependencies['react']).not.toContain('1.2.3')
    } finally {
      await rm(cible, { recursive: true, force: true })
    }
  })
})

describe('la version par defaut', () => {
  it('est celle de la CLI, et jamais le repli', async () => {
    // Le repli `latest` existe pour qu'un echafaudage aboutisse malgre tout.
    // S'il se declenche en temps normal, les projets recoivent `latest` — ce
    // qui installerait une future version majeure sans que personne ne l'ait
    // demande. C'est exactement ce qui arrivait quand le chemin du manifeste
    // comptait des niveaux au lieu de les chercher.
    const cible = await mkdtemp(join(tmpdir(), 'odoro-defaut-'))

    try {
      await scaffold({ target: cible, template: 'react-ts', packageName: 'essai' })

      const manifeste = JSON.parse(
        await readFile(join(cible, 'package.json'), 'utf8'),
      ) as { devDependencies: Record<string, string> }

      expect(manifeste.devDependencies['odoro']).not.toBe('latest')
      expect(manifeste.devDependencies['odoro']).toMatch(/^\^\d+\.\d+\.\d+/)
    } finally {
      await rm(cible, { recursive: true, force: true })
    }
  })
})

describe('les modules retenus changent le projet ecrit', () => {
  /** Echafaude dans un dossier jetable et rend son contenu. */
  async function creer(modules: readonly ModuleId[]): Promise<{
    readonly dossier: string
    readonly fichiers: readonly string[]
    readonly deps: Record<string, string>
    readonly app: string
  }> {
    const dossier = await mkdtemp(join(tmpdir(), 'odoro-modules-'))
    const { files } = await scaffold({
      target: dossier,
      template: 'react-ts',
      packageName: 'essai',
      modules,
      version: '9.9.9',
    })
    const manifest = JSON.parse(
      await readFile(join(dossier, 'package.json'), 'utf8'),
    ) as { dependencies: Record<string, string> }
    return {
      dossier,
      fichiers: files,
      deps: manifest.dependencies,
      app: await readFile(join(dossier, 'src/App.tsx'), 'utf8'),
    }
  }

  it('ne livre jamais le dossier des variantes', async () => {
    // Le copier poserait les trois versions de App.tsx dans le projet.
    const { fichiers, dossier } = await creer(['libs', 'router', 'icons'])
    expect(fichiers.some((f) => f.startsWith('_variantes'))).toBe(false)
    expect(fichiers.some((f) => f.startsWith('.variantes'))).toBe(false)
    expect(existsSync(join(dossier, '_variantes'))).toBe(false)
    expect(existsSync(join(dossier, '.variantes'))).toBe(false)
  })

  it('ecrit les icones dans les dependances quand elles sont cochees', async () => {
    const { deps } = await creer(['libs', 'router', 'icons'])
    expect(deps['@odoro-cli/icons']).toBe(
      `^${VERSIONS_FAMILLE['@odoro-cli/icons'] ?? ''}`,
    )
    expect(deps['@odoro-cli/libs']).toBe(`^${VERSIONS_FAMILLE['@odoro-cli/libs'] ?? ''}`)
  })

  it('retire des dependances ce qui n a pas ete coche', async () => {
    const { deps } = await creer(['libs', 'router'])
    expect(deps['@odoro-cli/icons']).toBeUndefined()
    expect(deps['@odoro-cli/engine']).toBeUndefined()
    // React reste : il ne vient pas d'une case a cocher.
    expect(deps['react']).toBeDefined()
  })

  it('ajoute le moteur, que le gabarit ne declare pas', async () => {
    const { deps } = await creer(['libs', 'router', 'engine'])
    expect(deps['@odoro-cli/engine']).toBe(
      `^${VERSIONS_FAMILLE['@odoro-cli/engine'] ?? ''}`,
    )
  })

  it('n ajoute aucune dependance pour le registre', async () => {
    const { deps } = await creer(['libs', 'router', 'registre'])
    expect(Object.keys(deps).some((n) => n.includes('bits'))).toBe(false)
    expect(Object.keys(deps).some((n) => n.includes('registre'))).toBe(false)
  })

  it('sans routeur, retire router.tsx et pose une page unique', async () => {
    const { dossier, app, fichiers } = await creer(['libs', 'icons'])

    // `router.tsx` est le seul fichier qui nomme la dependance de routage :
    // sans routeur, il n'est importe par rien.
    expect(existsSync(join(dossier, 'src/router.tsx'))).toBe(false)
    expect(fichiers).not.toContain('src/router.tsx')
    expect(app).not.toContain("from '@/router'")

    // Les classes des bibliotheques restent : seul le routeur a ete retire.
    expect(app).toContain('o-flex')

    // La page unique porte les memes sections que la version routee — c'est ce
    // qui fait que les deux se ressemblent au lieu d'etre deux pages.
    for (const section of ['function Hero', 'function Piliers', 'function Cloture']) {
      expect(app, section).toContain(section)
    }
  })

  it('sans bibliotheques, pose une application nue et retire leur feuille', async () => {
    const { dossier, app, deps } = await creer([])
    expect(deps['@odoro-cli/libs']).toBeUndefined()
    expect(app).not.toContain("from '@odoro-cli/libs")
    expect(app).not.toContain('o-flex')

    const main = await readFile(join(dossier, 'src/main.tsx'), 'utf8')
    expect(main).not.toContain('@odoro-cli/libs/styles.css')

    // La feuille du projet doit alors porter les styles elle-meme : sans
    // jetons ni utilitaires, une feuille vide rendrait une page nue.
    const css = await readFile(join(dossier, 'src/styles.css'), 'utf8')
    expect(css).toContain('.app-shell')
    expect(css).toContain('prefers-color-scheme')
  })

  it('sans bibliotheques, aucun fichier ne mentionne un import qui n existe plus', async () => {
    const { dossier } = await creer([])
    for (const relatif of ['src/App.tsx', 'src/main.tsx', 'src/styles.css']) {
      const contenu = await readFile(join(dossier, relatif), 'utf8')
      expect(contenu, relatif).not.toContain("from '@odoro-cli/libs")
      expect(contenu, relatif).not.toContain("import '@odoro-cli/libs")
    }
  })

  it('rend le meme manifeste pour deux selections identiques', async () => {
    const a = await creer(['icons', 'libs', 'router'])
    const b = await creer(['libs', 'router', 'icons'])
    expect(Object.keys(a.deps)).toEqual(Object.keys(b.deps))
  })

  it('garde le gabarit complet quand rien n est precise', async () => {
    const dossier = await mkdtemp(join(tmpdir(), 'odoro-defaut-'))
    await scaffold({
      target: dossier,
      template: 'react-ts',
      packageName: 'essai',
      version: '9.9.9',
    })
    const app = await readFile(join(dossier, 'src/App.tsx'), 'utf8')
    // Le routeur est importe en une ligne, depuis le fichier qui le porte.
    expect(app).toContain("from '@/router'")
    expect(existsSync(join(dossier, 'src/router.tsx'))).toBe(true)
  })
})

describe('le tsconfig genere ne masque pas les paquets', () => {
  /**
   * `baseUrl` fait resoudre les imports nus depuis la racine du projet. Un
   * fichier `odoro.json` — celui que `odoro init` ecrit pour le registre — y
   * est alors trouve avant le paquet `odoro`, et `odoro.config.ts` echoue a la
   * compilation sur un `defineConfig` introuvable.
   *
   * La compilation d'un vrai projet l'a montre, pas ce test : il est ici pour
   * que le piege ne revienne pas.
   */
  it.each(['react-ts', 'react-ts-server'])(
    'le gabarit %s ne declare pas baseUrl',
    async (template) => {
      const dossier = await mkdtemp(join(tmpdir(), 'odoro-tsconfig-'))
      await scaffold({
        target: dossier,
        template,
        packageName: 'essai',
        version: '9.9.9',
      })

      const brut = await readFile(join(dossier, 'tsconfig.json'), 'utf8')
      expect(brut).not.toContain('baseUrl')

      // Les alias doivent survivre a son retrait : depuis TypeScript 4.1, les
      // chemins de `paths` se resolvent contre le tsconfig lui-meme.
      expect(brut).toContain('"@/*"')
    },
  )
})

describe('la page d accueil suit le dessin de la landing', () => {
  /** Echafaude et rend le contenu d'un fichier du projet. */
  async function lire(modules: readonly ModuleId[], relatif: string): Promise<string> {
    const dossier = await mkdtemp(join(tmpdir(), 'odoro-page-'))
    await scaffold({
      target: dossier,
      template: 'react-ts',
      packageName: 'essai',
      modules,
      version: '9.9.9',
    })
    return readFile(join(dossier, relatif), 'utf8')
  }

  it('pose un fond statique quand le moteur n est pas retenu', async () => {
    const fond = await lire(['libs', 'router', 'icons'], 'src/fond.tsx')
    expect(fond).not.toContain('useShaderSurface')
    expect(fond).toContain('radial-gradient')
  })

  it('pose un fond en surface WebGL quand le moteur est retenu', async () => {
    const fond = await lire(['libs', 'router', 'engine'], 'src/fond.tsx')
    expect(fond).toContain('useShaderSurface')
    // Le repli reste : une surface refusee ne doit pas laisser un trou.
    expect(fond).toContain('radial-gradient')
  })

  it('le fond du moteur ne depend d aucune classe utilitaire', async () => {
    // Il est pose meme sans les bibliotheques, ou les classes `o-*` n'existent
    // pas : une classe absente ne peint rien, et le fond serait invisible.
    const fond = await lire(['engine'], 'src/fond.tsx')
    expect(fond).toContain('useShaderSurface')
    expect(fond).not.toMatch(/className="[^"]*\bo-/)
  })

  it('donne le signe de la marque une taille, et non une classe arbitraire', async () => {
    // Une classe utilitaire a valeur arbitraire n'est emise que si le
    // compilateur l'a vue passer : absente, elle laisserait un SVG sans
    // dimensions, donc invisible.
    const app = await lire(['libs', 'router'], 'src/App.tsx')
    expect(app).toContain('width: taille')
    expect(app).not.toContain('o-size-[')
  })

  it('n ecrit aucun lien souligne parmi les boutons', async () => {
    const app = await lire(['libs', 'router'], 'src/App.tsx')
    for (const appel of app.match(/<a[^>]*buttonClasses\([^)]*\)[^>]*>/g) ?? []) {
      expect(app, appel).toContain('o-no-underline')
    }
  })

  it('importe le routeur en une seule ligne', async () => {
    // C'est la forme demandee : `App.tsx` porte la page, `router.tsx` porte le
    // routage, et le lien entre les deux tient sur une ligne.
    const app = await lire(['libs', 'router'], 'src/App.tsx')
    const lignes = app.split('\n').filter((l) => l.includes("from '@/router'"))
    expect(lignes).toHaveLength(1)
  })

  it('ne laisse aucun dossier de sections', async () => {
    // Tout s'ecrit dans `App.tsx` : un dossier `sections/` serait la structure
    // que cette forme remplace.
    const dossier = await mkdtemp(join(tmpdir(), 'odoro-plat-'))
    await scaffold({
      target: dossier,
      template: 'react-ts',
      packageName: 'essai',
      modules: ['libs', 'router', 'engine'],
      version: '9.9.9',
    })
    expect(existsSync(join(dossier, 'src/sections'))).toBe(false)
    expect(existsSync(join(dossier, 'src/composants'))).toBe(false)
    expect(existsSync(join(dossier, 'src/routes'))).toBe(false)
  })

  it('garde le meme dessin sans les bibliotheques', async () => {
    // Meme structure, meme marque, meme teinte — en CSS ordinaire.
    const css = await lire([], 'src/styles.css')
    expect(css).toContain('--marque: #3b82f6')
    expect(css).toContain('.fenetre')
    expect(css).toContain('.carte')
    // Sur l'import : le fichier dit en commentaire ce que les bibliotheques
    // auraient apporte, et cette phrase a sa place.
    const app = await lire([], 'src/App.tsx')
    expect(app).not.toContain("from '@odoro-cli/libs")
  })
})

describe('les gabarits n emploient que des classes qui existent', () => {
  /**
   * Le systeme de style n emet pas de classe a valeur arbitraire.
   *
   * `o-h-[42rem]` ne produit aucune regle, et une classe absente ne peint rien.
   * Le fond decoratif du gabarit en portait six : son conteneur mesurait zero
   * pixel de haut, ses deux nappes aussi, et il ne se voyait pas — sans que
   * rien ne le signale, ni a la compilation ni a l execution.
   *
   * Ce qui sort de l echelle s ecrit en style, ou il est sur.
   */
  it.each(['react-ts', 'react-ts-server'])(
    'le gabarit %s n invente aucune classe',
    async (template) => {
      const dossier = await mkdtemp(join(tmpdir(), 'odoro-classes-'))
      await scaffold({
        target: dossier,
        template,
        packageName: 'essai',
        modules: ['libs', 'router', 'icons', 'engine'],
        version: '9.9.9',
      })

      const trouvees: string[] = []
      const parcourir = async (racine: string): Promise<void> => {
        for (const entree of await readdir(racine, { withFileTypes: true })) {
          const chemin = join(racine, entree.name)
          if (entree.isDirectory()) {
            if (entree.name === 'node_modules') continue
            await parcourir(chemin)
            continue
          }
          if (!/\.tsx?$/.test(entree.name)) continue

          // Les commentaires sont retires avant la recherche : plusieurs citent
          // la forme interdite pour expliquer pourquoi elle l'est, et les
          // signaler ferait echouer le test sur la documentation de sa regle.
          const source = (await readFile(chemin, 'utf8')).replace(
            /\/\*[\s\S]*?\*\/|\/\/.*/g,
            '',
          )

          for (const classe of source.match(/o-[a-z0-9-]+\[[^\]"' ]+\]/g) ?? []) {
            trouvees.push(`${entree.name} : ${classe}`)
          }
        }
      }
      // Toute l'arborescence : le gabarit serveur range son application sous
      // `client/`, et ne scruter que `src/` l'aurait laissee de cote.
      await parcourir(dossier)

      expect(trouvees).toEqual([])
    },
  )
})
