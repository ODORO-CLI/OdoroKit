/**
 * Composants d'interface d'Odoro.
 *
 * Tous s'appuient exclusivement sur la couche semantique du systeme de style :
 * ils fonctionnent avec `odoro-libs/styles.css` seul, et se retheme
 * integralement en surchargeant les variables `--o-color-*`.
 *
 * @example
 * import { Button, Dialog, Input, Tabs, ToastProvider, useToast } from 'odoro-libs/ui'
 *
 * @module
 */

export { Button, buttonClasses, type ButtonProps } from './Button.jsx'
export { Dialog, type DialogProps } from './Dialog.jsx'
export { Input, inputClasses, type InputProps } from './Input.jsx'
export { Tabs, type TabItem, type TabsProps } from './Tabs.jsx'
export {
  ToastProvider,
  useToast,
  type Toast,
  type ToastApi,
  type ToastInput,
  type ToastProviderProps,
  type ToastTone,
} from './Toast.jsx'
