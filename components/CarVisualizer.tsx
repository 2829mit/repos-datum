
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TankOption, AccessoryOption, DispensingUnitOption, SafetyUpgradeOption, IotOption } from '../types';
import { getVisualizerLayers } from '../utils/vehicleHelpers';

interface CarVisualizerProps {
  tank: TankOption['id'];
  mechanicalOptions?: AccessoryOption[];
  dispensingUnits?: DispensingUnitOption[];
  safetyUnits?: AccessoryOption[];
  safetyUpgrades: SafetyUpgradeOption[];
  decantation?: IotOption[];
  hasPlatform?: boolean;

  // Custom Product Props
  selectedProduct?: 'rfd-portable' | 'rfd-z';
  rfdZBase?: string;
  rfdZUpgrades?: string[];
  latestAddedOption?: { name: string, description?: string } | null;
}

const CarVisualizer: React.FC<CarVisualizerProps> = ({ 
  tank, 
  mechanicalOptions = [], 
  dispensingUnits = [], 
  safetyUnits = [], 
  safetyUpgrades,
  decantation = [],
  hasPlatform = false,

  selectedProduct = 'rfd-z',
  rfdZBase = '',
  rfdZUpgrades = [] as string[],
  latestAddedOption = null,
}) => {
  const s3BaseUrl = 'https://drf-media-data.s3.ap-south-1.amazonaws.com/compressor_aws/ShortPixelOptimized/';

  const getRfdZLayers = () => {
    const hasTransportation = rfdZUpgrades?.includes('transportation');
    const hasCommissioning = rfdZUpgrades?.includes('packing-forwarding');

    if (hasTransportation && hasCommissioning) {
      const isCommissioningLatest = 
        latestAddedOption?.name === 'Commissioning' || 
        rfdZUpgrades[rfdZUpgrades.length - 1] === 'packing-forwarding';
      
      if (isCommissioningLatest) {
        return ['https://i.postimg.cc/QtdGh3NL/Whats-App-Image-2026-09-23-at-2-53-11-PM.jpg'];
      } else {
        return ['https://i.postimg.cc/bY1Nj9ZJ/pakced-datum.png'];
      }
    }

    if (hasTransportation) {
      return ['https://i.postimg.cc/bY1Nj9ZJ/pakced-datum.png'];
    }

    if (hasCommissioning) {
      return ['https://i.postimg.cc/QtdGh3NL/Whats-App-Image-2026-09-23-at-2-53-11-PM.jpg'];
    }

    const images: { url: string; order: number }[] = [];
    
    // Bottom most image
    images.push({ url: 'https://i.postimg.cc/SKk5P9yG/fullll-datummm.png', order: 2 });

    if (rfdZBase === 'datum-2kl' || rfdZBase === 'datum-1kl') {
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/3-Fire-Screen-common%20(1).png', order: 3 });
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/1-TANK-2kl%20(1).png', order: 4 });
    }

    // Default DU dispenser image rendered before any option selection
    images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/5-Dispenser-common%20(1).png', order: 8 });

    const isLmStampingActive = rfdZUpgrades?.includes('lm-stamping');
    const isLmStampingLatest = isLmStampingActive && (
      latestAddedOption?.name === 'LM Stamping & Calibration Kit' ||
      (!latestAddedOption && rfdZUpgrades[rfdZUpgrades.length - 1] === 'lm-stamping')
    );

    if (rfdZUpgrades?.includes('fuel-monitoring')) {
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/2-tank%20ratg-2kl%20(1).png', order: 6 });
      if (!isLmStampingLatest) {
        images.push({ url: 'https://i.postimg.cc/MpmcRSd7/app-ratg-(1).png', order: 21 });
      }
    }

    if (rfdZUpgrades?.includes('safety-security')) {
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/4-AFSS-common%20(1).png', order: 7 });
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/8-Camera-common%20(1).png', order: 11 });
      images.push({ url: 'https://i.postimg.cc/L4L9krXj/bucket.png', order: 1 });
      images.push({ url: 'https://i.postimg.cc/qMwWdN0S/manhole-assembly2.png', order: 4 });
      if (!isLmStampingLatest) {
        images.push({ url: 'https://i.postimg.cc/Njc95M79/app-afs-(1).png', order: 22 });
      }
    }

    if (rfdZUpgrades?.includes('lm-stamping')) {
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/6-Filteration-common%20(1).png', order: 9 });
      if (isLmStampingLatest) {
        images.push({ url: 'https://i.postimg.cc/VNVG169w/3S-VC-0311-page-0001.jpg', order: 30 });
      }
      images.push({ url: 'https://i.postimg.cc/y6c1hwd9/10jar.png', order: 25 });
      images.push({ url: 'https://i.postimg.cc/SQCSLwsn/hydrometer-(1).png', order: 26 });
    }

    if (rfdZUpgrades?.includes('secure-fueling')) {
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/7-RFID-common%20(1).png', order: 10 });
      if (!isLmStampingLatest) {
        images.push({ url: 'https://i.postimg.cc/PJxXLCSf/RFID.png', order: 24 });
      }
    }

    const sortedImages = images
      .sort((a, b) => a.order - b.order)
      .map(item => item.url);

    return sortedImages;
  };


  const layers = selectedProduct === 'rfd-z'
    ? getRfdZLayers()
    : getVisualizerLayers(
        tank, 
        mechanicalOptions, 
        dispensingUnits, 
        safetyUnits, 
        safetyUpgrades, 
        decantation,
        hasPlatform
      );

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-white overflow-hidden group p-4">
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {latestAddedOption && latestAddedOption.description && (
            <motion.div
              key={latestAddedOption.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg max-w-md border border-white/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></span>
                <p className="text-sm font-medium leading-tight">{latestAddedOption.name}</p>
              </div>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{latestAddedOption.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative w-5/6 h-5/6 flex items-center justify-center mt-8">
        {layers.map((layerUrl, index) => {
          const isDatumDoor = layerUrl.includes('10-Datum%20open%20door');
          const isLmCertificate = layerUrl === 'https://i.postimg.cc/VNVG169w/3S-VC-0311-page-0001.jpg';
          
          if (isLmCertificate) {
            return (
              <motion.div
                key={`${layerUrl}-${index}`}
                className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 w-[38%] max-w-[340px] z-30 pointer-events-auto"
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <img
                  src={layerUrl}
                  alt="Legal Metrology Stamping & Verification Certificate"
                  className="w-full h-auto object-contain rounded-lg shadow-2xl border border-gray-300 bg-white"
                />
              </motion.div>
            );
          }
          
          return (
            <motion.img
                key={`${layerUrl}-${index}`}
                src={layerUrl}
                alt={`Configuration Layer ${index}`}
                className="absolute inset-0 object-contain w-full h-full"
                style={{ zIndex: (index + 1) * 10 }}
                initial={isDatumDoor ? { opacity: 0, scale: 0.8, x: 20 } : { opacity: 0 }}
                animate={isDatumDoor ? { opacity: 1, scale: 1, x: 0 } : { opacity: 1 }}
                transition={isDatumDoor ? { type: "spring", stiffness: 200, damping: 20, delay: 0.1 } : { duration: 0.3 }}
            />
          );
        })}
        {layers.length === 0 && (
             <p className="text-gray-400">Loading Configuration...</p>
        )}
      </div>
    </div>
  );
};

export default CarVisualizer;
