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

  // Initialize EmailJS when component mounts
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
        { scale: 0.8, autoAlpha: 0 },
        { duration: 0.5, scale: 1, autoAlpha: 1, ease: 'power3.out' }
      );
    } else if (!isOpen && modalRef.current && overlayRef.current) {
      gsap.to(modalRef.current, { duration: 0.3, scale: 0.8, autoAlpha: 0 });
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

    const templateParams = {
      user_name: name,
      message: message,
    };

    try {
      // Fixed: removed duplicate emailjs and added proper error handling
      await emailjs.send('service_8zxj0fc', 'template_i9ox1sq', templateParams, 'xYEOOVmxPGh4ooecL');
      
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
        className="fixed inset-0 bg-black bg-opacity-80"
        style={{ pointerEvents: isOpen ? 'auto' : 'none', opacity: 0 }}
        onClick={onClose}
      />

      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 max-w-md w-full bg-gray-900 text-white rounded-lg p-6 shadow-lg"
        style={{
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: 50,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-4">Send Feedback</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            disabled={sending}
            required
          />
          <textarea
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-y"
            rows={4}
            disabled={sending}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-fuchsia-600 text-white hover:bg-fuchsia-700 disabled:opacity-50"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default FeedbackFormModal;