import { Clock } from 'lucide-react';

export default function TimeSlotPicker({ slots, selected, onSelect }) {
  if (!slots || slots.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        No available slots for this date.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isSelected = selected === slot.time;
        const isDisabled = !slot.available;
        return (
          <button
            key={slot.time}
            disabled={isDisabled}
            onClick={() => onSelect(slot.time)}
            className={`flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors
              ${isDisabled
                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                : isSelected
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400 hover:text-teal-600'
              }`}
          >
            <Clock size={12} />
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
