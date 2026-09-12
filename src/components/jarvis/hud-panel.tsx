import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function HudPanel({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string | undefined;
  subtitle?: string | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
  bodyClassName?: string | undefined;
}) {
  return (
    <section className={cn("hud-panel hud-corners flex flex-col", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-2.5">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display truncate text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("flex-1 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
