"use client"

import * as React from "react"
import { MapPin } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { toArabicDigits } from "@/lib/format"
import type { Project } from "@/lib/types"

export function PortfolioGallery({ projects }: { projects: Project[] }) {
  const { t } = useLanguage()
  const [active, setActive] = React.useState<Project | null>(null)

  if (projects.length === 0) return null

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setActive(project)}
            className="group/project flex flex-col overflow-hidden rounded-xl bg-card text-start ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-foreground/20"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.imageUrl}
                alt={project.title}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover/project:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h4 className="font-heading text-sm font-bold leading-tight">{project.title}</h4>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {project.description}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                {project.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" />
                    {project.location}
                  </span>
                )}
                {project.year && (
                  <span className="tabular-nums">{toArabicDigits(project.year)}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl p-0 sm:max-w-2xl">
          {active && (
            <>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.imageUrl.replace(/\/(\d+)\/(\d+)$/, "/1200/675")}
                  alt={active.title}
                  className="size-full object-cover"
                />
              </div>
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {active.category && <Badge variant="secondary">{active.category}</Badge>}
                  {active.year && (
                    <Badge variant="outline" className="tabular-nums">
                      {toArabicDigits(active.year)}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="font-heading text-xl font-bold">
                  {active.title}
                </DialogTitle>
                {active.location && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {active.location}
                  </span>
                )}
                <DialogDescription className="text-sm leading-relaxed text-foreground/80">
                  {active.description}
                </DialogDescription>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
