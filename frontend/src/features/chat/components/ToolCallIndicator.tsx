import { Check, CircleAlert, FolderTree, Loader2, PackageSearch, Search } from 'lucide-react';

import { cn } from '@/lib/utils';

import { describeToolCall, summarizeToolResult } from '../toolResults';
import type { ToolCall } from '../types';

const TOOL_ICONS: Record<string, typeof Search> = {
  search_products: Search,
  get_product_details: PackageSearch,
  list_categories: FolderTree,
};

export function ToolCallIndicator({ call }: { call: ToolCall }) {
  const Icon = TOOL_ICONS[call.name] ?? Search;
  const summary = call.status === 'running' ? null : summarizeToolResult(call);

  return (
    <div
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs',
        call.status === 'running' ? 'border-primary/30 bg-primary/5 text-foreground' : 'bg-muted/50 text-muted-foreground',
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{describeToolCall(call)}</span>
      {call.status === 'running' && <Loader2 className="size-3.5 shrink-0 animate-spin" aria-label="Em andamento" />}
      {call.status === 'done' && <Check className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-label="Concluído" />}
      {call.status === 'error' && <CircleAlert className="size-3.5 shrink-0 text-destructive" aria-label="Falhou" />}
      {summary && <span className="shrink-0 text-muted-foreground">· {summary}</span>}
    </div>
  );
}
