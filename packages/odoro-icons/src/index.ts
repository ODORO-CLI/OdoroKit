/**
 * Odoro icon module.
 *
 * ## Five packs, one contract
 *
 * Each pack lives in its own submodule: `@odoro-cli/icons/outline`,
 * `/compact`, `/classic`, `/extended`, `/brands`. None is re-exported here —
 * an index gathering them all would bring eleven thousand exports into the
 * bundler graph in order to display three.
 *
 * ## Pick a pack, and stick to it
 *
 * The packs share neither grid, nor weight, nor drawing style. Mixing a
 * twenty-four stroked icon and a five hundred and twelve solid glyph in the
 * same toolbar shows immediately, even without knowing why.
 *
 * The only mix that stands up is a main pack plus `brands`, since the logos
 * have no style in common with the rest anyway.
 *
 * @example
 * import { Icon } from '@odoro-cli/icons'
 * import { Download, Search } from '@odoro-cli/icons/outline'
 *
 * <Icon icon={Download} />
 * <Icon icon={Search} size={20} label="Search" />
 *
 * @module
 */

export { Icon, type IconProps } from './Icon.jsx'
export type { IconData, IconNode, PackInfo } from './types.js'
