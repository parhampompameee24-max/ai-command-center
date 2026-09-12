import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import { HudPanel } from "@/components/jarvis/hud-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import {
  clearMemory,
  editMemory,
  forget,
  memoryStore,
  remember,
  MEMORY_LABEL,
} from "@/lib/jarvis/memory";
import type { MemoryKind } from "@/lib/jarvis/types";

const KINDS: MemoryKind[] = ["note", "fact", "preference", "command"];

export function MemoryPanel() {
  const { items } = useStore(memoryStore);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MemoryKind | "all">("all");
  const [draft, setDraft] = useState("");
  const [draftKind, setDraftKind] = useState<MemoryKind>("note");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const visible = items
    .filter((i) => (filter === "all" ? true : i.kind === filter))
    .filter((i) => i.content.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <HudPanel
        title="حافظهٔ ماندگار"
        subtitle={`${items.length} مورد ذخیره شده`}
        bodyClassName="space-y-3"
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearMemory()}
            disabled={!items.length}
          >
            پاک کردن همه
          </Button>
        }
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجو در حافظه…"
            className="bg-background/60"
          />
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as MemoryKind | "all")}
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              {KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {MEMORY_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ul className="max-h-[52vh] space-y-2 overflow-y-auto">
          {visible.length === 0 && (
            <li className="py-8 text-center text-sm text-muted-foreground">
              چیزی برای نمایش نیست.
            </li>
          )}
          {visible.map((item) => (
            <li
              key={item.id}
              className="rounded-md border border-border/60 bg-background/40 p-3"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[10px] text-primary">
                  {MEMORY_LABEL[item.kind]}
                </span>
                <span
                  className="text-[10px] text-muted-foreground"
                  suppressHydrationWarning
                >
                  {new Date(item.at).toLocaleString("fa-IR")}
                </span>
              </div>
              {editing === item.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="bg-background/60"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="ذخیره"
                    onClick={() => {
                      editMemory(item.id, editValue);
                      setEditing(null);
                    }}
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="انصراف"
                    onClick={() => setEditing(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm break-words">{item.content}</p>
                  <div className="flex shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="ویرایش"
                      onClick={() => {
                        setEditing(item.id);
                        setEditValue(item.content);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="حذف"
                      onClick={() => forget(item.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </HudPanel>

      <HudPanel title="افزودن به حافظه" bodyClassName="space-y-3">
        <Select value={draftKind} onValueChange={(v) => setDraftKind(v as MemoryKind)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KINDS.map((k) => (
              <SelectItem key={k} value={k}>
                {MEMORY_LABEL[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="متن…"
          className="bg-background/60"
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              remember(draftKind, draft.trim());
              setDraft("");
            }
          }}
        />
        <Button
          className="w-full"
          disabled={!draft.trim()}
          onClick={() => {
            remember(draftKind, draft.trim());
            setDraft("");
          }}
        >
          <Plus className="size-4" />
          ثبت
        </Button>
        <p className="text-[11px] leading-5 text-muted-foreground">
          همه‌چیز فقط در همین مرورگر ذخیره می‌شود و با بستن صفحه از بین نمی‌رود.
        </p>
      </HudPanel>
    </div>
  );
}
