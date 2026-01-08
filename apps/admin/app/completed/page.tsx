'use client';

import { CheckCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Suspense } from 'react';

function CompletedPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm'>
        <CardHeader className='text-center pb-4'>
          <div className='mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
            <CheckCircle className='w-8 h-8 text-green-600' />
          </div>
          <CardTitle className='text-2xl font-bold text-gray-800'>
            Account Created Successfully!
          </CardTitle>
          <p className='text-gray-600 mt-2'>
            Welcome to saint community! Your account has been successfully
            created and you&apos;re now ready to get started.
          </p>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='bg-red-50 border red-green-200 rounded-lg p-4'>
            <h3 className='font-semibold text-red-800 mb-2'>
              What&apos;s Next?
            </h3>
            <ul className='text-sm text-red-700 space-y-1'>
              <li>• Your details would be reviewed</li>
              <li>• You would be notified via email</li>
              <li>• You can start using all features</li>
            </ul>
          </div>

          <div className='text-center pt-4 border-t border-gray-200'>
            <p className='text-xs text-gray-500'>
              Need help? Contact support at{' '}
              <a
                href='mailto:support@example.com'
                className='text-green-600 hover:underline'
              >
                support@saintcommunity.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function CompletedMainPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompletedPage/>
    </Suspense>
  );
}
