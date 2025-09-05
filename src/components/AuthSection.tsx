"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  User, 
  LogIn, 
  UserRoundPlus, 
  CircleUser, 
  Key, 
  UserRoundCheck, 
  EyeOff,
  Lock,
  Vault,
  IdCard,
  UserLock,
  KeyRound,
  KeySquare,
  FolderKey,
  Hand
} from "lucide-react";
import { toast } from "sonner";

type AuthMode = "signin" | "signup" | "admin" | "forgot-password" | "profile-onboarding";
type UserRole = "guest" | "user" | "companion" | "admin";
type SignUpStep = "credentials" | "avatar" | "interests" | "companion-opt-in";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  bio?: string;
  isVerified?: boolean;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
}

const INTEREST_TAGS = [
  "Adventure", "Art", "Books", "Cooking", "Dancing", "Fitness", "Gaming", 
  "Music", "Nature", "Photography", "Sports", "Technology", "Travel", "Yoga"
];

const COMPANION_SKILLS = [
  "Personal Training", "Life Coaching", "Language Tutoring", "Pet Care", 
  "Home Organizing", "Tech Support", "Cooking Lessons", "Driving Instructor"
];

export default function AuthSection() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [signUpStep, setSignUpStep] = useState<SignUpStep>("credentials");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FACode, setShow2FACode] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoRole, setDemoRole] = useState<UserRole>("guest");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isCompanionOptIn, setIsCompanionOptIn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    bio: "",
    avatar: "",
    twoFactorCode: "",
    resetEmail: "",
    verificationCode: "",
    companionRate: "",
    companionDescription: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (mode === "signup" || mode === "signin") {
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (mode === "signup" && formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      if (mode === "signup") {
        if (!formData.name) {
          newErrors.name = "Name is required";
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        if (!agreedToTerms) {
          newErrors.terms = "You must agree to the terms and conditions";
        }
      }
    }

    if (mode === "admin" && !formData.password) {
      newErrors.password = "Password is required";
    }

    if (mode === "forgot-password" && !formData.resetEmail) {
      newErrors.resetEmail = "Email is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [mode, formData, agreedToTerms]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          const reader = new FileReader();
          reader.onload = (e) => {
            setFormData(prev => ({ ...prev, avatar: e.target?.result as string }));
          };
          reader.readAsDataURL(file);
          toast.success("Avatar uploaded successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, []);

  const handleInterestToggle = useCallback((interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  }, []);

  const handleSkillToggle = useCallback((skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  }, []);

  const handleSignIn = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const user: User = {
        id: "user-123",
        email: formData.email,
        name: formData.name || "User",
        role: "user",
        avatar: formData.avatar || undefined,
        isVerified: true,
        isEmailVerified: true,
        isPhoneVerified: false
      };
      
      setCurrentUser(user);
      setDemoRole("user");
      toast.success("Successfully signed in!");
      setMode("profile-onboarding");
    } catch (error) {
      toast.error("Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm]);

  const handleSignUp = useCallback(async () => {
    if (signUpStep !== "companion-opt-in") {
      // Move to next step
      const steps: SignUpStep[] = ["credentials", "avatar", "interests", "companion-opt-in"];
      const currentIndex = steps.indexOf(signUpStep);
      if (currentIndex < steps.length - 1) {
        setSignUpStep(steps[currentIndex + 1]);
        return;
      }
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const user: User = {
        id: "user-456",
        email: formData.email,
        name: formData.name,
        role: isCompanionOptIn ? "companion" : "user",
        avatar: formData.avatar || undefined,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        isVerified: false,
        isEmailVerified: false,
        isPhoneVerified: false
      };
      
      setCurrentUser(user);
      setDemoRole(user.role);
      toast.success("Account created successfully!");
      setMode("profile-onboarding");
    } catch (error) {
      toast.error("Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [signUpStep, formData, validateForm, selectedInterests, selectedSkills, isCompanionOptIn]);

  const handleAdminLogin = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!show2FACode) {
        setShow2FACode(true);
        toast.info("Please enter your 2FA code");
      } else {
        const user: User = {
          id: "admin-789",
          email: formData.email,
          name: "Admin User",
          role: "admin",
          isVerified: true,
          isEmailVerified: true,
          isPhoneVerified: true
        };
        
        setCurrentUser(user);
        setDemoRole("admin");
        toast.success("Admin login successful!");
      }
    } catch (error) {
      toast.error("Admin login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, show2FACode]);

  const handleForgotPassword = useCallback(async () => {
    if (!formData.resetEmail) {
      setErrors({ resetEmail: "Email is required" });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Password reset code sent to your email!");
    } catch (error) {
      toast.error("Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [formData.resetEmail]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setDemoRole("guest");
    setMode("signin");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phone: "",
      bio: "",
      avatar: "",
      twoFactorCode: "",
      resetEmail: "",
      verificationCode: "",
      companionRate: "",
      companionDescription: ""
    });
    setSelectedInterests([]);
    setSelectedSkills([]);
    setAgreedToTerms(false);
    setIsCompanionOptIn(false);
    setShow2FACode(false);
    setSignUpStep("credentials");
    toast.success("Logged out successfully");
  }, []);

  const renderSignInForm = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <LogIn className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={errors.password ? "border-destructive" : ""}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2"
              onClick={() => setShowPassword(!showPassword)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <Button
          type="button"
          variant="link"
          className="px-0 h-auto text-sm"
          onClick={() => setMode("forgot-password")}
        >
          Forgot your password?
        </Button>

        <Button 
          onClick={handleSignIn} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" disabled>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button variant="outline" disabled>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </Button>
        </div>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="px-0 h-auto"
            onClick={() => setMode("signup")}
          >
            Sign up
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSignUpForm = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <UserRoundPlus className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-display">Create Account</CardTitle>
        <CardDescription>
          Step {["credentials", "avatar", "interests", "companion-opt-in"].indexOf(signUpStep) + 1} of 4
        </CardDescription>
        <Progress 
          value={((["credentials", "avatar", "interests", "companion-opt-in"].indexOf(signUpStep) + 1) / 4) * 100} 
          className="w-full"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {signUpStep === "credentials" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={errors.password ? "border-destructive" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Password strength</span>
                    <span>{getPasswordStrength(formData.password)}%</span>
                  </div>
                  <Progress value={getPasswordStrength(formData.password)} className="h-2" />
                </div>
              )}
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={setAgreedToTerms}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Button variant="link" className="px-0 h-auto text-sm">
                  Terms of Service
                </Button>{" "}
                and{" "}
                <Button variant="link" className="px-0 h-auto text-sm">
                  Privacy Policy
                </Button>
              </Label>
            </div>
            {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
          </>
        )}

        {signUpStep === "avatar" && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatar} />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                {formData.avatar ? "Change Avatar" : "Upload Avatar"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG up to 5MB. Square images work best.
              </p>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={() => setSignUpStep("interests")}
            >
              Skip for now
            </Button>
          </div>
        )}

        {signUpStep === "interests" && (
          <div className="space-y-4">
            <div>
              <Label className="text-base">What are you interested in?</Label>
              <p className="text-sm text-muted-foreground">Select topics that interest you (optional)</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map((interest) => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        )}

        {signUpStep === "companion-opt-in" && (
          <div className="space-y-4">
            <div>
              <Label className="text-base">Want to become a companion?</Label>
              <p className="text-sm text-muted-foreground">
                Companions can offer services and earn money on the platform
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="companion-opt-in"
                checked={isCompanionOptIn}
                onCheckedChange={setIsCompanionOptIn}
              />
              <Label htmlFor="companion-opt-in">
                Yes, I want to become a companion
              </Label>
            </div>

            {isCompanionOptIn && (
              <>
                <div className="space-y-2">
                  <Label>Skills & Services</Label>
                  <p className="text-sm text-muted-foreground">What services can you offer?</p>
                  <div className="flex flex-wrap gap-2">
                    {COMPANION_SKILLS.map((skill) => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleSkillToggle(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companionRate">Hourly Rate ($)</Label>
                  <Input
                    id="companionRate"
                    type="number"
                    placeholder="25"
                    value={formData.companionRate}
                    onChange={(e) => handleInputChange("companionRate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companionDescription">Service Description</Label>
                  <Textarea
                    id="companionDescription"
                    placeholder="Describe the services you offer..."
                    value={formData.companionDescription}
                    onChange={(e) => handleInputChange("companionDescription", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {signUpStep !== "credentials" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const steps: SignUpStep[] = ["credentials", "avatar", "interests", "companion-opt-in"];
                const currentIndex = steps.indexOf(signUpStep);
                if (currentIndex > 0) {
                  setSignUpStep(steps[currentIndex - 1]);
                }
              }}
              className="flex-1"
            >
              Back
            </Button>
          )}
          
          <Button 
            onClick={handleSignUp} 
            className="flex-1"
            disabled={isLoading || (signUpStep === "credentials" && !agreedToTerms)}
          >
            {isLoading ? "Creating..." : signUpStep === "companion-opt-in" ? "Create Account" : "Next"}
          </Button>
        </div>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Button
            variant="link"
            className="px-0 h-auto"
            onClick={() => setMode("signin")}
          >
            Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAdminLogin = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-destructive/10 rounded-full">
            <UserLock className="h-6 w-6 text-destructive" />
          </div>
        </div>
        <CardTitle className="text-2xl font-display">Admin Access</CardTitle>
        <CardDescription>
          {show2FACode ? "Enter your 2FA code" : "Enter admin credentials"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!show2FACode ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={errors.password ? "border-destructive" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="two-factor-code">2FA Code</Label>
              <Input
                id="two-factor-code"
                placeholder="Enter 6-digit code"
                value={formData.twoFactorCode}
                onChange={(e) => handleInputChange("twoFactorCode", e.target.value)}
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Enter the code from your authenticator app
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-device"
                checked={rememberDevice}
                onCheckedChange={setRememberDevice}
              />
              <Label htmlFor="remember-device" className="text-sm">
                Remember this device for 30 days
              </Label>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full" disabled>
                <KeyRound className="mr-2 h-4 w-4" />
                Use Backup Code
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Lost your device? Use a backup recovery code
              </p>
            </div>
          </>
        )}

        <Button 
          onClick={handleAdminLogin} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : show2FACode ? "Verify & Login" : "Continue"}
        </Button>

        {show2FACode && (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setShow2FACode(false)}
          >
            Back to Login
          </Button>
        )}

        <div className="text-center text-sm">
          <Button
            variant="link"
            className="px-0 h-auto"
            onClick={() => setMode("signin")}
          >
            ← Back to User Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderForgotPassword = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-accent rounded-full">
            <Key className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-display">Reset Password</CardTitle>
        <CardDescription>Enter your email to receive a reset code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email Address</Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="Enter your email"
            value={formData.resetEmail}
            onChange={(e) => handleInputChange("resetEmail", e.target.value)}
            className={errors.resetEmail ? "border-destructive" : ""}
          />
          {errors.resetEmail && <p className="text-sm text-destructive">{errors.resetEmail}</p>}
        </div>

        <Button 
          onClick={handleForgotPassword} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Code"}
        </Button>

        <div className="text-center text-sm">
          Remember your password?{" "}
          <Button
            variant="link"
            className="px-0 h-auto"
            onClick={() => setMode("signin")}
          >
            Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderProfileOnboarding = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-success/10 rounded-full">
            <UserRoundCheck className="h-6 w-6 text-success" />
          </div>
        </div>
        <CardTitle className="text-2xl font-display">Complete Your Profile</CardTitle>
        <CardDescription>Verify your account and complete your profile setup</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback>
              <User className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="text-center">
          <h3 className="font-semibold">{currentUser?.name}</h3>
          <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
          <Badge variant={currentUser?.role === "admin" ? "destructive" : "default"} className="mt-2">
            {currentUser?.role}
          </Badge>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-full">
                <CircleUser className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.isEmailVerified ? "Verified" : "Pending verification"}
                </p>
              </div>
            </div>
            {!currentUser?.isEmailVerified && (
              <Button size="sm" variant="outline">
                Verify
              </Button>
            )}
          </div>

          {currentUser?.phone && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-full">
                  <Hand className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Phone Verification</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.isPhoneVerified ? "Verified" : "Pending verification"}
                  </p>
                </div>
              </div>
              {!currentUser?.isPhoneVerified && (
                <Button size="sm" variant="outline">
                  Verify
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-full">
                <IdCard className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Identity Verification</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.isVerified ? "Verified" : "Upload ID for verification"}
                </p>
              </div>
            </div>
            {!currentUser?.isVerified && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Upload ID
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Identity Verification</DialogTitle>
                    <DialogDescription>
                      Upload a government-issued ID to verify your identity
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <IdCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm">Drop your ID here or click to browse</p>
                      <Button variant="outline" className="mt-2" disabled>
                        Choose File
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Accepted formats: JPG, PNG, PDF. File size limit: 10MB.
                      Your documents are encrypted and secure.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLogout} className="flex-1">
            Complete Later
          </Button>
          <Button className="flex-1">
            Finish Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (currentUser && mode === "profile-onboarding") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {/* Demo Role Selector */}
          <div className="mb-6 p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Demo Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Switch roles to preview different UI experiences
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={demoRole} onValueChange={(value: UserRole) => setDemoRole(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">Guest</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="companion">Companion</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {renderProfileOnboarding()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Current User Status */}
        {currentUser && (
          <div className="max-w-md mx-auto mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Logged in as {currentUser.role}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Demo Role Selector */}
        {currentUser && (
          <div className="max-w-md mx-auto mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="demo-role">Demo Role:</Label>
                  <Select value={demoRole} onValueChange={(value: UserRole) => setDemoRole(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest">Guest</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="companion">Companion</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Auth Forms */}
        {mode === "signin" && renderSignInForm()}
        {mode === "signup" && renderSignUpForm()}
        {mode === "admin" && renderAdminLogin()}
        {mode === "forgot-password" && renderForgotPassword()}
      </div>
    </div>
  );
}