import {
  AirVent,
  Armchair,
  Building2,
  CookingPot,
  HardHat,
  LandPlot,
  Layers,
  Lightbulb,
  PaintRoller,
  PencilRuler,
  Sofa,
  Trees,
  type LucideIcon,
} from "lucide-react"

import type { Category } from "@/lib/types"

const ICONS: Record<Category, LucideIcon> = {
  "interior-designer": Sofa,
  architect: PencilRuler,
  contractor: HardHat,
  furniture: Armchair,
  landscaping: Trees,
  lighting: Lightbulb,
  kitchens: CookingPot,
  painting: PaintRoller,
  "real-estate": Building2,
  "real-estate-development": LandPlot,
  insulation: Layers,
  hvac: AirVent,
}

export function CategoryIcon({
  category,
  className,
}: {
  category: Category
  className?: string
}) {
  const Icon = ICONS[category]
  return <Icon className={className} />
}
