/**
 * The class table of the `manoir` template — which has none.
 *
 * This template carries no utility engine at all: its markup is written
 * against its own stylesheet, in BEM, and nothing in it needed translating.
 * The file exists for the one thing that still applies — telling the check
 * which words merely look like classes.
 *
 * @module
 */

/** Nothing was renamed: nothing had to be. */
export const RENAMED = {}

/** Everything the template writes is its own. */
export const UNCHANGED = new Set([])

/**
 * Words that look like a class and are not one.
 *
 * `hidden` is the value of `style.overflow` while the loader holds the scroll;
 * `resize` is the name of a window event. Our stylesheet happens to know both
 * under `o-`, which is enough for a purely textual check to point at them.
 */
export const IGNORED = new Set(['left', 'right', 'center'])

/**
 * Des mots croises ailleurs dans le fichier, qui ressemblent a une classe sans
 * en etre : une valeur de `display`, un role de palette, le nom d un evenement.
 *
 * Ils ne concernent que le controle. Les mettre dans {@link IGNORED} epargnerait
 * aussi la vraie classe du meme nom — ce qui est arrive une fois, et se voyait
 * seulement a la capture.
 */
export const FAUX_AMIS = new Set(['hidden', 'resize'])

/** No utility is respelled, because none is employed. */
export const RESPELLED = {}
