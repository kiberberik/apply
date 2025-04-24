import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Checkbox } from './checkbox';

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

interface FilterMenuProps {
  title: string;
  options: FilterOption[];
  onChange: (selectedOptions: string[]) => void;
}

export function FilterMenu({ title, options, onChange }: FilterMenuProps) {
  const t = useTranslations('Applications');

  const handleOptionChange = (optionId: string, checked: boolean) => {
    const newSelectedOptions = options
      .map((option) => ({
        ...option,
        checked: option.id === optionId ? checked : option.checked,
      }))
      .filter((option) => option.checked)
      .map((option) => option.id);

    onChange(newSelectedOptions);
  };

  return (
    <Menu as="div" className="relative z-50 inline-block text-left">
      <MenuButton className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
        {t(title)}
        <Filter className="ml-2 h-4 w-4" />
      </MenuButton>

      <MenuItems className="ring-opacity-5 absolute right-0 z-50 mt-2 w-min origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none">
        <div className="p-2">
          {options.map((option) => (
            <MenuItem key={option.id}>
              {({ active }) => (
                <div
                  className={cn(
                    'flex items-center rounded-md px-4 py-2 text-sm',
                    active ? 'bg-gray-100' : '',
                  )}
                  onClick={() => handleOptionChange(option.id, !option.checked)}
                >
                  <Checkbox
                    id={option.id}
                    checked={option.checked}
                    onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
                  />
                  <label htmlFor={option.id} className="ml-2 cursor-pointer">
                    {option.label}
                  </label>
                </div>
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}
