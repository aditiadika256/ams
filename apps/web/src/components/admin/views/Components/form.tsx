'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ComponentDefinition, ComponentDefinitionPayload, ComponentHandlerTemplate } from '@/types/sales';

const handlerOptions: Array<{ value: ComponentHandlerTemplate; label: string; description: string }> = [
  { value: 'INFORMATION', label: 'Information', description: 'Teks informatif sederhana.' },
  { value: 'EXTERNAL_LINK', label: 'External link', description: 'Tautan HTTPS terkontrol.' },
  { value: 'FILE_DOWNLOAD', label: 'File download', description: 'File privat dengan akses enrollment.' },
  { value: 'EMBEDDED_PAGE', label: 'Embedded page', description: 'Konten teks atau blok tersemat.' },
  { value: 'VIDEO', label: 'Video', description: 'Video privat atau URL HTTPS.' },
  { value: 'FORM', label: 'Form', description: 'Form terstruktur dan tervalidasi.' },
  { value: 'IFRAME', label: 'Iframe', description: 'Embed dari host allowlist.' },
  { value: 'NATIVE', label: 'Native', description: 'Capability yang dirilis bersama aplikasi.' },
];

interface ComponentDefinitionFormProps {
  initial?: ComponentDefinition | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (payload: ComponentDefinitionPayload) => Promise<void>;
}

export function ComponentDefinitionForm({ initial, loading, onCancel, onSubmit }: ComponentDefinitionFormProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<ComponentHandlerTemplate>('INFORMATION');
  const [icon, setIcon] = useState('Blocks');
  const [sortOrder, setSortOrder] = useState('0');
  const [schema, setSchema] = useState('{}');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  useEffect(() => {
    setCode(initial?.code ?? '');
    setName(initial?.name ?? '');
    setDescription(initial?.description ?? '');
    setTemplate(initial?.handler_template ?? 'INFORMATION');
    setIcon(initial?.icon ?? 'Blocks');
    setSortOrder(String(initial?.sort_order ?? 0));
    setSchema(JSON.stringify(initial?.config_schema ?? {}, null, 2));
    setSchemaError(null);
  }, [initial]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let parsedSchema: Record<string, unknown>;
    try {
      parsedSchema = schema.trim() ? JSON.parse(schema) as Record<string, unknown> : {};
      setSchemaError(null);
    } catch {
      setSchemaError('Config schema harus berupa JSON object yang valid.');
      return;
    }

    await onSubmit({
      ...(initial ? {} : { code: code.trim().toLowerCase() }),
      name: name.trim(),
      description: description.trim() || null,
      handler_template: template,
      handler_key: initial?.handler_key ?? null,
      icon: icon.trim() || null,
      config_schema: parsedSchema,
      sort_order: Number(sortOrder),
    });
  };

  const selectedHandler = handlerOptions.find((option) => option.value === template);

  return (
    <form onSubmit={submit} className="grid gap-5 py-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="component-code">Kode</Label>
          <Input
            id="component-code"
            required
            disabled={Boolean(initial)}
            pattern="[a-z0-9_\-]+"
            value={code}
            onChange={(event) => setCode(event.target.value.toLowerCase().replace(/\s+/g, '_'))}
            className="bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">Permanen setelah component dibuat.</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="component-name">Nama</Label>
          <Input
            id="component-name"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="component-description">Deskripsi</Label>
        <textarea
          id="component-description"
          maxLength={2000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 rounded-xl border border-input/60 bg-background/70 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="component-handler">Template handler</Label>
        <Select value={template} disabled={Boolean(initial?.is_system)} onValueChange={(value) => setTemplate(value as ComponentHandlerTemplate)}>
          <SelectTrigger id="component-handler" className="min-h-11 bg-background/70 border-input/60 text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border/60 bg-popover text-popover-foreground">
            {handlerOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} disabled={!initial && option.value === 'NATIVE'}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{selectedHandler?.description} Native hanya tersedia melalui release aplikasi.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="component-icon">Ikon Lucide</Label>
          <Input
            id="component-icon"
            value={icon}
            maxLength={80}
            onChange={(event) => setIcon(event.target.value)}
            className="bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="component-order">Urutan</Label>
          <Input
            id="component-order"
            type="number"
            min="0"
            max="65535"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="bg-background/70 border-input/60 text-foreground"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="component-schema">Config schema (opsional)</Label>
        <textarea
          id="component-schema"
          value={schema}
          spellCheck={false}
          onChange={(event) => setSchema(event.target.value)}
          className="min-h-36 rounded-xl border border-input/60 bg-muted/40 px-3 py-3 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-invalid={Boolean(schemaError)}
        />
        {schemaError ? (
          <p role="alert" className="text-sm text-destructive">{schemaError}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Field ini opsional saat draft. Publish content tetap divalidasi oleh handler.</p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto min-h-11 sm:min-h-10 border-border/70 hover:bg-accent hover:text-accent-foreground"
          onClick={onCancel}
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto min-h-11 sm:min-h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          disabled={loading}
        >
          {loading ? 'Menyimpan…' : 'Simpan component'}
        </Button>
      </div>
    </form>
  );
}
