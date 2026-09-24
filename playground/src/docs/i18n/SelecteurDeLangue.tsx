/**
 * Le selecteur de langue.
 *
 * ## Pourquoi un menu, et non une liste deroulante native
 *
 * Chaque ligne porte trois choses : un drapeau, un endonyme, et — pour trente
 * d entre elles — la mention qui dit que la traduction vient d une machine.
 * Un `<select>` ne rend que du texte, et la mention finirait entre parentheses
 * a la suite du nom, sur la meme ligne et dans la meme graisse que lui.
 *
 * Le prix est connu : il faut refaire au clavier ce que le natif donnait —
 * fleches, Entree, Echap, et le retour du foyer sur le bouton. C est fait plus
 * bas, et c est la seule raison pour laquelle ce fichier n est pas trois
 * lignes.
 *
 * ## Le drapeau ne designe pas la langue
 *
 * Un drapeau est un pays, pas une langue : l espagnol n est pas espagnol, et
 * l anglais britannique fera sourire un Americain. Il est ici parce qu il se
 * repere d un coup d oeil dans une liste de trente-deux, et c est le nom qui
 * fait foi — jamais l inverse.
 *
 * @module
 */

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react'

import { useLangue } from './index.jsx'
import { LANGUES, langueDe } from './langues.js'

/** Le selecteur, tel qu il vit dans la barre. */
export function SelecteurDeLangue(): ReactElement {
  const { code, choisir, t } = useLangue()
  const [ouvert, setOuvert] = useState(false)
  const [tenu, setTenu] = useState(0)
  const boite = useRef<HTMLDivElement>(null)
  const bouton = useRef<HTMLButtonElement>(null)

  const courante = langueDe(code)

  const fermer = useCallback(
    (rendreLeFoyer: boolean) => {
      setOuvert(false)
      if (rendreLeFoyer) bouton.current?.focus()
    },
    [],
  )

  // Un clic ailleurs ferme. L ecouteur ne vit que tant que le menu est ouvert :
  // pose en permanence, il s executerait a chaque clic de la page entiere.
  useEffect(() => {
    if (!ouvert) return
    const dehors = (evenement: MouseEvent): void => {
      if (boite.current !== null && !boite.current.contains(evenement.target as Node)) {
        setOuvert(false)
      }
    }
    document.addEventListener('mousedown', dehors)
    return () => document.removeEventListener('mousedown', dehors)
  }, [ouvert])

  // A l ouverture, le foyer part sur la langue courante plutot que sur la
  // premiere : dans une liste de trente-deux, c est d elle qu on se repere.
  useEffect(() => {
    if (!ouvert) return
    const index = LANGUES.findIndex((l) => l.code === code)
    setTenu(index === -1 ? 0 : index)
  }, [ouvert, code])

  const auClavier = (evenement: React.KeyboardEvent): void => {
    if (evenement.key === 'Escape') {
      evenement.preventDefault()
      fermer(true)
      return
    }
    if (evenement.key === 'ArrowDown') {
      evenement.preventDefault()
      setTenu((i) => Math.min(i + 1, LANGUES.length - 1))
      return
    }
    if (evenement.key === 'ArrowUp') {
      evenement.preventDefault()
      setTenu((i) => Math.max(i - 1, 0))
      return
    }
    if (evenement.key === 'Enter' || evenement.key === ' ') {
      evenement.preventDefault()
      const langue = LANGUES[tenu]
      if (langue !== undefined) {
        choisir(langue.code)
        fermer(true)
      }
    }
  }

  return (
    <div ref={boite} className="ods-langue" onKeyDown={auClavier}>
      <button
        ref={bouton}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        aria-label={t('langue.choisir')}
        onClick={() => setOuvert((o) => !o)}
        className="ods-langue-bouton"
      >
        <span aria-hidden="true">{courante.drapeau}</span>
        <span className="max-md:o-hidden">{courante.nom}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
          className={ouvert ? 'o-rotate-180' : ''}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {ouvert ? (
        <ul className="ods-langue-menu o-scrollbar dark:o-scrollbar-dark" role="listbox">
          {LANGUES.map((langue, index) => {
            const choisie = langue.code === code
            return (
              <li key={langue.code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={choisie}
                  data-tenu={index === tenu ? '' : undefined}
                  onMouseEnter={() => setTenu(index)}
                  onClick={() => {
                    choisir(langue.code)
                    fermer(true)
                  }}
                  className="ods-langue-option"
                >
                  <span className="ods-langue-drapeau" aria-hidden="true">
                    {langue.drapeau}
                  </span>
                  <span className="o-flex o-min-w-0 o-flex-col">
                    <span className="ods-langue-nom">{langue.nom}</span>
                    {/* La mention ne porte que sur ce qui n a pas ete relu.
                        L ecrire partout la viderait de son sens. */}
                    {langue.relue === true ? null : (
                      <span className="ods-langue-auto">{t('langue.automatique')}</span>
                    )}
                  </span>
                  {choisie ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                      className="ods-langue-coche"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
