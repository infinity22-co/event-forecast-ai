import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CloudSun } from "lucide-react";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "Successfully logged in." });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast({ title: "Account created!", description: "Successfully signed up." });
      }
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: isLogin ? "Login Failed" : "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <CloudSun className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Weather Wise Events
          </CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to access your event history" : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-primary/30"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;