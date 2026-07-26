import * as React from 'react';
import { DatePicker } from '@/components/form';

export function Empty() {
  return (
    <DatePicker
      title="Start Date"
      placeholder="Select start date"
      onChange={() => {}}
    />
  );
}

export function Selected() {
  return (
    <DatePicker
      title="End Date"
      description="Optional — leave blank if ongoing"
      value={new Date('2026-08-15T00:00:00')}
      onChange={() => {}}
    />
  );
}

export function Required() {
  return (
    <DatePicker
      title="Date of Birth"
      isRequired
      placeholder="Select date of birth"
      onChange={() => {}}
    />
  );
}

export function WithError() {
  return (
    <DatePicker
      title="Start Date"
      isRequired
      errorMessage="Start date is required"
      onChange={() => {}}
    />
  );
}

export function Disabled() {
  return (
    <DatePicker
      title="Start Date"
      value={new Date('2026-01-10T00:00:00')}
      disabled
      onChange={() => {}}
    />
  );
}
