'use client';

import { useState, useEffect, useRef } from 'react';
import { Wrench, Smartphone, Monitor, Headphones, Zap, Clock, Shield, Award, Star, MapPin, Phone, Mail, CheckCircle, TrendingUp, Users, ThumbsUp, Camera, Tv, Tablet } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
interface Service {
  title: string;
  description: string;
  image: string;
}

interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
  stat: string;
}

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  comment: string;
  service: string;
}

interface Stat {
  number: string;
  label: string;
  icon: React.ReactElement;
}

interface ProcessStep {
  step: string;
  title: string;
  description: string;
  icon: React.ReactElement;
}

const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const services: Service[] = [
    {
      title: "Mobile Repair",
      description: "Screen replacements, battery issues, water damage recovery",
      image: "https://t3.ftcdn.net/jpg/14/08/72/94/360_F_1408729419_0cakfro8kE81ffM3V5suDeOk6dhCceCh.jpg"
    },
    {
      title: "Computer Repair", 
      description: "Hardware diagnostics, software troubleshooting, virus removal",
      image: "https://media.istockphoto.com/id/93341611/photo/stylish-desktop-computer.jpg?s=612x612&w=0&k=20&c=wtBjkTx-L37GjJa-lB7lSYjMK_zhmVmEU49g-XVnKzE="
    },
    {
      title: "Tablet Repair",
      description: "iPad, Samsung Galaxy, Surface tablet repairs and servicing",
      image: "https://media.istockphoto.com/id/1284146344/photo/empty-screen-tablet-computer-mock-up-view-on-white-background.jpg?s=612x612&w=0&k=20&c=AxuAbqiax-qtQIuXmNlhe7Zg-0uUyOxpX8FknDOUy3o="
    },
    {
      title: "Camera Repair",
      description: "DSLR, mirrorless camera repairs and lens calibration",
      image: "https://img.freepik.com/premium-photo/highquality-camera-mockup-vibrant-dslr-with-realistic-textures-white-background-photography-equipment-presentations_1086681-11020.jpg"
    },
    {
      title: "TV Repair",
      description: "Smart TV repairs",
      image: "https://media.istockphoto.com/id/1408666140/photo/4k-flat-screen-lcd-tv-or-oled-white-blank-hd-monitor-mockup-with-clipping-path-isolated-on.jpg?s=612x612&w=0&k=20&c=yZgrBOjefiZXrZcR-nb5m7DhtsSpwH1fV6UQWZqMP-k="
    },
    {
      title: 'Smartwatch Repair',
      description: 'Apple Watch, Samsung Galaxy Watch, and other smartwatch repairs',
      image: 'https://img.freepik.com/premium-photo/round-smart-watch-front-side-isolated-white-background_187299-16121.jpg'
    }
  ];

  const features: Feature[] = [
    {
      icon: <Clock className="w-8 h-8 text-emerald-500" />,
      title: "Quick Turnaround",
      description: "Most repairs completed within 24-48 hours",
      stat: "24-48h"
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: "90-Day Warranty",
      description: "All repairs backed by our comprehensive warranty",
      stat: "90 Days"
    },
    {
      icon: <Award className="w-8 h-8 text-emerald-500" />,
      title: "Certified Technicians",
      description: "Experienced professionals with industry certifications",
      stat: "Certified"
    }
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      location: "Downtown",
      rating: 5,
      comment: "Incredible service! My iPhone was completely dead and they brought it back to life in just one day. Professional and affordable.",
      service: "iPhone Screen Repair"
    },
    {
      name: "Mike Chen",
      location: "Tech District", 
      rating: 5,
      comment: "Best computer repair shop in the city! They fixed my laptop's motherboard issue and it's running better than ever.",
      service: "Laptop Motherboard Repair"
    },
    {
      name: "Emily Rodriguez",
      location: "Westside",
      rating: 5,
      comment: "Amazing experience! They repaired my camera lens perfectly and explained everything clearly. Highly recommend!",
      service: "Camera Lens Repair"
    }
  ];

  const stats: Stat[] = [
    { number: "10,000+", label: "Devices Repaired", icon: <CheckCircle className="w-8 h-8 text-blue-500" /> },
    { number: "5+", label: "Years Experience", icon: <TrendingUp className="w-8 h-8 text-blue-500" /> },
    { number: "98%", label: "Success Rate", icon: <ThumbsUp className="w-8 h-8 text-blue-500" /> },
    { number: "2,500+", label: "Happy Customers", icon: <Users className="w-8 h-8 text-blue-500" /> }
  ];

  const processSteps: ProcessStep[] = [
    {
      step: "1",
      title: "Bring Your Device",
      description: "Visit our store or schedule a pickup for your damaged device. We accept all major brands and device types.",
      icon: <Smartphone className="w-8 h-8" />
    },
    {
      step: "2", 
      title: "Free Diagnosis",
      description: "Our certified technicians will diagnose the issue and provide you with a detailed quote within 30 minutes.",
      icon: <Wrench className="w-8 h-8" />
    },
    {
      step: "3",
      title: "Quick Repair",
      description: "Once approved, we'll fix your device using quality parts and test it thoroughly before return.",
      icon: <CheckCircle className="w-8 h-8" />
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animation
      gsap.fromTo('.hero-content', 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      );
      
      gsap.fromTo('.hero-image', 
        { opacity: 0, scale: 0.8, rotation: 10 },
        { opacity: 1, scale: 1, rotation: 3, duration: 1.2, ease: 'power2.out', delay: 0.3 }
      );

      // Stats animation
      gsap.fromTo('.stat-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Services cards animation
      gsap.fromTo('.service-card',
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Features animation
      gsap.fromTo('.feature-card',
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Process steps animation
      gsap.fromTo('.process-step',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.3,
          scrollTrigger: {
            trigger: processRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // CTA section animation
      gsap.fromTo('.cta-content',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Floating animation for hero elements
      gsap.to('.floating', {
        y: -10,
        duration: 2,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1
      });

    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900"></div>
        <div className="absolute inset-0 bg-white bg-opacity-40"></div>
        
        {/* Hero Content */}
        <div ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-black hero-content">
              <div className="inline-flex items-center bg-blue-600 bg-opacity-20 px-4 py-2 rounded-full mb-6">
                <Wrench className="w-5 h-5 mr-2 text-white "  />
                <span className="text-sm font-medium text-white">Professional Electronics Repair</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Expert Electronic
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-700">
                  Repair Service
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 text-gray-500 leading-relaxed">
                Fast and reliable repairs for all your electronic devices. From smartphones to computers  
                we bring your tech back to life with precision and care.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                 onClick={() => window.location.href = '/user/Contact'}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-xl">
                  Request Now
                </button>
                <button className="border-2 border-black text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 hover:text-blue-600 transition-all duration-200 transform hover:scale-105">
                  Call +918200221415
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span>Same Day Service</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span>90-Day Warranty</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span>Free Diagnostics</span>
                </div>
              </div>
            </div>
            
            <div className="relative hero-image">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" 
                alt="Electronic repair workspace"
                className="rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300 floating"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg floating">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Quick Repair</p>
                    <p className="text-sm text-gray-600">Most repairs in 24h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 bg-gray-200 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group stat-item">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section ref={servicesRef} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 px-4 py-2 rounded-full text-blue-600 font-medium mb-4">
              Our Services
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Complete Electronic Repair Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From the smallest smartphone components to complex computer systems, 
              we handle all your electronic repair needs with expertise and precision.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2 service-card">
                <div className="relative overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-68 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 flex items-center group">
                    Learn More 
                    <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section ref={featuresRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose TechFix Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're not just another repair shop. We're your trusted technology partners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 group feature-card">
                <div className="absolute top-6 right-6 text-4xl font-bold text-blue-100 group-hover:text-blue-200 transition-colors">
                  {feature.stat}
                </div>
                <div className="flex items-center mb-6">
                  <div className="bg-white p-3 rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br bg-gray-100 text-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-800">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="relative">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 md:p-12">
              <div className="flex justify-center mb-6">
                <div className="flex space-x-1">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <blockquote className="text-xl md:text-2xl font-light mb-8 text-center leading-relaxed">
                "{testimonials[currentTestimonial].comment}"
              </blockquote>
              
              <div className="text-center">
                <div className="font-semibold text-lg mb-1">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-gray-900 mb-2">
                  {testimonials[currentTestimonial].service}
                </div>
                <div className="flex items-center justify-center text-sm text-gray-900">
                  <MapPin className="w-4 h-4 mr-1" />
                  {testimonials[currentTestimonial].location}
                </div>
              </div>
            </div>

            {/* Testimonial indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentTestimonial ? 'bg-gray-800' : 'bg-gray-400 bg-opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section ref={processRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting your device repaired is simple with our streamlined 3-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((item, index) => (
              <div key={index} className="relative process-step">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                    <span className="text-2xl font-bold">{item.step}</span>
                  </div>
                  <div className="flex justify-center mb-4 text-blue-500">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                {/* Connection line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section ref={ctaRef} className="py-20 bg-gray-100 text-black relative overflow-hidden">
        <div className="absolute inset-0 bg-white bg-opacity-20"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center cta-content">
          <div className="flex justify-center mb-8">
            <div className="bg-white bg-opacity-20 p-4 rounded-2xl">
              <Wrench className="w-12 h-12 text-gray-900" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Fix Your Device?
          </h2>
          <p className="text-xl mb-10 text-gray-800 max-w-3xl mx-auto leading-relaxed">
            Don't let a broken device slow you down. Get your electronics working like new again
            with our expert repair services and industry-leading warranty.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button 
             onClick={() => window.location.href = '/user/Contact'}
            className="bg-blue-700 text-gray-200 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all duration-200 transform hover:scale-105 shadow-xl">
              Schedule Repair Now
            </button>
            <button className="border-2 border-black text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 transform hover:scale-105">
              Get Free Quote
            </button>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center">
              <Phone className="w-5 h-5 mr-3 text-blue-900" />
              <span className="text-lg">(555) 123-4567</span>
            </div>
            <div className="flex items-center justify-center">
              <Mail className="w-5 h-5 mr-3 text-blue-900" />
              <span className="text-lg">info@techfixpro.com</span>
            </div>
            <div className="flex items-center justify-center">
              <MapPin className="w-5 h-5 mr-3 text-blue-900" />
              <span className="text-lg">Downtown Tech District</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;