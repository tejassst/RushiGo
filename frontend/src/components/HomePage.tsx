import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowRight, Upload, Zap, Shield, Users, BarChart3, CheckCircle, Star } from "lucide-react";

interface HomePageProps {
  onNavigate: (section: 'demo' | 'upload') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Extraction",
      description: "Advanced AI automatically identifies and extracts deadlines from any document format."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your documents are processed securely with end-to-end encryption and automatic deletion."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share deadlines with team members and sync across all devices seamlessly."
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Get insights into your deadline patterns and productivity metrics."
    }
  ];



  return (
    <div className="relative z-10">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <Badge className="mb-8 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
            ✨ Revolutionary AI Deadline Tracking
          </Badge>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Never Miss a
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Deadline Again
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Upload any document and let our AI instantly extract all deadlines, dates, and important milestones. 
            Stay organized with our intuitive swipe-to-manage interface.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Button 
              size="lg" 
              onClick={() => onNavigate('demo')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Try Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => onNavigate('upload')}
              className="text-lg px-8 py-4 rounded-xl border-2 hover:bg-purple-50 hover:border-purple-300 transition-all"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Document
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                50k+
              </div>
              <div className="text-gray-600">Documents Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                99.2%
              </div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                10k+
              </div>
              <div className="text-gray-600">Happy Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to stay on top of your deadlines and boost productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Document</h3>
              <p className="text-gray-600">
                Drop your PDF, image, or document into our secure upload area
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Processing</h3>
              <p className="text-gray-600">
                Our AI analyzes your document and extracts all important dates and deadlines
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Manage & Track</h3>
              <p className="text-gray-600">
                Swipe through your deadlines, mark them complete, or keep them pending
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose RushiGo */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose RushiGo?
            </h2>
            <p className="text-xl text-gray-600">
              Built for modern teams and individuals who value productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">100% Free to Start</h3>
                <p className="text-gray-600">
                  No credit card required. Start tracking deadlines immediately with our free tier and upgrade when you're ready.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Setup in 30 Seconds</h3>
                <p className="text-gray-600">
                  No complex setup or training required. Upload your first document and see results instantly. It's that simple.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Team-First Design</h3>
                <p className="text-gray-600">
                  Built for collaboration from day one. Share deadlines, assign tasks, and keep your entire team synchronized.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 mb-8">Trusted by forward-thinking teams worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Productivity?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who have revolutionized their deadline management
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => onNavigate('demo')}
                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl"
              >
                Try Free Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => onNavigate('upload')}
                className="border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl"
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
