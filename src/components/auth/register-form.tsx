'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { registerSchema, RegisterFormValues } from '@/validators/auth-validators';
import { useAuthStore } from '@/store/auth-store';
import { useStore } from '@/store';
import { UserRole } from '@/types/auth';

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get auth store actions
  const register = useAuthStore(state => state.register);
  const isLoading = useAuthStore(state => state.auth.isLoading);
  const error = useAuthStore(state => state.auth.error);
  const clearError = useAuthStore(state => state.clearError);

  // Get barangays from store
  const barangays = useStore(state => state.barangays.data);
  const loadBarangays = useStore(state => state.barangays.loadBarangays);

  // Load barangays on component mount
  useEffect(() => {
    loadBarangays();
  }, [loadBarangays]);

  // Initialize form with React Hook Form
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      gender: '',
      birthday: '',
      role: 'admin', // Default to regular admin
      assignedBarangayId: '',
      password: '',
      confirmPassword: '',
      acceptTerms: true,
    },
  });

  // Watch the role field to conditionally show/hide barangay selection
  const selectedRole = watch('role');

  // Handle form submission
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      clearError();
      await register(data);
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by the store
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-xl mx-auto flex flex-col items-center relative z-10">
      {/* Logos at the top */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
        <div className="relative h-16 w-28 sm:h-24 sm:w-40">
          <Image
            src="/images/deped_logo.png"
            alt="DepEd Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <div className="relative h-20 w-28 sm:h-28 sm:w-40">
          <Image
            src="/images/als_logo.png"
            alt="ALS Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>

      {/* Form container */}
      <div className="w-full p-4 sm:p-6 md:p-8 bg-white rounded-lg border-4 sm:border-6 border-blue-900 shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4 sm:mb-8">CREATE ACCOUNT</h2>

        {error && (
          <div className="mb-4 p-2 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Left column */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Last Name"
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-black`}
              {...registerField('lastName')}
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          {/* Right column */}
          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
              Birthday
            </label>
            <input
              id="birthday"
              type="date"
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.birthday ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-black`}
              {...registerField('birthday')}
              disabled={isLoading}
            />
            {errors.birthday && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.birthday.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Left column */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-black`}
              {...registerField('firstName')}
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          {/* Right column */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-black`}
              {...registerField('gender')}
              disabled={isLoading}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Left column */}
          <div>
            <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
              Middle Name
            </label>
            <input
              id="middleName"
              type="text"
              placeholder="Middle Name"
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.middleName ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-black`}
              {...registerField('middleName')}
              disabled={isLoading}
            />
            {errors.middleName && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.middleName.message}</p>
            )}
          </div>

          {/* Right column - Empty for alignment */}
          <div className="hidden sm:block"></div>
        </div>

        {/* Email field - hidden but kept for functionality */}
        <div className="hidden">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            {...registerField('email')}
            value="default@example.com"
            disabled={isLoading}
          />
        </div>

        {/* Role and Barangay fields - hidden in the simplified form but kept for functionality */}
        <div className="hidden">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            User Role
          </label>
          <select
            id="role"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.role ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            {...registerField('role')}
            disabled={isLoading}
          >
            <option value="admin">Regular Admin</option>
            <option value="master_admin">Master Admin</option>
          </select>
        </div>

        {selectedRole === 'admin' && (
          <div className="hidden">
            <label htmlFor="assignedBarangayId" className="block text-sm font-medium text-gray-700">
              Assigned Barangay
            </label>
            <select
              id="assignedBarangayId"
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.assignedBarangayId ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              {...registerField('assignedBarangayId')}
              disabled={isLoading}
            >
              <option value="">Select Barangay</option>
              {barangays.map(barangay => (
                <option key={barangay.id} value={barangay.id}>
                  {barangay.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Left column */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Create Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-black`}
                {...registerField('password')}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs sm:text-sm text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Right column */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Re-Enter Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-black`}
                {...registerField('confirmPassword')}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs sm:text-sm text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Terms and conditions - hidden but automatically checked for functionality */}
        <div className="hidden">
          <input
            id="acceptTerms"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            {...registerField('acceptTerms')}
            checked={true}
            disabled={isLoading}
          />
          <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
            I accept the terms and conditions
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="order-2 sm:order-1">
            <button
              type="submit"
              className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>

          <div className="order-1 sm:order-2 mb-2 sm:mb-0">
            <button
              type="button"
              className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => router.push('/login')}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}
