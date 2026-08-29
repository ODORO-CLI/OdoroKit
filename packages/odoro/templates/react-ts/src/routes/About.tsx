import { Reveal } from '@odoro/libs/motion'
import { Link } from '@odoro/libs/router'

/** Page « a propos », qui demontre la navigation entre routes. */
export function About() {
  return (
    <Reveal className="o-flex o-flex-col o-gap-6">
      <h1 className="o-text-3xl o-font-bold o-tracking-tight">A propos</h1>
      <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
        Cette page est servie par le routeur d Odoro. La navigation ne recharge pas le
        document : elle passe par l historique du navigateur, restaure la position de
        defilement et joue une transition de page quand le navigateur la prend en charge.
      </p>
      <p>
        <Link to="/">Retour a l accueil</Link>
      </p>
    </Reveal>
  )
}
