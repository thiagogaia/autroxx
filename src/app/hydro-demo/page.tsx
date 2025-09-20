'use client';

import React, { useState } from 'react';
import HydroBackGround from '@/components/insignias/HydroBackGround';
import HydroInsignia from '@/components/insignias/HydroInsignia';

type WaterType = 'hydro' | 'tsunami' | 'ice' | 'storm';

export default function HydroDemoPage() {
  const [currentType, setCurrentType] = useState<WaterType>('hydro');

  const changeWaterType = (type: WaterType) => {
    setCurrentType(type);
  };

  return (
    <HydroBackGround>
      <HydroInsignia 
        waterType={currentType}
        showText={true}
        text="HYDRO MASTER"
      />
    </HydroBackGround>
  );
}
