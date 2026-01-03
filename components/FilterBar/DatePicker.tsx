"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Button } from "../ui/Button";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleJumpToToday = () => {
    onDateChange(new Date());
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="mr-2">📅</span>
        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="mb-2">
              <Button
                variant="outline"
                onClick={handleJumpToToday}
                className="w-full text-sm"
              >
                Jump to Today
              </Button>
            </div>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onDateChange(date);
                setIsOpen(false);
              }}
              className="rdp-custom"
            />
          </div>
        </>
      )}
    </div>
  );
}
