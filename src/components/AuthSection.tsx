"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus, Users, Calendar, MessageSquare } from "lucide-react";

export default function AuthSection() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4">
            Welcome to <span className="text-primary">Rent My Life</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect with your community, share your skills, and discover amazing experiences. 
            Join the social rental revolution today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/register")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-3"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/login")}
              className="border-border hover:bg-accent font-medium px-8 py-3"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-display">Connect & Share</CardTitle>
              <CardDescription className="text-muted-foreground">
                Build meaningful connections with people in your community and share your skills.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-display">Book Services</CardTitle>
              <CardDescription className="text-muted-foreground">
                Find and book services from trusted community members with verified profiles.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-display">Stay Connected</CardTitle>
              <CardDescription className="text-muted-foreground">
                Chat directly with hosts, share experiences, and build lasting relationships.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-border bg-card/50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                Ready to join the community?
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your account in minutes and start connecting with amazing people near you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push("/register")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => router.push("/login")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Services Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">99%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}