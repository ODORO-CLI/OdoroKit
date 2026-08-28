/** Documentation du composant Table. @module */

import { type ReactElement } from 'react'

import { Badge, type BadgeTone, Table, type TableColumn } from 'odoro-libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'
import {
  type ControlValue,
  PlaygroundBlock,
  jsxProps,
} from '../../components/PlaygroundBlock.jsx'

/** Une ligne du jeu de donnees de demonstration. */
interface Membre {
  readonly nom: string
  readonly role: string
  readonly statut: 'actif' | 'absent' | 'invite'
  readonly projets: number
}

const MEMBRES: readonly Membre[] = [
  { nom: 'Ana Ruiz', role: 'Design systeme', statut: 'actif', projets: 8 },
  { nom: 'Bob Marchand', role: 'Developpement front', statut: 'actif', projets: 5 },
  { nom: 'Chloe Petit', role: 'Accessibilite', statut: 'absent', projets: 3 },
  { nom: 'Dan Morel', role: 'Developpement back', statut: 'actif', projets: 6 },
  { nom: 'Emma Leroy', role: 'Produit', statut: 'invite', projets: 2 },
  { nom: 'Felix Garnier', role: 'Qualite', statut: 'actif', projets: 4 },
]

/** Ton de pastille par statut. */
const STATUT_TONES: Readonly<Record<Membre['statut'], BadgeTone>> = {
  actif: 'success',
  absent: 'warning',
  invite: 'neutral',
}

const COLONNES: readonly TableColumn<Membre>[] = [
  { key: 'nom', header: 'Nom' },
  { key: 'role', header: 'Role' },
  {
    key: 'statut',
    header: 'Statut',
    align: 'center',
    render: (membre) => (
      <Badge tone={STATUT_TONES[membre.statut]} dot>
        {membre.statut}
      </Badge>
    ),
  },
  { key: 'projets', header: 'Projets', align: 'right' },
]

/** Valeurs par defaut des props pilotees par le playground. */
const DEFAUTS: Record<string, ControlValue> = {
  striped: false,
  hoverable: false,
  dense: false,
  stickyHeader: false,
}

/** Documentation du composant Table. */
export function TableDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Table"
        lead="Tableau de donnees generique et accessible : colonnes declaratives, rendu de cellule personnalise, alignements, en-tete collant."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            { name: 'striped', type: 'boolean', defaultValue: false },
            { name: 'hoverable', type: 'boolean', defaultValue: true },
            { name: 'dense', type: 'boolean', defaultValue: false },
            { name: 'stickyHeader', type: 'boolean', defaultValue: false },
          ]}
          previewClassName="o-items-stretch"
          render={(v) => (
            <Table
              striped={v.striped as boolean}
              hoverable={v.hoverable as boolean}
              dense={v.dense as boolean}
              stickyHeader={v.stickyHeader as boolean}
              caption="Equipe produit"
              columns={COLONNES}
              rows={MEMBRES}
              rowKey={(membre) => membre.nom}
              className={
                v.stickyHeader === true
                  ? 'o-h-48 o-overflow-y-auto o-bg-surface'
                  : 'o-bg-surface'
              }
            />
          )}
          code={(v) => `<Table${jsxProps(v, DEFAUTS)}
  caption="Equipe produit"
  columns={COLONNES}
  rows={MEMBRES}
  rowKey={(membre) => membre.nom}
/>`}
        />
        <Callout>
          <code className="o-font-mono o-text-sm">stickyHeader</code> garde l'en-tete
          visible pendant le defilement vertical du conteneur : donnez au tableau une
          hauteur et <code className="o-font-mono o-text-sm">o-overflow-y-auto</code> via{' '}
          <code className="o-font-mono o-text-sm">className</code> pour le voir a
          l'oeuvre.
        </Callout>
      </Section>

      <Section
        title="Colonnes declaratives"
        lead="Chaque colonne declare sa cle, son en-tete, son alignement et, au besoin, un rendu de cellule a partir de la ligne entiere — ici une pastille de statut."
      >
        <DemoBlock
          center={false}
          code={`const COLONNES: readonly TableColumn<Membre>[] = [
  { key: 'nom', header: 'Nom' },
  { key: 'role', header: 'Role' },
  {
    key: 'statut',
    header: 'Statut',
    align: 'center',
    render: (membre) => (
      <Badge tone={STATUT_TONES[membre.statut]} dot>{membre.statut}</Badge>
    ),
  },
  { key: 'projets', header: 'Projets', align: 'right' },
]

<Table columns={COLONNES} rows={MEMBRES} rowKey={(membre) => membre.nom} />`}
        >
          <Table
            columns={COLONNES}
            rows={MEMBRES.slice(0, 3)}
            rowKey={(membre) => membre.nom}
            caption="Extrait de l'equipe produit"
          />
        </DemoBlock>
      </Section>

      <Section
        title="Tableau vide"
        lead="Sans aucune ligne, le message empty est affiche, centre, sur toute la largeur."
      >
        <DemoBlock
          center={false}
          code={`<Table
  columns={COLONNES}
  rows={[]}
  rowKey={(membre) => membre.nom}
  empty="Aucun membre ne correspond a ce filtre."
/>`}
        >
          <Table
            columns={COLONNES}
            rows={[]}
            rowKey={(membre) => membre.nom}
            empty="Aucun membre ne correspond a ce filtre."
          />
        </DemoBlock>
      </Section>

      <Section
        title="Legende visible"
        lead="La legende est masquee visuellement par defaut mais reste le titre annonce par les lecteurs d'ecran ; showCaption la rend visible."
      >
        <DemoBlock
          center={false}
          code={`<Table
  caption="Equipe produit — troisieme trimestre"
  showCaption
  columns={COLONNES}
  rows={MEMBRES}
  rowKey={(membre) => membre.nom}
/>`}
        >
          <Table
            caption="Equipe produit — troisieme trimestre"
            showCaption
            columns={COLONNES}
            rows={MEMBRES.slice(0, 3)}
            rowKey={(membre) => membre.nom}
          />
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'columns',
              type: 'readonly TableColumn<T>[]',
              description:
                "Colonnes, dans l'ordre d'affichage. Chaque colonne porte key, header, align ('left' par defaut) et un render optionnel.",
            },
            {
              name: 'rows',
              type: 'readonly T[]',
              description: 'Lignes de donnees.',
            },
            {
              name: 'rowKey',
              type: '(row: T) => string',
              description: "Cle stable d'une ligne, pour la reconciliation.",
            },
            {
              name: 'caption',
              type: 'ReactNode',
              description:
                "Legende du tableau. Masquee visuellement par defaut, elle reste le titre que les lecteurs d'ecran annoncent.",
            },
            {
              name: 'showCaption',
              type: 'boolean',
              defaultValue: 'false',
              description: 'Rend la legende visible.',
            },
            {
              name: 'striped',
              type: 'boolean',
              defaultValue: 'false',
              description: 'Alterne le fond des lignes.',
            },
            {
              name: 'hoverable',
              type: 'boolean',
              defaultValue: 'false',
              description: 'Surligne la ligne survolee.',
            },
            {
              name: 'dense',
              type: 'boolean',
              defaultValue: 'false',
              description: "Resserre l'espacement vertical.",
            },
            {
              name: 'stickyHeader',
              type: 'boolean',
              defaultValue: 'false',
              description:
                "Garde l'en-tete visible pendant le defilement vertical du conteneur.",
            },
            {
              name: 'empty',
              type: 'ReactNode',
              description: "Message affiche, centre, quand il n'y a aucune ligne.",
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles pour le conteneur defilant.',
            },
          ]}
        />
      </Section>
    </article>
  )
}
