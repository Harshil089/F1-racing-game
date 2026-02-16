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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Driver Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-f1-gray border-2 ${
              errors.name ? 'border-f1-red' : 'border-f1-gray'
            } rounded-lg focus:outline-none focus:border-f1-red transition-colors text-white`}
            placeholder="Enter your name"
            maxLength={50}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-f1-red">{errors.name}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-f1-gray border-2 ${
              errors.phone ? 'border-f1-red' : 'border-f1-gray'
            } rounded-lg focus:outline-none focus:border-f1-red transition-colors text-white`}
            placeholder="Enter phone number"
            maxLength={15}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-f1-red">{errors.phone}</p>
          )}
        </div>

        {/* Car Number Field */}
        <div>
          <label htmlFor="carNumber" className="block text-sm font-medium mb-2">
            Car Number (1-99)
          </label>
          <input
            type="number"
            id="carNumber"
            name="carNumber"
            value={formData.carNumber}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-f1-gray border-2 ${
              errors.carNumber ? 'border-f1-red' : 'border-f1-gray'
            } rounded-lg focus:outline-none focus:border-f1-red transition-colors text-white`}
            placeholder="Choose your number"
            min="1"
            max="99"
          />
          {errors.carNumber && (
            <p className="mt-1 text-sm text-f1-red">{errors.carNumber}</p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-f1-red/10 border border-f1-red rounded-lg">
            <p className="text-sm text-f1-red">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 bg-f1-red text-white font-bold text-lg rounded-lg
            transition-all duration-300 ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-red-600 pulse-animation'
            }`}
        >
          {isSubmitting ? 'REGISTERING...' : 'START RACING'}
        </button>
      </form>
    </div>
  );
}
