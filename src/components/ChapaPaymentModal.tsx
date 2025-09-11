import React, { useState, useEffect } from 'react';
import { X, CreditCard, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './ui/Dialog';
import { useAuth } from '../contexts/AuthContext';
import { chapaPaymentService, ChapaPaymentResponse } from '../services/chapaPaymentService';
import toast from 'react-hot-toast';

interface ChapaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  paymentType: 'deposit' | 'game_entry' | 'tournament_entry' | 'power_up';
  amount: number;
  title: string;
  description: string;
  metadata?: {
    gameId?: string;
    gameName?: string;
    tournamentId?: string;
    tournamentName?: string;
    powerUpId?: string;
    powerUpName?: string;
  };
}

interface PaymentFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const ChapaPaymentModal: React.FC<ChapaPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  paymentType,
  amount,
  title,
  description,
  metadata = {}
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PaymentFormData>({
    email: user?.email || '',
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [paymentResponse, setPaymentResponse] = useState<ChapaPaymentResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: user?.email || '',
        firstName: user?.displayName?.split(' ')[0] || '',
        lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
        phone: ''
      });
      setErrors({});
      setPaymentResponse(null);
    }
  }, [isOpen, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+251|0)?[79]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Ethiopian phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setPaymentResponse(null);

    try {
      let response: ChapaPaymentResponse;

      switch (paymentType) {
        case 'deposit':
          response = await chapaPaymentService.createDepositPayment(
            amount,
            formData.email,
            formData.firstName,
            formData.lastName,
            formData.phone
          );
          break;

        case 'game_entry':
          if (!metadata.gameId || !metadata.gameName) {
            throw new Error('Game information is missing');
          }
          response = await chapaPaymentService.createGameEntryPayment(
            metadata.gameId,
            metadata.gameName,
            amount,
            formData.email,
            formData.firstName,
            formData.lastName,
            formData.phone
          );
          break;

        case 'tournament_entry':
          if (!metadata.tournamentId || !metadata.tournamentName) {
            throw new Error('Tournament information is missing');
          }
          response = await chapaPaymentService.createTournamentEntryPayment(
            metadata.tournamentId,
            metadata.tournamentName,
            amount,
            formData.email,
            formData.firstName,
            formData.lastName,
            formData.phone
          );
          break;

        case 'power_up':
          if (!metadata.powerUpId || !metadata.powerUpName) {
            throw new Error('Power-up information is missing');
          }
          response = await chapaPaymentService.createPowerUpPayment(
            metadata.powerUpId,
            metadata.powerUpName,
            amount,
            formData.email,
            formData.firstName,
            formData.lastName,
            formData.phone
          );
          break;

        default:
          throw new Error('Invalid payment type');
      }

      setPaymentResponse(response);

      if (response.status === 'success' && response.data?.checkout_url) {
        toast.success('Payment initialized successfully!');
        onSuccess?.(response.data);
        
        // Redirect to Chapa checkout
        setTimeout(() => {
          chapaPaymentService.redirectToCheckout(response.data.checkout_url);
        }, 1000);
      } else {
        throw new Error(response.message || 'Payment initialization failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentResponse({
        status: 'error',
        message: errorMessage
      });
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="panel-cyber max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 card-cyber rounded-lg">
              <CreditCard className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <DialogTitle className="!text-xl">{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <button aria-label="Close" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-200" />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Payment Amount Display */}
        <div className="p-6 card-cyber">
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-2">Payment Amount</p>
            <p className="text-3xl font-bold text-white">{formatAmount(amount)}</p>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input-modern ${
                  errors.email
                    ? ''
                    : ''
                }`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* First Name Field */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`input-modern ${
                  errors.firstName
                    ? ''
                    : ''
                }`}
                placeholder="Enter your first name"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
                placeholder="Enter your last name (optional)"
                disabled={isLoading}
              />
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`input-modern ${
                  errors.phone
                    ? ''
                    : ''
                }`}
                placeholder="e.g., +251912345678 or 0912345678"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 card-cyber">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800 dark:text-green-200">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment information is encrypted and secure. We use Chapa's trusted payment gateway.</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay {formatAmount(amount)}
                </>
              )}
            </button>
        </form>

        {/* Payment Response */}
        {paymentResponse && (
          <div className="p-6">
            {paymentResponse.status === 'success' ? (
              <div className="flex items-center gap-3 p-4 card-cyber">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-medium text-green-200">Payment Initialized</p>
                  <p className="text-sm text-green-300">
                    Redirecting to secure payment page...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 card-cyber">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div>
                  <p className="font-medium text-red-200">Payment Failed</p>
                  <p className="text-sm text-red-300">
                    {paymentResponse.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChapaPaymentModal;
