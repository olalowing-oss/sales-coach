// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Users, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
}

interface UserProduct {
  id: string;
  user_id: string;
  product_id: string;
  assigned_at: string;
  is_active: boolean;
  user_email?: string;
  product_name?: string;
}

interface UserProductsAdminProps {
  onClose: () => void;
}

export const UserProductsAdmin: React.FC<UserProductsAdminProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [assignments, setAssignments] = useState<UserProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch users from auth.users via RPC or admin API
      // For now, we'll fetch from user_products to get unique users
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('user_products')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('product_profiles')
        .select('id, name, description')
        .order('name', { ascending: true });

      if (productsError) throw productsError;

      // Get unique user IDs from assignments and fetch their details
      const userIds = [...new Set(assignmentsData?.map(a => a.user_id) || [])];
      const usersWithEmails: User[] = [];

      // Fetch user emails (this requires admin access or a custom RPC function)
      // For now, we'll use a workaround by getting the current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        usersWithEmails.push({
          id: currentUser.id,
          email: currentUser.email || 'Unknown',
          created_at: currentUser.created_at || new Date().toISOString()
        });
      }

      // Enrich assignments with user emails and product names
      const enrichedAssignments = assignmentsData?.map(assignment => ({
        ...assignment,
        user_email: usersWithEmails.find(u => u.id === assignment.user_id)?.email || assignment.user_id.slice(0, 8) + '...',
        product_name: productsData?.find(p => p.id === assignment.product_id)?.name || 'Unknown Product'
      })) || [];

      setUsers(usersWithEmails);
      setProducts(productsData || []);
      setAssignments(enrichedAssignments);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Kunde inte hämta data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignProduct = async () => {
    if (!selectedUserId || !selectedProductId) {
      setError('Välj både användare och produkt');
      return;
    }

    try {
      setError(null);

      const { error: insertError } = await supabase
        .from('user_products')
        .insert({
          user_id: selectedUserId,
          product_id: selectedProductId,
          is_active: true
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Denna användare har redan tillgång till produkten');
        } else {
          throw insertError;
        }
        return;
      }

      // Refresh data
      await fetchData();
      setIsAssigning(false);
      setSelectedUserId('');
      setSelectedProductId('');
    } catch (err: any) {
      console.error('Error assigning product:', err);
      setError(err.message || 'Kunde inte tilldela produkt');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna tilldelning?')) {
      return;
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('user_products')
        .delete()
        .eq('id', assignmentId);

      if (deleteError) throw deleteError;

      // Refresh data
      await fetchData();
    } catch (err: any) {
      console.error('Error removing assignment:', err);
      setError(err.message || 'Kunde inte ta bort tilldelning');
    }
  };

  const handleToggleActive = async (assignmentId: string, currentStatus: boolean) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('user_products')
        .update({ is_active: !currentStatus })
        .eq('id', assignmentId);

      if (updateError) throw updateError;

      // Refresh data
      await fetchData();
    } catch (err: any) {
      console.error('Error toggling assignment:', err);
      setError(err.message || 'Kunde inte uppdatera tilldelning');
    }
  };

  const handleAssignToCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Du måste vara inloggad');
        return;
      }

      if (!selectedProductId) {
        setError('Välj en produkt');
        return;
      }

      setSelectedUserId(user.id);

      const { error: insertError } = await supabase
        .from('user_products')
        .insert({
          user_id: user.id,
          product_id: selectedProductId,
          is_active: true
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Du har redan tillgång till denna produkt');
        } else {
          throw insertError;
        }
        return;
      }

      await fetchData();
      setSelectedProductId('');
      setError(null);
    } catch (err: any) {
      console.error('Error assigning to current user:', err);
      setError(err.message || 'Kunde inte tilldela produkt');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Hantera användarens produktåtkomst
            </h1>
            <p className="text-gray-400">
              Tilldela produkter till användare för att styra vilka scenarier de ser
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Quick Assign to Current User */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users size={20} />
            Tilldela till mig själv
          </h2>
          <div className="flex gap-4">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Välj produkt...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignToCurrentUser}
              disabled={!selectedProductId}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Plus size={20} />
              Tilldela
            </button>
          </div>
        </div>

        {/* Current Assignments */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package size={20} />
            Aktuella tilldelningar
          </h2>

          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Laddar...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Inga produkttilldelningar ännu. Tilldela en produkt ovan för att komma igång.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Användare</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Produkt</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Tilldelad</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">Åtgärder</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-3 px-4 text-white">{assignment.user_email}</td>
                      <td className="py-3 px-4 text-white">{assignment.product_name}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(assignment.assigned_at).toLocaleDateString('sv-SE')}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(assignment.id, assignment.is_active)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            assignment.is_active
                              ? 'bg-green-900 bg-opacity-50 text-green-300 border border-green-700'
                              : 'bg-gray-700 text-gray-400 border border-gray-600'
                          }`}
                        >
                          {assignment.is_active ? 'Aktiv' : 'Inaktiv'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                          title="Ta bort tilldelning"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
          <h3 className="text-blue-300 font-medium mb-2">ℹ️ Hur det fungerar</h3>
          <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
            <li>Användare ser bara scenarier kopplade till produkter de har tillgång till</li>
            <li>Globala scenarier (is_global = true) syns för alla användare</li>
            <li>Inaktiva tilldelningar gömmer produktens scenarier utan att ta bort tilldelningen</li>
            <li>Du kan alltid aktivera en inaktiv tilldelning igen genom att klicka på statusknappen</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
