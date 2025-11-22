import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getAuthToken, getUserRole } from '@/lib/api';
import { Shield, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    const role = getUserRole();
    
    if (token && role) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          PublicCare
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI-Powered Civic Complaint Management System
        </p>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
          Streamline complaint resolution with automatic classification, intelligent prioritization, 
          and efficient field team assignment. Making your city better, one complaint at a time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="gap-2"
          >
            <Users className="h-5 w-5" />
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/auth')}
            className="gap-2"
          >
            <Shield className="h-5 w-5" />
            Admin Portal
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-primary font-bold text-3xl mb-2">AI</div>
            <h3 className="font-semibold mb-2">Smart Classification</h3>
            <p className="text-sm text-muted-foreground">
              Automatic department routing and priority scoring
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-secondary font-bold text-3xl mb-2">GPS</div>
            <h3 className="font-semibold mb-2">Location Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent grouping based on geographic proximity
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-accent font-bold text-3xl mb-2">LIVE</div>
            <h3 className="font-semibold mb-2">Real-time Updates</h3>
            <p className="text-sm text-muted-foreground">
              Track complaint status from submission to resolution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
