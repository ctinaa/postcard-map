'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Postcard } from '@/types/postcard';

interface PostcardCarouselProps {
  postcards: Postcard[];
  autoAdvance?: boolean;
  intervalMs?: number;
}

export default function PostcardCarousel({ 
  postcards, 
  autoAdvance = true, 
  intervalMs = 3000 
}: PostcardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoAdvance || postcards.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % postcards.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoAdvance, intervalMs, postcards.length]);

  if (postcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No postcards yet. Add your first one!</p>
      </div>
    );
  }

  const nextPostcard = () => {
    setCurrentIndex((prev) => (prev + 1) % postcards.length);
  };

  const prevPostcard = () => {
    setCurrentIndex((prev) => (prev - 1 + postcards.length) % postcards.length);
  };

  const currentPostcard = postcards[currentIndex];

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="flex items-center justify-center gap-4">
        {/* Previous Button */}
        <button
          onClick={prevPostcard}
          className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors flex-shrink-0"
          aria-label="Previous postcard"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Postcard Display */}
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="relative w-full h-64 mb-4 bg-gray-200 rounded overflow-hidden">
            <Image
              src={currentPostcard.image_url}
              alt={currentPostcard.title || currentPostcard.city || 'Postcard'}
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {currentPostcard.title || currentPostcard.city || 'Untitled'}
            </h3>
            {currentPostcard.city && currentPostcard.country && (
              <p className="text-gray-600">
                {currentPostcard.city}, {currentPostcard.country}
              </p>
            )}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={nextPostcard}
          className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors flex-shrink-0"
          aria-label="Next postcard"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {postcards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label={`Go to postcard ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

