import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-sm text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground font-headline text-xs font-bold uppercase tracking-widest hover:bg-primary/90",
        destructive:
          "bg-destructive text-white font-headline text-xs font-bold uppercase tracking-widest hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-outline-variant/20 bg-surface-container-low font-headline text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground font-headline text-xs font-bold uppercase tracking-widest hover:bg-secondary/80",
        brand:
          "bg-brand-secondary text-on-brand-secondary font-headline text-xs font-bold uppercase tracking-widest hover:bg-brand-secondary/90",
        ghost:
          "font-headline text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        /* default is HIG-compliant (44×44). See ADR-003-tap-target-44px-hig. */
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 px-6 has-[>svg]:px-4",
        icon: "size-11",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
        /* Sprint K [1.5.204] — pill: rounded-full + mixed-case override of the
         * variant chrome (uppercase/tracking-widest/rounded-sm). Used for short
         * inline CTAs ("Registrar", "Log it") that conflict with the editorial
         * default. The class list overrides the variant defaults via Tailwind
         * later-rule precedence. */
        pill: "h-8 px-3 py-1.5 rounded-full font-body text-micro font-semibold normal-case tracking-normal gap-1 [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
