'use client';
import React, { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Award, Clock, Shield, Target, Heart, Zap, CheckCircle } from 'lucide-react';

interface TeamMember {
    name: string;
    position: string;
    experience: string;
    specialization: string;
    image: string;
}

interface Value {
    icon: JSX.Element;
    title: string;
    description: string;
}

interface Stat {
    number: string;
    label: string;
}

export default function About(): JSX.Element {
    const router = useRouter();
    
    const teamMembers: TeamMember[] = [
        {
            name: "Elon Musk",
            position: "Founder & Lead Technician",
            experience: "25+ years",
            specialization: "Mobile & Computer Repair",
            image: "https://i.pinimg.com/736x/37/d0/b7/37d0b7eecce8cced96c1d676d14dde86.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },

        {
            name: "Bill Gates",
            position: "Hardware Engineer",
            experience: "33+ years",
            specialization: "Laptop & Tablet Repair",
            image: "https://i.pinimg.com/736x/5d/d6/1f/5dd61f9c052c75887a85de4aed3d7be9.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Steve Jobs",
            position: "Customer Service Manager",
            experience: "36+ years",
            specialization: "Customer Relations & Quality Assurance",
            image: "https://i.pinimg.com/736x/e1/d3/61/e1d3619d873851b3b3862e7e2e359871.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Steve Wozniak",
            position: "Senior Electronics Specialist",
            experience: "38+ years",
            specialization: "Audio Equipment & Gaming Consoles",
            image: "https://i.pinimg.com/736x/08/e9/03/08e903dc223c8b45074c0a9c4bfcedd5.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
    ];

    const values: Value[] = [
        {
            icon: <Shield className="w-8 h-8 text-blue-500" />,
            title: "Quality First",
            description: "We never compromise on quality. Every repair is thoroughly tested before returning to our customers."
        },
        {
            icon: <Clock className="w-8 h-8 text-blue-500" />,
            title: "Fast Service",
            description: "We understand how important your devices are. That's why we prioritize quick turnaround times."
        },
        {
            icon: <Heart className="w-8 h-8 text-blue-500" />,
            title: "Customer Care",
            description: "Our customers are our priority. We provide transparent communication and honest pricing."
        },
        {
            icon: <Target className="w-8 h-8 text-blue-500" />,
            title: "Precision",
            description: "Every repair is performed with meticulous attention to detail using the latest tools and techniques."
        }
    ];

    const stats: Stat[] = [
        {
            number: "10,000+",
            label: "Devices Repaired"
        },
        {
            number: "98%",
            label: "Success Rate"
        },
        {
            number: "15+",
            label: "Years Experience"
        },
        {
            number: "24-48h",
            label: "Average Repair Time"
        }
    ];

    const achievements: string[] = [
        "Certified by leading electronics manufacturers",
        "Award-winning customer service",
        "Eco-friendly repair practices",
        "Data security and privacy compliant",
        "Authorized service center for major brands",
        "Local business excellence award recipient"
    ];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero Section */}
            <section className="bg-blue-600 text-white py-20 mt-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            About TechFix Pro
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Your trusted partner for professional electronic repairs since 2009.
                            We combine technical expertise with exceptional customer service to get your devices working perfectly.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Our Story
                            </h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    Founded in 2009 by electronics engineer Elon Musk, TechFix Pro started as a small repair shop
                                    with a simple mission: to provide honest, reliable, and affordable electronic repair services to our community.
                                </p>
                                <p>
                                    What began as a one-person operation has grown into a trusted team of certified technicians,
                                    but our core values remain unchanged. We believe every device deserves a second chance,
                                    and every customer deserves transparent, professional service.
                                </p>
                                <p>
                                    Over the years, we've repaired thousands of devices, from smartphones and laptops to gaming consoles
                                    and professional audio equipment. Our commitment to continuous learning ensures we stay current
                                    with the latest technology and repair techniques.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                alt="Electronics repair workspace"
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Track Record
                        </h2>
                        <p className="text-lg text-gray-600">
                            Numbers that speak to our commitment to excellence
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {stats.map((stat: Stat, index: number) => (
                            <div key={index} className="text-center">
                                <div className="bg-white rounded-lg p-8 shadow-sm">
                                    <div className="text-4xl font-bold text-blue-600 mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-gray-700 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Values Section */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Values
                        </h2>
                        <p className="text-lg text-gray-600">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value: Value, index: number) => (
                            <div key={index} className="text-center">
                                <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
                                    <div className="flex justify-center mb-4">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {value.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Meet Our Expert Team
                        </h2>
                        <p className="text-lg text-gray-600">
                            Certified professionals dedicated to fixing your devices
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member: TeamMember, index: number) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                        {member.name}
                                    </h3>
                                    <p className="text-blue-600 font-medium mb-2">
                                        {member.position}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Experience: {member.experience}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        {member.specialization}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Our Achievements
                            </h2>
                            <p className="text-gray-600 mb-8">
                                We are proud of the recognition we have received for our commitment to quality service and customer satisfaction.
                            </p>
                            <div className="space-y-3">
                                {achievements.map((achievement: string, index: number) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-gray-700">{achievement}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-lg text-center">
                                <Award className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 mb-2">Excellence Award</h3>
                                <p className="text-sm text-gray-600">Local Business Excellence 2023</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-lg text-center">
                                <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 mb-2">Customer Choice</h3>
                                <p className="text-sm text-gray-600">5-Star Rating 2023</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-lg text-center">
                                <Zap className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 mb-2">Tech Innovation</h3>
                                <p className="text-sm text-gray-600">Advanced Repair Techniques</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-lg text-center">
                                <Shield className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 mb-2">Certified Partner</h3>
                                <p className="text-sm text-gray-600">Authorized Service Center</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Experience Our Service?
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join thousands of satisfied customers who trust TechFix Pro with their electronic repairs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => router.push('/user/Contact')}
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Contact Us Today
                        </button>
                        <button 
                            onClick={() => router.push('/user/Service')}
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            View Our Services
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
}