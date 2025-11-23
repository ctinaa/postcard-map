'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostcardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page - the modal is now the primary way to add postcards
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">📮</div>
        <p className="text-gray-600">Redirecting to map...</p>
      </div>
    </div>
  );
}

