import { Clock } from 'lucide-react';

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export default function TimeSlotPicker({ slots, selected, onSelect }) {
  if (!slots || slots.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        No slots available for this date.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => {
        const isSelected = selected?.id === slot.id;
        const isDisabled = slot.is_booked;
        return (
          <button
            key={slot.id}
            disabled={isDisabled}
            onClick={() => onSelect(slot)}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-full text-sm font-medium border transition-colors
              ${isDisabled
                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                : isSelected
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400 hover:text-teal-600'
              }`}
          >
            <Clock size={12} />
            {formatTime(slot.start_time)}
          </button>
        );
      })}
    </div>
  );
}
