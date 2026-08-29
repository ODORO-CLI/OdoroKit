/**
 * Validation des entrées.
 *
 * ## Une seule entrée, trois provenances
 *
 * Le corps, les paramètres d'URL et la chaîne de requête arrivent par trois
 * canaux et sont fusionnés en un seul objet avant validation. Le handler reçoit
 * `input`, sans avoir à savoir d'où chaque champ vient.
 *
 * Ce n'est pas qu'une commodité. Une route qui déplacerait un champ du corps
 * vers la chaîne de requête ne changerait alors ni son schéma, ni son handler,
 * ni le client — seulement son chemin.
 *
 * ## L'ordre de fusion, et pourquoi il est celui-là
 *
 * Les paramètres d'URL l'emportent sur la chaîne de requête, qui l'emporte sur
 * le corps. Le paramètre d'URL fait partie de l'adresse : `/users/:id` désigne
 * un utilisateur, et un `id` glissé dans le corps ne doit pas pouvoir en
 * désigner un autre.
 *
 * L'inverse est une élévation de privilège classique — on lit l'identité dans
 * le chemin pour autoriser, puis on agit sur celle du corps.
 *
 * ## Les erreurs par champ
 *
 * Une entrée refusée produit un document `problem+json` portant `errors`, une
 * ligne par champ fautif, avec le chemin en notation pointée. C'est ce que le
 * client de la phase 4 redistribue sur les champs du formulaire, et c'est ce
 * qui évite d'écrire trois fois la même logique de messages.
 *
 * @module
 */

import type { Request } from 'express'
import type { z } from 'zod'

import { ValidationError, type FieldError } from './errors.js'

/**
 * Fusionne les trois provenances.
 *
 * Exportée pour être testée seule : l'ordre de précédence est une décision de
 * sécurité, pas un détail d'implémentation.
 */
export function mergeSources(request: Request): Record<string, unknown> {
  const body =
    typeof request.body === 'object' && request.body !== null
      ? (request.body as Record<string, unknown>)
      : {}

  // Du moins prioritaire au plus prioritaire. Le parametre d'URL gagne parce
  // qu'il fait partie de l'adresse : un `id` glisse dans le corps ne doit pas
  // pouvoir designer une autre ressource que celle que le chemin nomme.
  return { ...body, ...request.query, ...request.params }
}

/**
 * Traduit les problèmes d'un schéma en erreurs par champ.
 *
 * Le chemin est rendu en notation pointée — `adresse.ville`, `lignes.0.prix` —
 * parce que c'est ainsi que les bibliothèques de formulaires désignent leurs
 * champs, et que le client doit pouvoir faire la correspondance sans
 * traduction.
 */
export function toFieldErrors(error: z.ZodError): readonly FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.map(String).join('.') || '(racine)',
    message: issue.message,
  }))
}

/**
 * Valide une entrée contre un schéma.
 *
 * @throws {ValidationError} Avec le détail par champ.
 */
export function validateInput<Schema extends z.ZodType>(
  schema: Schema,
  request: Request,
): z.infer<Schema> {
  const result = schema.safeParse(mergeSources(request))
  if (result.success) return result.data

  throw new ValidationError(toFieldErrors(result.error))
}

/**
 * Valide une sortie contre son schéma.
 *
 * ## Pourquoi valider ce qu'on émet
 *
 * Un schéma de sortie sert d'abord à typer le client. Le faire **appliquer** au
 * moment de la réponse en fait autre chose : la garantie qu'aucun champ non
 * déclaré ne sort.
 *
 * C'est ce qui rend la règle « aucune entité de base n'est renvoyée
 * directement » vérifiable plutôt que seulement écrite. Un service qui rendrait
 * la ligne complète — hachage de mot de passe et jeton de réinitialisation
 * compris — voit ces champs retirés ici, parce qu'un objet Zod ne conserve que
 * ce qu'il déclare.
 *
 * En développement, un champ inattendu fait en plus **échouer** la requête :
 * la fuite est alors trouvée en écrivant la route, pas en auditant la
 * production.
 */
export function validateOutput<Schema extends z.ZodType>(
  schema: Schema,
  value: unknown,
  strict: boolean,
): z.infer<Schema> {
  const result = schema.safeParse(value)

  if (!result.success) {
    if (strict) {
      throw new Error(
        `La reponse ne respecte pas son schema de sortie : ` +
          toFieldErrors(result.error)
            .map(({ field, message }) => `${field} — ${message}`)
            .join(' ; '),
      )
    }
    // En production, une sortie non conforme ne doit pas transformer une
    // reponse correcte en erreur 500 : l'erreur remonte au journal, et
    // l'appelant recoit ce que le schema a pu retenir.
    return value as z.infer<Schema>
  }

  return result.data
}
