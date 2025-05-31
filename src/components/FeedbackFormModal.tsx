import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import emailjs from '@emailjs/browser';

interface FeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackFormModal: React.FC<FeedbackFormModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    emailjs.init('xYEOOVmxPGh4ooecL');
  }, []);

  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { autoAlpha: 0 },
        { duration: 0.3, autoAlpha: 1 }
      );
      gsap.fromTo(
        modalRef.current,
        { y: 100, autoAlpha: 0 },
        { duration: 0.5, y: 0, autoAlpha: 1, ease: 'power3.out' }
      );
    } else if (!isOpen && modalRef.current && overlayRef.current) {
      gsap.to(modalRef.current, { duration: 0.3, y: 100, autoAlpha: 0 });
      gsap.to(overlayRef.current, { duration: 0.3, autoAlpha: 0 });
    }
  }, [isOpen]);

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('Please fill in both fields');
      return;
    }
    setError('');
    setSending(true);

    try {
      await emailjs.send(
        'service_8zxj0fc',
        'template_i9ox1sq',
        { user_name: name, message },
        'xYEOOVmxPGh4ooecL'
      );
      
      alert(`Thanks, ${name}! Your message has been received.`);
      setName('');
      setMessage('');
      onClose();
    } catch (err) {
      console.error('EmailJS Error:', err);
      setError('Oops! Something went wrong. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        style={{ 
          pointerEvents: isOpen ? 'auto' : 'none', 
          opacity: 0,
          touchAction: 'none' // Prevent iOS scroll bounce
        }}
        onClick={onClose}
      />

      <div
        ref={modalRef}
        className="fixed top-4 sm:top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-1/2
                  w-[calc(100%-2rem)] sm:w-full max-w-md 
                  bg-gray-900 text-white rounded-lg p-4 sm:p-6 shadow-xl
                  max-h-[90vh] overflow-y-auto"
        style={{
          opacity: 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: 50,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Send Feedback</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 sm:px-3 sm:py-2
                       focus:outline-none focus:ring-2 focus:ring-fuchsia-500
                       text-base sm:text-sm placeholder-gray-400"
            disabled={sending}
            required
          />
          <textarea
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 sm:px-3 sm:py-2
                       focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none
                       text-base sm:text-sm placeholder-gray-400 min-h-[120px]"
            disabled={sending}
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 sm:py-2 rounded-lg bg-gray-700 hover:bg-gray-600/80
                         transition-colors text-sm font-medium min-h-[44px]"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-3 sm:py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700
                         transition-colors text-sm font-medium min-h-[44px] disabled:opacity-50"
              disabled={sending}
            >
              {sending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default FeedbackFormModal;
