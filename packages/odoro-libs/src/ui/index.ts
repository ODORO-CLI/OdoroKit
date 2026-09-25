/**
 * Odoro interface components.
 *
 * They all rely exclusively on the semantic layer of the style system:
 * they work with `@odoro-cli/libs/styles.css` alone, and retheme
 * entirely by overriding the `--o-color-*` variables.
 *
 * @example
 * import { Button, Card, Dialog, Tabs, useToast } from '@odoro-cli/libs/ui'
 *
 * @module
 */

// Forms.
export { Button, buttonClasses, type ButtonProps } from './Button.jsx'
export { Input, inputClasses, type InputProps } from './Input.jsx'
export { Textarea, type TextareaProps } from './Textarea.jsx'
export { SelectMenu, type SelectMenuOption, type SelectMenuProps } from './SelectMenu.js'

export { Select, type SelectOption, type SelectProps } from './Select.jsx'
export { Checkbox, type CheckboxProps } from './Checkbox.jsx'
export { RadioGroup, type RadioGroupProps, type RadioItem } from './Radio.jsx'
export { Switch, switchClasses, type SwitchProps } from './Switch.jsx'
export { Slider, type SliderProps } from './Slider.jsx'

// Display.
export { Card, cardClasses, type CardProps } from './Card.jsx'
export {
  Badge,
  badgeClasses,
  type BadgeClassesOptions,
  type BadgeProps,
  type BadgeSize,
  type BadgeTone,
  type BadgeVariant,
} from './Badge.jsx'
export {
  Avatar,
  AvatarGroup,
  type AvatarGroupProps,
  type AvatarProps,
  type AvatarSize,
} from './Avatar.jsx'
export { Alert, alertClasses, type AlertProps, type AlertTone } from './Alert.jsx'
export { Separator, type SeparatorProps } from './Separator.jsx'
export { Skeleton, type SkeletonProps } from './Skeleton.jsx'
export { Spinner, type SpinnerProps } from './Spinner.jsx'
export { Progress, type ProgressProps } from './Progress.jsx'
export { Kbd, type KbdProps } from './Kbd.jsx'
export { Table, type TableColumn, type TableProps } from './Table.jsx'

// Navigation.
export { Tabs, type TabItem, type TabsProps } from './Tabs.jsx'
export { Accordion, type AccordionItem, type AccordionProps } from './Accordion.jsx'
export { Breadcrumb, type BreadcrumbItem, type BreadcrumbProps } from './Breadcrumb.jsx'
export { Pagination, type PaginationProps } from './Pagination.jsx'

// Overlays.
export { Dialog, type DialogProps } from './Dialog.jsx'
export { Drawer, type DrawerProps, type DrawerSide } from './Drawer.jsx'
export { Tooltip, type TooltipPlacement, type TooltipProps } from './Tooltip.jsx'
export { Popover, type PopoverProps } from './Popover.jsx'
export {
  DropdownMenu,
  type DropdownMenuAction,
  type DropdownMenuItem,
  type DropdownMenuProps,
  type DropdownMenuSeparator,
} from './DropdownMenu.jsx'
export {
  ToastProvider,
  useToast,
  type Toast,
  type ToastApi,
  type ToastInput,
  type ToastProviderProps,
  type ToastTone,
} from './Toast.jsx'

// Shop: presentational cards, grid and cart drawer. The data layer is
// `@odoro-cli/commerce`.
export {
  CartDrawer,
  ProductCard,
  ProductGrid,
  formatPrice,
  type CartDrawerProps,
  type CartLine,
  type ProductCardProduct,
  type ProductCardProps,
  type ProductGridProps,
} from './Commerce.jsx'
