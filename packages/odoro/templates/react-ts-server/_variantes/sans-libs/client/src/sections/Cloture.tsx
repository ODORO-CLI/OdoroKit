/**
 * La cloture : une commande, et la porte de sortie vers la documentation.
 *
 * @module
 */

import { useState, type ReactElement } from 'react'

/** La commande que l'on copie le plus souvent. */
const COMMANDE = 'npm i @odoro-cli/libs'

/** La section de cloture. */
export function Cloture(): ReactElement {
  const [copie, setCopie] = useState(false)

  return (
    <section className="section section-centre">
      <div className="contenu-etroit">
        <h2 className="cloture-titre">Ajoutez le systeme de style quand vous voudrez.</h2>
        <p className="cloture-chapeau">
          Les jetons, les utilitaires et les composants vivent dans un paquet a part.
          Ce projet tourne sans eux, et les accueille sans rien casser.
        </p>

        <div className="commande">
          <code>{COMMANDE}</code>
          <button
            type="button"
            className="bouton bouton-fantome"
            onClick={() => {
              // Le presse-papiers peut etre refuse — hors contexte sur, ou
              // permission retiree. L'echec ne casse pas la page : le libelle
              // ne change simplement pas.
              void navigator.clipboard
                ?.writeText(COMMANDE)
                .then(() => {
                  setCopie(true)
                  setTimeout(() => {
                    setCopie(false)
                  }, 1600)
                })
                .catch(() => undefined)
            }}
          >
            {copie ? 'Copie' : 'Copier'}
          </button>
        </div>

        <a
          href="https://odoro.dev/docs/installation"
          target="_blank"
          rel="noreferrer"
          className="lien-discret"
        >
          Lire la marche a suivre
        </a>
      </div>
    </section>
  )
}
