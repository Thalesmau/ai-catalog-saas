import { Bot } from 'lucide-react';

const PROMPTS = [
  'Quais são os produtos mais baratos?',
  'Me mostre as categorias do catálogo',
  'Tem algo até R$ 100?',
  'Qual produto você recomenda para presente?',
];

export function SuggestedPrompts({ companyName, onSelect }: { companyName: string; onSelect: (prompt: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bot className="size-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Como posso ajudar?</h2>
        <p className="text-sm text-muted-foreground">
          Respondo com base no catálogo da {companyName}, consultando os produtos em tempo real.
        </p>
      </div>
      <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {PROMPTS.map(prompt => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            className="rounded-xl border bg-card px-4 py-3 text-left text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
