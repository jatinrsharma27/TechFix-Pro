'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Wrench, Clock, Award, LucideIcon } from 'lucide-react';

interface ServiceItem {
  title: string;
  image: string;
  description: string;
  features: string[];
  slug: string;
}

interface WhyChooseUsItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const Service: React.FC = () => {
  const router = useRouter();
  
  const services: ServiceItem[] = [
    {
      title: 'Mobile Phone Repair',
      slug: 'mobile-phone-repair',
      image: 'https://t3.ftcdn.net/jpg/14/08/72/94/360_F_1408729419_0cakfro8kE81ffM3V5suDeOk6dhCceCh.jpg',
      description: 'Professional mobile phone repair for all major brands including iPhone, Samsung, OnePlus, Xiaomi, and more. From cracked screens to battery replacements.',
      features: ['Screen replacement', 'Battery replacement', 'Water damage repair', 'Charging port fix', 'Camera repair']
    },
    {
      title: 'Laptop Repair',
      slug: 'laptop-repair',
      image: 'https://www.shutterstock.com/image-photo/laptop-blank-empty-white-screen-600nw-2473466051.jpg',
      description: 'Expert laptop repair services for all brands. We handle hardware failures, software issues, screen replacements, and performance optimization.',
      features: ['Screen replacement', 'Keyboard repair', 'Battery replacement', 'Performance upgrades', 'Data recovery']
    },
    {
      title: 'Computer Repair',
      slug: 'computer-repair',
      image: 'https://media.istockphoto.com/id/93341611/photo/stylish-desktop-computer.jpg?s=612x612&w=0&k=20&c=wtBjkTx-L37GjJa-lB7lSYjMK_zhmVmEU49g-XVnKzE=',
      description: 'Complete desktop computer repair services. We fix hardware issues, software problems, and provide system upgrades.',
      features: ['Hardware diagnostics', 'Operating system reinstall', 'Virus removal', 'Component replacement', 'System optimization']
    },
    {
      title: 'Tablet Repair',
      slug: 'tablet-repair',
      image: 'https://media.istockphoto.com/id/1284146344/photo/empty-screen-tablet-computer-mock-up-view-on-white-background.jpg?s=612x612&w=0&k=20&c=AxuAbqiax-qtQIuXmNlhe7Zg-0uUyOxpX8FknDOUy3o=',
      description: 'Comprehensive tablet repair services for iPad, Samsung Galaxy Tab, Microsoft Surface, and other tablet devices.',
      features: ['Touch screen repair', 'Battery service', 'Charging issues', 'Software troubleshooting', 'Speaker repair']
    },
    {
      title: 'TV Repair',
      slug: 'tv-repair',
      image: 'https://media.istockphoto.com/id/1408666140/photo/4k-flat-screen-lcd-tv-or-oled-white-blank-hd-monitor-mockup-with-clipping-path-isolated-on.jpg?s=612x612&w=0&k=20&c=yZgrBOjefiZXrZcR-nb5m7DhtsSpwH1fV6UQWZqMP-k=',
      description: 'Expert TV repair services for LED, LCD, OLED, and Smart TVs. We handle screen issues, sound problems, and smart TV functionality.',
      features: ['Screen replacement', 'Backlight repair', 'Sound system fix', 'Smart TV setup', 'Port repair']
    },
    {
      title: 'Camera Repair',
      slug: 'camera-repair',
      image: 'https://img.freepik.com/premium-photo/highquality-camera-mockup-vibrant-dslr-with-realistic-textures-white-background-photography-equipment-presentations_1086681-11020.jpg',
      description: 'Professional camera repair services for DSLR, mirrorless, and digital cameras. We service Canon, Nikon, Sony, and more.',
      features: ['Lens calibration', 'Sensor cleaning', 'Shutter mechanism', 'LCD screen repair', 'Button fixes']
    },
    {
      title: 'Air Conditioner Repair',
      slug: 'air-conditioner-repair',
      image: 'https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcGYtczExMC10ZC0wMTQ0OC1rcmVub3ZmdC5qcGc.jpg',
      description: 'Professional AC and cooler repair services. We fix cooling issues, electrical problems, and provide maintenance services.',
      features: ['Cooling system repair', 'Electrical fixes', 'Gas refilling', 'Filter cleaning', 'Thermostat repair']
    },
    {
      title: 'Washing Machine Repair',
      slug: 'washing-machine-repair',
      image: 'https://img.freepik.com/premium-psd/washing-machine-mockup-front-view_1332-23452.jpg',
      description: 'Complete washing machine repair services for all brands. We fix mechanical issues, electrical problems, and drainage issues.',
      features: ['Motor repair', 'Drum replacement', 'Water pump fix', 'Control panel repair', 'Drainage issues']
    },
    {
      title: 'Refrigerator Repair',
      slug: 'refrigerator-repair',
      image: 'https://static.vecteezy.com/system/resources/previews/039/344/259/non_2x/realistic-open-and-closed-modern-refrigerator-mockup-with-shelves-empty-wide-fridge-with-sensor-panel-home-kitchen-refrigerator-set-vector.jpg',
      description: 'Expert refrigerator repair services. We fix cooling problems, compressor issues, and electrical faults for all brands.',
      features: ['Compressor repair', 'Cooling system fix', 'Thermostat replacement', 'Door seal repair', 'Electrical issues']
    },
    {
      title: 'Microwave Repair',
      slug: 'microwave-repair',
      image: 'https://media.istockphoto.com/id/182915079/photo/microwave-oven.jpg?s=612x612&w=0&k=20&c=dbSOoDz0KBawI7wxXkhm3DxuYfK0O6WLiwdx1xu4KhU=',
      description: 'Professional microwave oven repair services. We fix heating issues, turntable problems, and control panel malfunctions.',
      features: ['Magnetron replacement', 'Turntable repair', 'Door latch fix', 'Control panel repair', 'Power issues']
    },
    {
      title: 'Smartwatch Repair',
      slug: 'smartwatch-repair',
      image: 'https://img.freepik.com/premium-photo/round-smart-watch-front-side-isolated-white-background_187299-16121.jpg',
      description: 'Specialized smartwatch repair services for Apple Watch, Samsung Galaxy Watch, and other smart wearables.',
      features: ['Screen replacement', 'Battery replacement', 'Water damage repair', 'Strap replacement', 'Software issues']
    },
    {
      title: 'Gaming Console Repair',
      slug: 'game-console-repair',
      image: 'https://i.fbcd.co/products/original/47990407dd1978f1db3cbe5e901df039cde5551106c97085771ace960c427a50.jpg',
      description: 'Expert gaming console repair for PlayStation, Xbox, Nintendo Switch, and other gaming systems.',
      features: ['HDMI port repair', 'Overheating fix', 'Controller repair', 'Disc drive repair', 'Software issues']
    }
  ];

  const whyChooseUs: WhyChooseUsItem[] = [
    {
      icon: Award,
      title: 'Expert Technicians',
      description: 'Certified professionals with years of experience in electronic repair'
    },
    {
      icon: Clock,
      title: 'Quick Turnaround',
      description: 'Fast repair services with most devices fixed within 24-48 hours'
    },
    {
      icon: Shield,
      title: 'Warranty Guaranteed',
      description: '90-day warranty on all repairs for your peace of mind'
    },
    {
      icon: Wrench,
      title: 'Quality Parts',
      description: 'We use only genuine and high-quality replacement parts'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="absolute inset-0"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mt-10 mb-6 animate-fade-in">
              Professional Electronic Repair Services
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              TechFix Pro - Your trusted partner for all electronic device repairs. 
              Expert service, quality parts, and guaranteed satisfaction.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-black md:text-base">
              <span className="bg-gray-100 bg-opacity-20 px-4 py-2 rounded-full">✓ Same Day Service Available</span>
              <span className="bg-gray-200 bg-opacity-20 px-4 py-2 rounded-full">✓ 90-Day Warranty</span>
              <span className="bg-gray-100 bg-opacity-20 px-4 py-2 rounded-full">✓ Free Diagnostics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Repair Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From smartphones to security systems, we repair all your electronic devices with precision and care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2 flex flex-col h-full"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-62 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                  
                  <div className="space-y-2 flex-grow">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Services Include:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => router.push(`/user/Service/${service.slug}`)}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Get Quote
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose TechFix Pro?</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              We're committed to providing the highest quality repair services with exceptional customer care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors duration-200">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Fix Your Device?</h2>
          <p className="text-lg mb-8 opacity-90">
            Don't let a broken device slow you down. Contact TechFix Pro today for fast, reliable repairs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105">
              Schedule Repair
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 transform hover:scale-105">
              Call Now: (555) 123-4567
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Service;