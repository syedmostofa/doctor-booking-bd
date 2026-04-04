import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createPaymentApi } from '../api/paymentsApi';
import toast from 'react-hot-toast';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';

const METHODS = [
  { id: 'bkash', label: 'bKash', icon: Smartphone, color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { id: 'nagad', label: 'Nagad', icon: Smartphone, color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'card', label: 'Card', icon: CreditCard, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'cash', label: 'Cash', icon: Banknote, color: 'bg-green-50 border-green-200 text-green-700' },
];

export default function PaymentPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state ?? {};

  const [method, setMethod] = useState('bkash');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await createPaymentApi({ appointment_id: appointmentId, method });
      const payment = res.data.payment;
      if (payment.status === 'completed') {
        toast.success('Payment successful!');
      } else {
        toast.success('Payment recorded. Please pay cash at the chamber.');
      }
      navigate('/my-appointments');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Payment</h1>
      <p className="text-gray-500 text-sm mb-6">Complete your payment for the appointment.</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Fee display */}
        <div className="text-center py-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-400">Amount Due</p>
          <p className="text-3xl font-bold text-gray-900">৳{state.fee || '—'}</p>
          {state.doctorName && (
            <p className="text-sm text-gray-500 mt-1">Dr. {state.doctorName}</p>
          )}
        </div>

        {/* Method selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            {METHODS.map((m) => {
              const Icon = m.icon;
              const isActive = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    isActive
                      ? `${m.color} ring-2 ring-offset-1 ring-teal-400`
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {method !== 'cash' && (
          <p className="text-xs text-gray-400 text-center">
            This is a simulated payment. No real transaction will occur.
          </p>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : method === 'cash' ? 'Confirm Cash Payment' : `Pay ৳${state.fee || '—'}`}
        </button>
      </div>
    </div>
  );
}
