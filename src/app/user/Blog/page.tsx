'use client';

import { useState } from 'react';
import { Calendar, User, ArrowRight, Smartphone, Laptop, Camera, Monitor, Tv, Shield } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  icon: React.ReactElement;
  image: string;
  featured?: boolean;
}

type Category = "All" | "Mobile Repair" | "Laptop Repair" | "Computer Repair" | "Camera Repair" | "CCTV Repair" | "Android TV Repair";

const Blog = () => {
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "5 Signs Your Smartphone Needs Professional Repair",
      excerpt: "Don't ignore these warning signs that indicate your mobile device requires expert attention. From battery drain to screen issues, learn when to seek professional help.",
      author: "TechFixPro Team",
      date: "August 5, 2025",
      readTime: "4 min read",
      category: "Mobile Repair",
      icon: <Smartphone className="w-5 h-5" />,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=300&fit=crop",
      featured: true
    },
    {
      id: 2,
      title: "Laptop Running Slow? Here's What You Need to Know",
      excerpt: "Discover the common causes of laptop performance issues and learn professional solutions to restore your device's speed and efficiency.",
      author: "Tech Specialist",
      date: "August 3, 2025",
      readTime: "6 min read",
      category: "Laptop Repair",
      icon: <Laptop className="w-5 h-5" />,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=300&fit=crop"
    },
    {
      id: 3,
      title: "CCTV System Maintenance: Protecting Your Investment",
      excerpt: "Learn essential maintenance tips to keep your CCTV system running optimally and ensure continuous security coverage for your property.",
      author: "Security Expert",
      date: "August 1, 2025",
      readTime: "5 min read",
      category: "CCTV Repair",
      icon: <Shield className="w-5 h-5" />,
      image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&h=300&fit=crop"
    },
    {
      id: 4,
      title: "Android TV Troubleshooting: Common Issues and Solutions",
      excerpt: "Fix common Android TV problems with our expert guide. From connectivity issues to app crashes, get your entertainment system back on track.",
      author: "TV Repair Specialist",
      date: "July 30, 2025",
      readTime: "7 min read",
      category: "Android TV Repair",
      icon: <Tv className="w-5 h-5" />,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=300&fit=crop"
    },
    {
      id: 5,
      title: "Camera Lens Repair: When to DIY vs Professional Service",
      excerpt: "Understand the difference between minor camera issues you can fix yourself and serious problems that require professional camera repair services.",
      author: "Camera Technician",
      date: "July 28, 2025",
      readTime: "5 min read",
      category: "Camera Repair",
      icon: <Camera className="w-5 h-5" />,
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=300&fit=crop"
    },
    {
      id: 6,
      title: "Computer Hardware Upgrades: Boost Your PC Performance",
      excerpt: "Maximize your computer's potential with strategic hardware upgrades. Learn which components to prioritize for the best performance gains.",
      author: "Hardware Expert",
      date: "July 25, 2025",
      readTime: "8 min read",
      category: "Computer Repair",
      icon: <Monitor className="w-5 h-5" />,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=300&fit=crop"
    }
  ];

  const categories: Category[] = ["All", "Mobile Repair", "Laptop Repair", "Computer Repair", "Camera Repair", "CCTV Repair", "Android TV Repair"];

  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    console.log('Newsletter subscription submitted');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mt-5 mb-4">TechFixPro Blog</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Expert insights, repair tips, and industry updates for all your electronic device needs
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === "All" && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Article</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-64 lg:h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                      {featuredPost.icon}
                      <span className="ml-1">{featuredPost.category}</span>
                    </span>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-2" />
                      <span className="mr-4">{featuredPost.author}</span>
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="mr-4">{featuredPost.date}</span>
                      <span>• {featuredPost.readTime}</span>
                    </div>
                  </div>
                  <button 
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    onClick={() => console.log(`Read article: ${featuredPost.id}`)}
                  >
                    Read Full Article
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {selectedCategory === "All" ? "Latest Articles" : `${selectedCategory} Articles`}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(selectedCategory === "All" ? regularPosts : filteredPosts).map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                      {post.icon}
                      <span className="ml-1 hidden sm:inline">{post.category}</span>
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      <span className="mr-3">{post.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                    <button 
                      className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm"
                      onClick={() => console.log(`Read more: ${post.id}`)}
                    >
                      Read More
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need Professional Repair Service?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Don't let broken devices slow you down. Our expert technicians are ready to fix your electronics quickly and efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              onClick={() => console.log('Book repair service')}
            >
              Book Repair Service
            </button>
            <button 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              onClick={() => console.log('Get free quote')}
            >
              Get Free Quote
            </button>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h3>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for the latest repair tips, tech news, and exclusive offers.
          </p>
          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Blog;