'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shield, Clock, Award, CheckCircle, ArrowLeft, Phone, Mail, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface ServiceDetail {
  slug: string;
  title: string;
  description: string;
  image: string;
  overview: string[];
  repairCategories: {
    category: string;
    items: string[];
  }[];
  pricing: {
    type: string;
    price: string;
  }[];
  process: {
    step: string;
    title: string;
    description: string;
  }[];
  warranty: string;
  turnaround: string;
  reviews: {
    name: string;
    rating: number;
    comment: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

const ServiceDetail: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const services: ServiceDetail[] = [
    {
      slug: 'mobile-phone-repair',
      title: 'Mobile Phone Repair',
      description: 'Mobile phones are a vital part of daily life, and when they break, it can disrupt everything. At TechFix Pro, we make phone repair fast, affordable, and reliable.',
      image: 'https://img.freepik.com/premium-photo/modern-cell-phone-with-white-screen-gray-background_188161-663.jpg',
      overview: [
        'We repair all major brands: Apple, Samsung, OnePlus, Xiaomi, Realme, Oppo, Vivo, Motorola, Nokia & more',
        'Our certified experts use advanced tools and original spare parts',
        'Every repair includes a 15-point quality check',
        'Choose doorstep pickup/drop or visit our service center',
        'Transparent pricing – no hidden charges'
      ],
      repairCategories: [
        {
          category: 'Screen & Display',
          items: ['Cracked/broken screen', 'Touch not working', 'Dead pixels or flickering display', 'Black screen issues']
        },
        {
          category: 'Battery & Power',
          items: ['Battery draining too fast', 'Phone not charging / turning on', 'Overheating problems']
        },
        {
          category: 'Charging & Connectivity',
          items: ['Charging port loose or damaged', 'USB not detected', 'Wi-Fi / Bluetooth issues']
        },
        {
          category: 'Audio & Sound',
          items: ['Speaker not working', 'Microphone not capturing voice', 'Earphone jack issues']
        },
        {
          category: 'Camera Repairs',
          items: ['Blurry or broken lens', 'Camera not opening', 'Front/rear camera not working']
        },
        {
          category: 'Software & Performance',
          items: ['Phone freezing / slow performance', 'Boot loop or stuck on logo', 'Virus removal & OS reinstall']
        },
        {
          category: 'Water / Liquid Damage',
          items: ['Accidental drops in water', 'Moisture damage & cleaning', 'Data recovery (if possible)']
        },
        {
          category: 'Other Repairs',
          items: ['Fingerprint/Face Unlock issues', 'Power/Volume button not working', 'SIM not detected / network issues']
        }
      ],
      pricing: [
        { type: 'Screen Replacement', price: '₹1,500 – ₹5,000' },
        { type: 'Battery Replacement', price: '₹1,000 – ₹2,500' },
        { type: 'Charging Port Repair', price: '₹1,200 – ₹2,000' },
        { type: 'Software Fix', price: '₹800 – ₹1,500' },
        { type: 'Water Damage Service', price: '₹2,000 – ₹4,000' },
        { type: 'Diagnostic Check', price: 'Free with repair' }
      ],
      process: [
        { step: '📲', title: 'Request Pickup / Walk-in', description: 'Book online or visit a nearby service center' },
        { step: '🔍', title: 'Device Diagnosis', description: '15-point diagnostic check. Cost & time estimate shared with you' },
        { step: '🛠️', title: 'Repair & Replacement', description: 'Genuine spare parts used. Updates provided via SMS/Email' },
        { step: '✅', title: 'Quality Check', description: 'Battery life, touchscreen, audio, camera, & network tested' },
        { step: '📦', title: 'Delivery & Support', description: 'Choose doorstep delivery or collect in-store. Free post-repair consultation for 30 days' }
      ],
      warranty: '3–6 months warranty on all repairs',
      turnaround: '2-3 hours for minor repairs, up to 3 days for major repairs',
      reviews: [
        { name: 'Rahul K.', rating: 5, comment: 'Got my iPhone screen replaced in 2 hours. Great service!' },
        { name: 'Neha S.', rating: 4, comment: 'Affordable prices and fast delivery.' },
        { name: 'Arjun M.', rating: 5, comment: 'They fixed my OnePlus charging port within a day.' }
      ],
      faqs: [
        { question: 'How long will repair take?', answer: 'Most minor repairs take 2–3 hours; major repairs may take up to 3 days.' },
        { question: 'Do you use original parts?', answer: 'Yes, only genuine or high-quality spare parts.' },
        { question: 'Do you offer doorstep service?', answer: 'Yes, pickup & delivery available in selected cities.' },
        { question: 'What if my phone can\'t be repaired?', answer: 'Only diagnosis fee of ₹300 is charged.' }
      ]
    }
  ];

  const service = services.find(s => s.slug === slug) || services[0];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleGetQuote = () => {
    router.push(`/user/Contact?service=${encodeURIComponent(service.title)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Services
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{service.title}</h1>
              <p className="text-xl mb-8 opacity-90">{service.description}</p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{service.turnaround}</span>
                </div>
                <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <Shield className="w-5 h-5 mr-2" />
                  <span>{service.warranty}</span>
                </div>
              </div>
              <button
                onClick={handleGetQuote}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                Get Quote Now
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={service.image}
                alt={service.title}
                className="max-w-md w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Overview */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">📝 Service Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {service.overview.map((item, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span className="text-gray-700 text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What We Repair */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">🔧 What We Repair (Detailed)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {service.repairCategories.map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{category.category}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Guide */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">💰 Pricing Guide</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repair Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {service.pricing.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Service Timeline */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">⏳ Service Timeline (Step-by-Step)</h2>
          <div className="space-y-8">
            {service.process.map((step, index) => (
              <div key={index} className="flex items-start bg-white p-6 rounded-lg shadow-lg">
                <div className="text-4xl mr-6">{step.step}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warranty & Assurance */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">🛡️ Warranty & Assurance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.warranty}</h3>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free diagnostic check</h3>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% genuine parts</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">🌟 Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {service.reviews.map((review, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">"{review.comment}"</p>
                <p className="text-sm font-semibold text-gray-900">– {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">❓ FAQs</h2>
          <div className="space-y-4">
            {service.faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700">👉 {faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">📞 Get in Touch</h2>
          <p className="text-xl mb-8 opacity-90">
            Contact us today for a free diagnostic and quote for your {service.title.toLowerCase()} needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleGetQuote}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Free Quote
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center">
              <span>📍 TechFix Pro – Main Branch, New Delhi</span>
            </div>
            <div className="flex items-center justify-center">
              <Phone className="w-5 h-5 mr-2" />
              <span>📞 +91-8200221415</span>
            </div>
            <div className="flex items-center justify-center">
              <Mail className="w-5 h-5 mr-2" />
              <span>✉️ support@techfixpro.com</span>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-lg opacity-90">🌐 www.techfixpro.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;