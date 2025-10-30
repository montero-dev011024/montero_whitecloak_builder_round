import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="bg-gradient-hero rounded-3xl p-12 md:p-16 text-center border border-primary/20 shadow-glow-warm">
          <Heart className="h-16 w-16 text-romantic mx-auto mb-6 animate-float" />
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-warm bg-clip-text text-transparent">
            Your Cosmic Connection Awaits
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of souls who have already found their enchanted match. Your journey to destiny begins here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-warm hover:shadow-glow-warm transition-all duration-300 text-lg px-10 py-6 group"
            >
              Begin Your Journey
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Free to join • No credit card required • Start connecting in minutes
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
