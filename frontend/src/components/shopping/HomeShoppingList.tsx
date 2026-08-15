import { useState, useEffect } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { api, type ShoppingItemDto } from '@/lib/api';
import { cn } from '@/lib/utils';

export function HomeShoppingList() {
  const [items, setItems] = useState<ShoppingItemDto[]>([]);

  const load = () => api.getShopping().then(setItems).catch(console.error);
  useEffect(() => { load(); }, []);

  const toggle = async (id: string) => {
    await api.toggleShopping(id);
    load();
  };

  const total = items.filter((i) => !i.isPurchased).reduce((sum, i) => sum + i.estimatedPrice, 0);
  const purchased = items.filter((i) => i.isPurchased).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">Shopping List</h3>
        </div>
        <span className="text-xs text-muted-foreground">{purchased}/{items.length} done</span>
      </div>

      <div className="space-y-1.5 mb-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all hover:bg-background',
              item.isPurchased && 'opacity-50'
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'h-4 w-4 rounded border flex items-center justify-center',
                  item.isPurchased ? 'bg-success border-success' : 'border-border'
                )}
              >
                {item.isPurchased && <Check className="h-3 w-3 text-white" />}
              </span>
              <span className={item.isPurchased ? 'line-through' : ''}>{item.name}</span>
            </span>
            <span className="text-muted-foreground">${item.estimatedPrice.toFixed(2)}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">Estimated Total</span>
        <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
