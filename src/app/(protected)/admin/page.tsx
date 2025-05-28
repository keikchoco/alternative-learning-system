'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useStore } from '@/store';
import { User } from '@/types/auth';

export default function AdminManagementPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.auth.user);
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get barangays from store
  const barangays = useStore(state => state.barangays.data);
  const loadBarangays = useStore(state => state.barangays.loadBarangays);
  
  // Redirect if not a master admin
  useEffect(() => {
    if (user && user.role !== 'master_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  // Load barangays and admins
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load barangays
      await loadBarangays();
      
      // Load admins (mock data for now)
      const storedUsers = localStorage.getItem('als_users');
      if (storedUsers) {
        try {
          const users = JSON.parse(storedUsers) as User[];
          setAdmins(users);
        } catch (error) {
          console.error('Error parsing users:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [loadBarangays]);
  
  // Get barangay name by ID
  const getBarangayName = (barangayId: string) => {
    const barangay = barangays.find(b => b.id === barangayId);
    return barangay ? barangay.name : 'Unknown';
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Management</h2>
        <p className="text-gray-600 mb-4">
          Manage administrator accounts for the Alternative Learning System.
          Only Master Admins can access this page.
        </p>
        
        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => router.push('/register')}
          >
            Add New Admin
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Barangay
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.role === 'master_admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {admin.role === 'master_admin' ? 'Master Admin' : 'Regular Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {admin.role === 'admin' && admin.assignedBarangayId
                          ? getBarangayName(admin.assignedBarangayId)
                          : 'All Barangays'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No administrators found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
