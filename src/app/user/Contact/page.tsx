'use client'

import React from 'react';
import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';
interface FormData {
  fullName: string;
  contactNo: string;
  email: string;
  address: string;
  service: string;
  brandName: string;
  modelName: string;
  describe: string;
}

interface Testimonial {
  name: string;
  rating: number;
  text: string;
  service: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    contactNo: '',
    email: '',
    address: '',
    service: '',
    brandName: '',
    modelName: '',
    describe: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const { toasts, success, error: showError, removeToast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFormData(prev => ({
          ...prev,
          fullName: user.full_name || '',
          email: user.email || ''
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
            const res = await fetch('/api/user/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          contact_no: formData.contactNo,
          email: formData.email,
          address: formData.address,
          service: formData.service,
          brand_name: formData.brandName,
          model_name: formData.modelName,
          description: formData.describe
        }),
      });

      const data = await res.json();

      if (res.ok) {
        success('Thank you! Your repair request has been submitted successfully!');
        // Notifications will be handled by the API endpoint
        
        setFormData({
          fullName: '',
          contactNo: '',
          email: '',
          address: '',
          service: '',
          brandName: '',
          modelName: '',
          describe: ''
        });
        
        // Redirect after showing success message
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        showError(data.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      rating: 5,
      text: "Excellent service! They fixed my laptop screen in just one day. Professional and affordable.",
      service: "Laptop Screen Repair"
    },
    {
      name: "Mike Chen",
      rating: 5,
      text: "My iPhone was completely dead after water damage. They brought it back to life! Highly recommend.",
      service: "Mobile Water Damage"
    },
    {
      name: "Emily Rodriguez",
      rating: 5,
      text: "Great experience from start to finish. Fair pricing and quick turnaround on my TV repair.",
      service: "TV Repair"
    },
    {
      name: "David Thompson",
      rating: 5,
      text: "Professional technicians who really know what they're doing. Fixed my camera lens perfectly.",
      service: "Camera Repair"
    }
  ];

  const faqs: FAQ[] = [
    {
      question: "How long does a typical repair take?",
      answer: "Most repairs are completed within 24-48 hours. Complex issues may take 3-5 business days. We'll provide an estimated timeline when you drop off your device."
    },
    {
      question: "Do you provide a warranty on repairs?",
      answer: "Yes! All our repairs come with a 90-day warranty covering the specific repair performed. If the same issue occurs within this period, we'll fix it free of charge."
    },
    {
      question: "What if my device cannot be repaired?",
      answer: "If we determine your device cannot be economically repaired, we'll explain why and provide options. There's no charge for diagnosis if we can't fix your device."
    },
    {
      question: "Do you offer pickup and delivery services?",
      answer: "Yes, we offer pickup and delivery services within a 15-mile radius for an additional fee. Contact us to schedule this convenient service."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash, credit cards (Visa, MasterCard, American Express), debit cards, and digital payments like Apple Pay and Google Pay."
    },
    {
      question: "Can you repair water-damaged devices?",
      answer: "Yes, we specialize in water damage recovery. The sooner you bring in your device, the better the chances of successful repair. Turn off the device immediately and don't try to charge it."
    },
    {
      question: "Do you repair devices still under warranty?",
      answer: "We can repair devices under manufacturer warranty, but this may void your warranty. We'll discuss this with you before proceeding with any repairs."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 pt-20 sm:pt-24 lg:pt-28 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-10 pt-0">
              Get Your Device Repaired Today
            </h1>
            <p className="text-xl text-blue-100">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>
        </div>
      </section>

      <div className=" px-0 py-12">
        <div className="grid grid-cols-1 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white shadow-lg p-8 mx-4 my-6 rounded-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Request Repair Service</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Enter your full name"
                  readOnly={!!formData.fullName}
                />
              </div>

                <div>
                  <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    id="contactNo"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Enter your email address"
                  readOnly={!!formData.email}
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address 
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your address (optional)"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Types
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a service</option>
                  <option value="air_conditioner">Air Conditioner / Cooler</option>
                  <option value="camera">Camera</option>
                  <option value="computer">Computer</option>
                  <option value="e_readers">E-Readers</option>
                  <option value="game_console">Game Console</option>
                  <option value="headphones">Headphones / Earbuds</option>
                  <option value="home_theater">Home Theater Systems</option>
                  <option value="laptop">Laptop</option>
                  <option value="microwave">Microwave Oven</option>
                  <option value="mobile">Mobile Phone</option>
                  <option value="monitors">Monitors / Displays</option>
                  <option value="printers">Printers / Scanners</option>
                  <option value="projectors">Projectors</option>
                  <option value="refrigerator">Refrigerator</option>
                  <option value="routers">Routers / Wi-Fi Devices</option>
                  <option value="smart_speakers">Smart Speakers</option>
                  <option value="smartwatch">Smartwatch</option>
                  <option value="speakers">Speakers / Soundbars</option>
                  <option value="tablet">Tablet</option>
                  <option value="tv">TV</option>
                  <option value="washing_machine">Washing Machine</option>
                </select>
              </div>

              <div>
                <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  id="brandName"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter device brand (e.g., Apple, Samsung, HP)"
                />
              </div>

              <div>
                <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  id="modelName"
                  name="modelName"
                  value={formData.modelName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter device model (e.g., iPhone 14, Galaxy S23, Pavilion)"
                />
              </div>

              <div>
                <label htmlFor="describe" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your issue
                </label>
                <textarea
                  id="describe"
                  name="describe"
                  value={formData.describe}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your issue"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isLoading
                    ? 'bg-blue-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Submit Repair Request'
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white mx-4 my-6 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-600">123 Tech Street, Digital City, DC 12345</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">info@techrepair.com</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">Hours</p>
                    <p className="text-gray-600">Mon-Fri: 9AM-6PM<br />Sat: 10AM-4PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Testimonials */}
            <div className="bg-white mx-4 my-6 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What Our Customers Say</h2>
              <div className="space-y-6">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{testimonial.service}</span>
                    </div>
                    <p className="text-gray-700 mb-2">"{testimonial.text}"</p>
                    <p className="text-sm font-semibold text-gray-900">- {testimonial.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Find answers to common questions about our repair services</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0">
                <button
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-8 pb-6">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ transform: `translateY(${index * 60}px)` }}>
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contact;