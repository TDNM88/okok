"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Link } from 'lucide-react';

const NewHeader = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Desktop Header */}
      <header 
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white'}`}
        style={{ height: '72px' }}
      >
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left side - Logo and Menu */}
            <div className="flex items-center space-x-7">
              <div className="h-full">
                <div className="relative w-[150px] h-full">
                  <div className="relative w-full h-full">
                    <Image
                      src="/logo.png"
                      alt="London HSC"
                      className="mix-blend-multiply object-contain"
                      width={150}
                      height={140}
                      priority={true}
                      sizes="(max-width: 150px) 100vw, 150px"
                    />
                  </div>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-blue-600 font-semibold text-sm hover:bg-gray-50"
                  onClick={() => router.push('/')}
                >
                  Trang chủ
                </button>
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-blue-600 font-semibold text-sm hover:bg-gray-50"
                  onClick={() => router.push('/trade')}
                >
                  Giao dịch
                </button>
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-blue-600 font-semibold text-sm hover:bg-gray-50"
                  onClick={() => router.push('/')}
                >
                  Tin tức
                </button>
              </nav>
            </div>

            {/* Right side - Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                className="bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
                onClick={() => {
                  handleLogin();
                  setIsMenuOpen(false);
                }}
              >
                Đăng nhập
              </button>
              <div className="h-6 w-px bg-blue-600"></div>
              <Link href="/register">
                <a 
                  className="bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mở tài khoản
                </a>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMenu}
                className="text-blue-600 hover:text-blue-700 focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="container mx-auto px-4 py-2">
              <div className="flex flex-col space-y-3 py-2">
                <button 
                  className="text-left py-2 px-2 text-blue-600 font-medium hover:bg-blue-50 rounded text-sm"
                  onClick={() => {
                    router.push('/index');
                    setIsMenuOpen(false);
                  }}
                >
                  Trang chủ
                </button>
                <div className="border-t border-gray-200"></div>
                <button 
                  className="text-left py-2 px-2 text-blue-600 font-medium hover:bg-blue-50 rounded text-sm"
                  onClick={() => {
                    router.push('/trade');
                    setIsMenuOpen(false);
                  }}
                >
                  Giao dịch
                </button>
                <div className="border-t border-gray-200"></div>
                <button 
                  className="text-left py-2 px-2 text-blue-600 font-medium hover:bg-blue-50 rounded text-sm"
                  onClick={() => {
                    router.push('/');
                    setIsMenuOpen(false);
                  }}
                >
                  Tin tức
                </button>
                <div className="border-t border-gray-200"></div>
                <button 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 mt-2"
                  onClick={() => {
                    handleLogin();
                    setIsMenuOpen(false);
                  }}
                >
                  Đăng nhập
                </button>
                <button 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700"
                  onClick={() => {
                    handleRegister();
                    setIsMenuOpen(false);
                  }}
                >
                  Mở tài khoản
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default NewHeader;
