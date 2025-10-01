'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  return (
    <div className='min-h-screen flex'>
      {/* Left Panel - Visual/Marketing */}
      <div className='hidden lg:flex lg:w-2/3 relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-r-3xl overflow-hidden'>
        {/* Background Image Placeholder */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-indigo-900/80'></div>

        {/* Content */}
        <div className='relative z-10 flex flex-col justify-between p-12 text-white'>
          {/* Top Branding */}
          <div className='flex items-center gap-3'>
            <span className='text-xl font-semibold'>SAINTS COMMUNITY</span>
            <div className='flex gap-1'>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
              <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
              <div className='w-3 h-3 bg-white rounded-full'></div>
            </div>
          </div>

          {/* Center Content */}
          <div className='text-center'>
            <h1 className='text-6xl font-bold mb-6'>Analytics Portal</h1>
            <p className='text-xl opacity-90 max-w-md mx-auto'>
              Lorem ipsum dolor cadet imanu hitoshi utare gabe chim du interi
              dolor cadet.
            </p>
          </div>

          {/* Bottom Pagination */}
          <div className='flex justify-center gap-2'>
            <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
            <div className='w-3 h-3 bg-gray-400 rounded-full'></div>
            <div className='w-3 h-3 bg-gray-400 rounded-full'></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className='w-full lg:w-1/3 bg-white flex items-center justify-center p-8'>
        <div className='w-full max-w-md'>
          {/* Title */}
          <h2 className='text-3xl font-bold text-black text-center mb-8'>
            Hello Again!
          </h2>

          {/* Initial Login Button */}
          <button className='w-full border border-black text-black py-3 px-6 rounded-lg font-medium mb-6 hover:bg-gray-50 transition-colors'>
            Log In
          </button>

          {/* Separator */}
          <div className='flex items-center mb-6'>
            <div className='flex-1 h-px bg-gray-300'></div>
            <span className='px-4 text-gray-500 text-sm'>
              Log in with your details
            </span>
            <div className='flex-1 h-px bg-gray-300'></div>
          </div>

          {/* Login Form */}
          <form className='space-y-6'>
            {/* Email Input */}
            <div>
              <label className='block text-black font-medium mb-2'>
                Email Address
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
                  <svg
                    className='w-5 h-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <input
                  type='email'
                  defaultValue='Johndoe@gmail.com'
                  className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className='block text-black font-medium mb-2'>
                Password
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
                  <svg
                    className='w-5 h-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  defaultValue='Johndoe123'
                  className='w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2'
                >
                  {showPassword ? (
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                  ) : (
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className='flex items-center justify-between'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className='w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2'
                />
                <span className='ml-2 text-black'>Keep me logged in</span>
              </label>
              <a href='#' className='text-blue-600 hover:underline'>
                Forgot password?
              </a>
            </div>

            {/* Main Login Button */}
            <button
              type='submit'
              className='w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
