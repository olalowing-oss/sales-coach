# Multi-Tenant Coaching Data Implementation

## ✅ Completed

### 1. Database Types Updated
All coaching tables in `src/types/database.ts` now include `product_id`:
- `trigger_patterns`
- `battlecards`
- `objection_handlers`
- `case_studies`
- `offers`

### 2. TypeScript Interfaces Updated
All coaching interfaces in `src/types/index.ts` now include `productId?`:
- `TriggerPattern`
- `Battlecard`
- `ObjectionHandler`
- `CaseStudy`
- `Offer`

### 3. Database Operations Updated
All CRUD operations in `src/lib/supabaseOperations.ts` now handle `product_id`:
- `loadTriggerPatternsFromDb()` / `syncTriggerPatternsToDb()`
- `loadBattlecardsFromDb()` / `syncBattlecardsToDb()`
- `loadObjectionHandlersFromDb()` / `syncObjectionHandlersToDb()`
- `loadCaseStudiesFromDb()` / `syncCaseStudiesToDb()`
- `loadOffersFromDb()` / `syncOffersToDb()`

## 🔄 Next Steps

### Step 1: Run SQL Migration

Open Supabase SQL Editor and run the file:
```
add-product-id-to-coaching-tables.sql
```

This will:
- Add `product_id` column to all coaching tables
- Create indexes for performance
- Drop old RLS policies
- Create new multi-tenant RLS policies

**RLS Policy Pattern:**
```sql
CREATE POLICY "Users can view accessible triggers"
  ON trigger_patterns FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    product_id IN (
      SELECT product_id FROM user_products
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
```

Users can see:
- Their own coaching data (`user_id = auth.uid()`)
- Coaching data for products they have active access to

### Step 2: Add Product Selection UI

Update `src/components/CoachingAdminPanel.tsx` to add product dropdowns to all forms.

#### A. Add Product Fetching Hook

Add this near the top of the file (after imports):

```tsx
const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('product_profiles')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  return products;
};
```

#### B. Update Triggers Form

In `TriggersTab`, add to `newTrigger` state:
```tsx
const [newTrigger, setNewTrigger] = useState({
  id: '',
  keywords: '',
  response: 'objection' as TriggerPattern['response'],
  category: '',
  productId: null as string | null  // ADD THIS
});
```

Add product dropdown in the form (after category field):
```tsx
<div className="mb-4">
  <label className="block text-sm text-gray-400 mb-1">Produkt (valfritt)</label>
  <select
    value={newTrigger.productId || ''}
    onChange={(e) => setNewTrigger({ ...newTrigger, productId: e.target.value || null })}
    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
  >
    <option value="">Global (alla produkter)</option>
    {products.map(p => (
      <option key={p.id} value={p.id}>{p.name}</option>
    ))}
  </select>
</div>
```

Update `handleAddTrigger`:
```tsx
const handleAddTrigger = () => {
  if (!newTrigger.id || !newTrigger.keywords) return;
  addTriggerPattern(newTrigger.id, {
    keywords: newTrigger.keywords.split(',').map(k => k.trim()),
    response: newTrigger.response,
    category: newTrigger.category || undefined,
    productId: newTrigger.productId  // ADD THIS
  });
  setNewTrigger({ id: '', keywords: '', response: 'objection', category: '', productId: null });
  setShowAddForm(false);
};
```

#### C. Update Battlecards Form

In `BattlecardsTab`, add to `newCard` state:
```tsx
const [newCard, setNewCard] = useState<Omit<Battlecard, 'id'>>({
  competitor: '',
  theirStrengths: [],
  theirWeaknesses: [],
  ourAdvantages: [],
  talkingPoints: [],
  commonObjections: [],
  productId: null  // ADD THIS
});
```

In `BattlecardForm` component, add product dropdown after the competitor field:
```tsx
<div className="mb-4">
  <label className="block text-sm text-gray-400 mb-1">Produkt (valfritt)</label>
  <select
    value={(battlecard as any).productId || ''}
    onChange={(e) => update('productId', e.target.value || null)}
    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
  >
    <option value="">Global (alla produkter)</option>
    {products.map(p => (
      <option key={p.id} value={p.id}>{p.name}</option>
    ))}
  </select>
</div>
```

#### D. Update Objections Form

In `ObjectionsTab`, add to `newHandler` state:
```tsx
const [newHandler, setNewHandler] = useState<Omit<ObjectionHandler, 'id'>>({
  objection: '',
  triggers: [],
  category: 'price',
  responses: { short: '', detailed: '', followUpQuestions: [] },
  productId: null  // ADD THIS
});
```

Add product dropdown in form (after category).

#### E. Update Case Studies Form

In `CasesTab`, add to `newCase` state:
```tsx
const [newCase, setNewCase] = useState<Omit<CaseStudy, 'id'>>({
  customer: '',
  industry: '',
  challenge: '',
  solution: '',
  results: [],
  quote: '',
  isPublic: true,
  productId: null  // ADD THIS
});
```

Add product dropdown in form.

## Testing

1. **Run SQL migration** in Supabase
2. **Verify RLS policies** created correctly:
   ```sql
   SELECT tablename, policyname, cmd
   FROM pg_policies
   WHERE tablename IN ('trigger_patterns', 'battlecards', 'case_studies', 'objection_handlers', 'offers')
   ORDER BY tablename, cmd, policyname;
   ```

3. **Test product isolation**:
   - Create a battlecard for Product A
   - Switch user's product access to Product B
   - Verify battlecard from Product A is not visible
   - Switch back to Product A
   - Verify battlecard is visible again

4. **Test global data**:
   - Create coaching data with `product_id = NULL`
   - Verify it's visible regardless of user's product access

## Benefits

- ✅ Users only see coaching data relevant to their assigned products
- ✅ Global coaching data (null product_id) visible to all users
- ✅ RLS policies automatically enforce access control
- ✅ No application code changes needed for filtering
- ✅ Consistent with training_scenarios multi-tenancy pattern

## Architecture

Same pattern as `training_scenarios`:
- `user_products` junction table defines user → product assignments
- RLS policies check if user owns data OR has access via `user_products`
- Product selection is optional (null = global/shared data)
