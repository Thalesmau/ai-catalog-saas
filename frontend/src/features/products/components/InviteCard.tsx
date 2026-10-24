import { Check, Copy, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function InviteCard({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success('Código copiado.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar. Selecione o código manualmente.');
    }
  };

  return (
    <Card className="flex-row flex-wrap items-center gap-4 border-dashed px-4 py-4 sm:px-6">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UserPlus className="size-5" />
      </div>
      <div className="min-w-48 flex-1">
        <p className="font-medium">Convide seu time</p>
        <p className="text-sm text-muted-foreground">
          Quem se cadastrar com este código entra na sua empresa como usuário.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <code className="rounded-md bg-muted px-3 py-1.5 font-mono text-sm font-semibold tracking-widest select-all">
          {inviteCode}
        </code>
        <Button variant="outline" size="icon" onClick={copy} aria-label="Copiar código de convite">
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
    </Card>
  );
}
