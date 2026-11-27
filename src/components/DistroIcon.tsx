import {DistroProfile} from '../types/browser';

interface DistroIconProps {
  distro: DistroProfile;
  className?: string;
}

export function DistroIcon({distro, className = 'w-4 h-4'}: DistroIconProps) {
  if (distro === 'ubuntu') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="4.2" r="1.7" fill="currentColor" />
        <circle cx="5.2" cy="16" r="1.7" fill="currentColor" />
        <circle cx="18.8" cy="16" r="1.7" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 14.5C5 9.8 8.6 6 13.2 6C17.2 6 20 8.8 20 12.2C20 15.2 17.6 17.5 14.6 17.5C12.3 17.5 10.6 15.9 10.6 13.8C10.6 12 12 10.7 13.7 10.7C15.1 10.7 16.2 11.7 16.2 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="13.8" cy="13.2" r="1.1" fill="currentColor" />
    </svg>
  );
}
