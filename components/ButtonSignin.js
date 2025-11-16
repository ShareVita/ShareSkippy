'use client';

import { useState } from 'react';
import LoginModal from './LoginModal';

export default function ButtonSignin({ extraStyle = '', text = 'Sign In' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button className={`btn ${extraStyle}`}>{text}</button>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
