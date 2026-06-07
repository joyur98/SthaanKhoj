import { useState } from "react";

function ContactLandlordModal({ isOpen, onClose, room }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: `Hi, I am interested in your property "${room?.title || 'listed'}" in ${room?.location || 'your area'}. Please let me know when it is available for viewing.`,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would call an API to send the message
    console.log("Message sent to landlord:", formData);
    alert("Message sent successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-900 border border-gray-100/70 dark:border-white/5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Contact Landlord
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Send a direct message to the landlord to inquire about this property. They will receive your contact information along with the message.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-black dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-black dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                  placeholder="98XXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-black dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-black dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 shadow-[0_4px_14px_rgba(16,185,129,0.22)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.32)] transition-all hover:-translate-y-0.5"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactLandlordModal;
