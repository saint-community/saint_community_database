import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@workspace/ui/components/select';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

interface FormFieldProps {
  label: string;
  value: string;
  onEdit: (value: string) => void;
  options?: { value: string; label: string }[];
}

export function FormField({ label, value, onEdit }: FormFieldProps) {
  const [isFieldEditing, setIsFieldEditing] = useState(false);

  return (
    <div className='space-y-2'>
      <label className='block text-sm font-medium'>{label}</label>
      <div className='relative'>
        <div className='relative'>
          <Input
            value={value}
            className='w-full border-gray-300 rounded-md pr-10'
            readOnly={!isFieldEditing}
            onChange={(e) => onEdit(e.target.value)}
          />
          <span
            className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'
            onClick={() => setIsFieldEditing(!isFieldEditing)}
          >
            <Pencil
              size={18}
              className={`${isFieldEditing ? 'text-green-500' : 'text-red-500'}`}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
export function FormSelectField({
  label,
  value,
  onEdit,
  options,
}: FormFieldProps) {
  const uniqueOptions = Array.from(
    new Map(
      (options || [])
        .filter((option) => option?.value !== undefined && option?.value !== '')
        .map((option) => [String(option.value), {
          value: String(option.value),
          label: option.label,
        }])
    ).values()
  );

  return (
    <div className='space-y-2'>
      <label className='block text-sm font-medium'>{label}</label>
      <div className='relative'>
        <div className='relative'>
          <Select value={value} onValueChange={onEdit}>
            <SelectTrigger>
              <SelectValue placeholder='Select a church' />
            </SelectTrigger>
            <SelectContent>
              {uniqueOptions.map((option: { value: string; label: string }) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
