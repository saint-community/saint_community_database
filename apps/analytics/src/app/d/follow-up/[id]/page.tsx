'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FollowUpDetailsPage(): React.JSX.Element {
  const params = useParams();
  const sessionId = params?.id as string;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center space-x-4">
        <Link 
          href="/d/follow-up" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Follow-Up</span>
        </Link>
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-gray-900">
          Follow-Up Session Details
        </h1>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">
            Session ID: {sessionId}
          </p>
          
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Session Information</h3>
              <p className="text-gray-600 mt-1">
                This is a placeholder for detailed follow-up session information.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Participants</h3>
              <p className="text-gray-600 mt-1">
                Participant details and attendance information will be displayed here.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Follow-Up Notes</h3>
              <p className="text-gray-600 mt-1">
                Follow-up notes and progress updates will be shown in this section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}