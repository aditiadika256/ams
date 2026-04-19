import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "glass" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const Comp = (asChild ? Slot : motion.button) as any

    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      glass: "bg-white/60 border border-black/5 dark:bg-white/10 dark:border-white/20 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/20 text-foreground shadow-lg hover:shadow-xl transition-all duration-300",
      link: "text-primary underline-offset-4 hover:underline"
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    // Motion props (only applied if not asChild, though Slot doesn't forward motion props easily, so we might need a wrapper if strictly sticking to Radix Slot pattern. For now, assuming direct usage or careful composition)
    const motionProps = !asChild ? {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
    } : {}

    return (
      // @ts-ignore - handling polymorphism with framer-motion is tricky with TS
      <Comp
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...motionProps}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton }
