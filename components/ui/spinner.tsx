import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

type SpinnerSize = "sm" | "md" | "lg"

type SpinnerProps = React.ComponentProps<"svg"> & {
  size?: SpinnerSize
}

const spinnerSizes: Record<SpinnerSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
}

function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn(spinnerSizes[size], "animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
