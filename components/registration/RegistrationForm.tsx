'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    carNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Phone must contain only numbers';
    }

    if (!formData.carNumber) {
      newErrors.carNumber = 'Car number is required';
    } else {
      const num = parseInt(formData.carNumber, 10);
      if (isNaN(num) || num < 1 || num > 99) {
        newErrors.carNumber = 'Car number must be between 1 and 99';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/saveUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          carNumber: parseInt(formData.carNumber, 10),
        }),
      });

      if (response.ok) {
        // Store user data in localStorage for game page
        localStorage.setItem('playerData', JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          carNumber: parseInt(formData.carNumber, 10),
        }));

        // Navigate to game
        router.push('/game');
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || 'Failed to register' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 slide-in">
      {/* Google-style card container */}
      <div className="bg-white rounded-2xl p-8 google-shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-google-grey mb-2">
              Driver Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`google-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your name"
              maxLength={50}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-google-error flex items-center gap-1">
                <span>⚠️</span> {errors.name}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-google-grey mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`google-input ${errors.phone ? 'error' : ''}`}
              placeholder="Enter phone number"
              maxLength={15}
            />
            {errors.phone && (
              <p className="mt-2 text-sm text-google-error flex items-center gap-1">
                <span>⚠️</span> {errors.phone}
              </p>
            )}
          </div>

          {/* Car Number Field */}
          <div>
            <label htmlFor="carNumber" className="block text-sm font-medium text-google-grey mb-2">
              Car Number (1-99)
            </label>
            <input
              type="number"
              id="carNumber"
              name="carNumber"
              value={formData.carNumber}
              onChange={handleChange}
              className={`google-input ${errors.carNumber ? 'error' : ''}`}
              placeholder="Choose your number"
              min="1"
              max="99"
            />
            {errors.carNumber && (
              <p className="mt-2 text-sm text-google-error flex items-center gap-1">
                <span>⚠️</span> {errors.carNumber}
              </p>
            )}
          </div>

          {/* Submit Error Alert */}
          {errors.submit && (
            <div className="google-alert-error">
              <p className="text-sm font-medium">❌ {errors.submit}</p>
            </div>
          )}

          {/* Submit Button - Google Blue Primary */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 text-lg font-medium rounded-lg transition-all duration-200
              ${
                isSubmitting
                  ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500'
                  : 'google-btn-primary'
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                REGISTERING...
              </span>
            ) : (
              '🏁 START RACING'
            )}
          </button>
        </form>
      </div>

      {/* Google-style helper text */}
      <p className="mt-4 text-center text-xs text-gray-500">
        Your information is stored locally and used only for this racing session
      </p>
    </div>
  );
}
