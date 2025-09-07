import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, Star, Zap, Shield, Heart, ArrowRight, CheckCircle } from 'lucide-react';

export const AuthSection = () => {
  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Monetize Your Skills",
      description: "Turn your expertise and time into income by sharing what you love"
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Build Community",
      description: "Connect with like-minded individuals and create lasting relationships"
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: "Unique Experiences",
      description: "Discover and offer one-of-a-kind experiences you won't find anywhere else"
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Safe & Secure",
      description: "Verified profiles and secure payments ensure peace of mind"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Professional Chef",
      content: "I've earned over $2,000 teaching cooking classes through my kitchen. The platform makes it so easy!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Fitness Trainer",
      content: "Sharing my home gym and training expertise has been incredibly rewarding both financially and personally.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Art Teacher",
      content: "The community here is amazing. I've met so many creative people through my art workshops.",
      rating: 5
    }
  ];

  const useCases = [
    "Teach cooking in your kitchen",
    "Share your home studio space",
    "Offer fitness training sessions",
    "Host creative workshops",
    "Provide consultation services",
    "Rent specialized equipment"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 text-sm font-medium">
            <Sparkles className="h-4 w-4 mr-2" />
            Welcome to the Future of Sharing
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Rent My{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Life
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Share your skills, space, and experiences with others while earning money doing what you love.
            Join thousands who are already building their community and income.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-8 py-6 group">
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Use Cases Section */}
        <div className="bg-card rounded-2xl p-8 md:p-12 mb-16 shadow-sm">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Can You Share?</h2>
            <p className="text-muted-foreground text-lg">
              From professional skills to personal hobbies, there's always someone who wants to learn from you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium">{useCase}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Community Says</h2>
            <p className="text-muted-foreground text-lg">
              Real stories from people who've transformed their passions into income
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of people who are already earning money and building connections by sharing what they love.
            It takes less than 2 minutes to get started.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 group">
              <Link href="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-lg px-8 py-6">
              <Link href="/login">
                Already have an account? Sign in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};