import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Sparkles, Users, Lock, Zap } from "lucide-react";

const features = [
  {
    icon: Star,
    title: "Cosmic Compatibility",
    description: "Our mystical algorithm analyzes your energy and connects you with souls that resonate with yours.",
    color: "text-primary",
  },
  {
    icon: Heart,
    title: "Destiny-Driven Matches",
    description: "Experience meaningful connections guided by fate. Every match is written in the stars.",
    color: "text-romantic",
  },
  {
    icon: Sparkles,
    title: "Enchanted Profiles",
    description: "Showcase your authentic self with profiles that capture your true essence and inner light.",
    color: "text-accent",
  },
  {
    icon: Users,
    title: "Genuine Community",
    description: "Join a community of real people seeking authentic connections and lasting relationships.",
    color: "text-secondary",
  },
  {
    icon: Lock,
    title: "Safe & Secure",
    description: "Your privacy is sacred. We protect your journey with enterprise-grade security.",
    color: "text-primary",
  },
  {
    icon: Zap,
    title: "Instant Chemistry",
    description: "Feel the spark immediately with real-time messaging and interactive connection features.",
    color: "text-romantic",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-cool bg-clip-text text-transparent">
            Your Path to Enchantment
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover what makes Marahuyo the most magical way to find your perfect match
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-warm group"
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Icon className={`h-10 w-10 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
