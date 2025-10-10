'use client';

import { useParams } from 'next/navigation';
import PrayerDetailsPage from '@/components/ui/PrayerDetailsPage';

export default function PrayerGroupDetailsPage() {
  const params = useParams();
  const prayerGroupId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <PrayerDetailsPage prayerGroupId={prayerGroupId} />
      </div>
    </div>
  );
}