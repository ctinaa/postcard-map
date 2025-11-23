'use client';

import Image from 'next/image';
import { Postcard } from '@/types/postcard';

interface PostcardMarqueeProps {
  postcards: Postcard[];
}

export default function PostcardMarquee({ postcards }: PostcardMarqueeProps) {
  if (postcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No postcards yet. Add your first one!</p>
      </div>
    );
  }

  // Duplicate postcards for seamless loop
  const duplicatedPostcards = [...postcards, ...postcards, ...postcards];

  return (
    <div className="relative overflow-hidden py-8">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
      
      {/* Marquee container */}
      <div className="flex animate-marquee hover:pause-marquee">
        {duplicatedPostcards.map((postcard, index) => (
          <div
            key={`${postcard.id}-${index}`}
            className="flex-shrink-0 mx-4 group"
          >
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-72 transform hover:scale-105">
              <div className="relative w-full h-48 bg-gray-200">
                <Image
                  src={postcard.image_url}
                  alt={postcard.title || postcard.city || 'Postcard'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {postcard.title || postcard.city || 'Untitled'}
                </h3>
                {postcard.city && postcard.country && (
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {postcard.city}, {postcard.country}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add custom CSS for animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-marquee {
          display: flex;
          animation: marquee ${postcards.length * 4}s linear infinite;
        }

        .animate-marquee:hover.pause-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

