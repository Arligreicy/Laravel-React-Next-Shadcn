// components/SelectField.tsx

import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: Option[];
}

export default function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>

        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
