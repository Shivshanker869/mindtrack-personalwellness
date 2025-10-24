import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Calendar, TrendingUp, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-6 py-20 relative">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium">
              <Heart className="h-4 w-4" />
              Your wellness journey starts here
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Build Better Habits,
              <br />
              <span className="bg-gradient-growth bg-clip-text text-transparent">
                Track Your Growth
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              MindTrack helps you build lasting habits, track your mood, and visualize your progress with beautiful insights and motivational support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-growth hover:opacity-90 transition-opacity">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Thrive
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to support your wellness journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-card shadow-soft hover:shadow-glow transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-gradient-growth flex items-center justify-center mb-6">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Daily Check-ins</h3>
            <p className="text-muted-foreground">
              Track your habits and mood daily with simple, beautiful interfaces that keep you motivated.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card shadow-soft hover:shadow-glow transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-gradient-calm flex items-center justify-center mb-6">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Visual Streaks</h3>
            <p className="text-muted-foreground">
              See your progress at a glance with calendar views and streak tracking that celebrate consistency.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card shadow-soft hover:shadow-glow transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-gradient-energy flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Analytics</h3>
            <p className="text-muted-foreground">
              Understand your patterns with beautiful charts and insights about your wellness trends.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-growth rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands building better habits and happier lives
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2024 MindTrack. Built with care for your wellness.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;