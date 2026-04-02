import React from 'react';
import { cn } from '@/lib/utils';

interface MapContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A wrapper component for map displays (like MapLibre or Leaflet) to prevent
 * z-index issues where the map canvas renders on top of other UI elements
 * like dropdowns, dialogs, or sidebars.
 * 
 * It applies `relative` and `z-0` to create a new stacking context, ensuring
 * the map respects the standard DOM flow.
 */
const MapContainer: React.FC<MapContainerProps> = ({ children, className }) => {
  return (
    <div className={cn('relative z-0 h-full w-full overflow-hidden rounded-lg border', className)}>
      {children}
    </div>
  );
};

export default MapContainer;