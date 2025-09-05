"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  UserRound, 
  UserRoundPen, 
  UserCheck, 
  EyeOff, 
  UserRoundCog, 
  IdCard,
  Component
} from "lucide-react";
import { toast } from "sonner";

interface UserProfileData {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location: string;
  isVerified: boolean;
  verificationStatus: "none" | "pending" | "approved" | "rejected";
  interests: string[];
  followersCount: number;
  followingCount: number;
  trustScore: number;
  isPrivate: boolean;
  allowMessages: boolean;
  allowFollows: boolean;
  joinDate: string;
}

interface UserProfileProps {
  profile: UserProfileData;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  className?: string;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
  onUpdateProfile?: (updates: Partial<UserProfileData>) => Promise<void>;
}

export default function UserProfile({
  profile,
  isOwnProfile = false,
  isFollowing = false,
  className = "",
  onFollow,
  onUnfollow,
  onMessage,
  onBlock,
  onReport,
  onUpdateProfile
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingPublic, setIsViewingPublic] = useState(!isOwnProfile);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  
  // Local state for editing
  const [editData, setEditData] = useState({
    displayName: profile.displayName,
    bio: profile.bio,
    location: profile.location,
    interests: [...profile.interests],
    isPrivate: profile.isPrivate,
    allowMessages: profile.allowMessages,
    allowFollows: profile.allowFollows
  });
  
  const [verificationData, setVerificationData] = useState({
    statement: "",
    documentFile: null as File | null
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create object URL for preview
      const avatarUrl = URL.createObjectURL(file);
      
      if (onUpdateProfile) {
        await onUpdateProfile({ avatar: avatarUrl });
      }
      
      setUploadProgress(100);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      toast.error("Failed to upload profile picture");
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onUpdateProfile]);

  const handleSaveProfile = useCallback(async () => {
    try {
      if (onUpdateProfile) {
        await onUpdateProfile(editData);
      }
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  }, [editData, onUpdateProfile]);

  const handleVerificationRequest = useCallback(async () => {
    if (!verificationData.statement.trim() || !verificationData.documentFile) {
      toast.error("Please provide both a statement and upload a document");
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onUpdateProfile) {
        await onUpdateProfile({ verificationStatus: "pending" });
      }
      
      setVerificationDialogOpen(false);
      setVerificationData({ statement: "", documentFile: null });
      toast.success("Verification request submitted for review");
    } catch (error) {
      toast.error("Failed to submit verification request");
    }
  }, [verificationData, onUpdateProfile]);

  const addInterest = useCallback((interest: string) => {
    if (interest.trim() && !editData.interests.includes(interest.trim())) {
      setEditData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }));
    }
  }, [editData.interests]);

  const removeInterest = useCallback((interest: string) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  }, []);

  const handleFollow = useCallback(() => {
    if (onFollow) {
      onFollow(profile.id);
      toast.success(`Now following ${profile.displayName}`);
    }
  }, [onFollow, profile.id, profile.displayName]);

  const handleUnfollow = useCallback(() => {
    if (onUnfollow) {
      onUnfollow(profile.id);
      toast.success(`Unfollowed ${profile.displayName}`);
    }
  }, [onUnfollow, profile.id, profile.displayName]);

  const renderVerificationBadge = () => {
    if (profile.isVerified) {
      return (
        <Badge variant="default" className="ml-2">
          <UserCheck className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    
    if (profile.verificationStatus === "pending") {
      return (
        <Badge variant="secondary" className="ml-2">
          <Component className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
    
    return null;
  };

  const renderProfileActions = () => {
    if (isOwnProfile) {
      return (
        <div className="flex gap-2">
          <Button 
            variant={isEditing ? "default" : "outline"} 
            onClick={() => setIsEditing(!isEditing)}
          >
            <UserRoundPen className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
          
          <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserRoundCog className="h-4 w-4 mr-2" />
                Privacy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Privacy Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="private-profile">Private Profile</Label>
                  <Switch
                    id="private-profile"
                    checked={editData.isPrivate}
                    onCheckedChange={(checked) => 
                      setEditData(prev => ({ ...prev, isPrivate: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-messages">Allow Messages</Label>
                  <Switch
                    id="allow-messages"
                    checked={editData.allowMessages}
                    onCheckedChange={(checked) => 
                      setEditData(prev => ({ ...prev, allowMessages: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-follows">Allow Follow Requests</Label>
                  <Switch
                    id="allow-follows"
                    checked={editData.allowFollows}
                    onCheckedChange={(checked) => 
                      setEditData(prev => ({ ...prev, allowFollows: checked }))
                    }
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            onClick={() => setIsViewingPublic(!isViewingPublic)}
          >
            {isViewingPublic ? <UserRound className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {isViewingPublic ? "Private View" : "Public View"}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <Button 
          variant={isFollowing ? "outline" : "default"}
          onClick={isFollowing ? handleUnfollow : handleFollow}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
        
        {onMessage && (
          <Button variant="outline" onClick={() => onMessage(profile.id)}>
            Message
          </Button>
        )}
        
        <Button variant="outline" onClick={() => onReport?.(profile.id)}>
          Report
        </Button>
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Cover Image & Avatar */}
      <Card className="relative overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary/20 to-accent relative">
          {profile.coverImage && (
            <img 
              src={profile.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          {isEditing && (
            <Button
              className="absolute bottom-4 right-4"
              size="sm"
              onClick={() => coverInputRef.current?.click()}
            >
              Change Cover
            </Button>
          )}
        </div>
        
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
                <AvatarImage src={profile.avatar} alt={profile.displayName} />
                <AvatarFallback className="text-xl md:text-2xl">
                  {profile.displayName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              
              {isEditing && (
                <Button
                  className="absolute -bottom-2 -right-2"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <UserRoundPen className="h-4 w-4" />
                </Button>
              )}
              
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <Progress value={uploadProgress} className="w-16" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center">
                    {isEditing ? (
                      <Input
                        value={editData.displayName}
                        onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="text-xl font-bold mb-1 max-w-xs"
                      />
                    ) : (
                      <h1 className="text-xl md:text-2xl font-bold">{profile.displayName}</h1>
                    )}
                    {renderVerificationBadge()}
                  </div>
                  
                  <p className="text-muted-foreground">@{profile.username}</p>
                  
                  {isEditing ? (
                    <Input
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Location"
                      className="mt-1 max-w-xs"
                    />
                  ) : (
                    profile.location && (
                      <p className="text-sm text-muted-foreground mt-1">{profile.location}</p>
                    )
                  )}
                </div>
                
                {renderProfileActions()}
              </div>
            </div>
          </div>
        </CardContent>
        
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
        />
        
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
        />
      </Card>

      {/* Profile Content */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="min-h-24"
                />
              ) : (
                <p className="whitespace-pre-wrap">{profile.bio || "No bio available."}</p>
              )}
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {editData.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {interest}
                    {isEditing && (
                      <button
                        className="ml-2 hover:text-destructive"
                        onClick={() => removeInterest(interest)}
                      >
                        ×
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add interest..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addInterest(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity & Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{profile.followersCount}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.followingCount}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.trustScore}%</div>
                  <div className="text-sm text-muted-foreground">Trust Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IdCard className="h-5 w-5 mr-2" />
                Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.isVerified ? (
                <div className="flex items-center text-success">
                  <UserCheck className="h-5 w-5 mr-2" />
                  <span>Verified User</span>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Verification adds trust and credibility to your profile.
                  </p>
                  
                  {profile.verificationStatus === "pending" ? (
                    <Badge variant="secondary">
                      <Component className="h-3 w-3 mr-1" />
                      Under Review
                    </Badge>
                  ) : profile.verificationStatus === "rejected" ? (
                    <div>
                      <Badge variant="destructive" className="mb-2">Rejected</Badge>
                      <p className="text-xs text-muted-foreground">
                        You can reapply after addressing the feedback.
                      </p>
                    </div>
                  ) : isOwnProfile ? (
                    <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Request Verification
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Verification</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="verification-statement">
                              Why should you be verified? (Brief statement)
                            </Label>
                            <Textarea
                              id="verification-statement"
                              value={verificationData.statement}
                              onChange={(e) => setVerificationData(prev => ({ 
                                ...prev, 
                                statement: e.target.value 
                              }))}
                              placeholder="Explain why verification would benefit the community..."
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="verification-document">
                              Supporting Document (ID, Business License, etc.)
                            </Label>
                            <Input
                              id="verification-document"
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => setVerificationData(prev => ({
                                ...prev,
                                documentFile: e.target.files?.[0] || null
                              }))}
                            />
                          </div>
                          
                          <Button onClick={handleVerificationRequest} className="w-full">
                            Submit Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trust & Safety */}
          <Card>
            <CardHeader>
              <CardTitle>Trust & Safety</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Trust Score</span>
                  <span className="font-semibold">{profile.trustScore}%</span>
                </div>
                
                <Progress value={profile.trustScore} className="h-2" />
                
                <div className="text-xs text-muted-foreground">
                  Based on {Math.floor(Math.random() * 50) + 10} reviews
                </div>
                
                <Separator />
                
                <div className="text-xs text-muted-foreground">
                  Member since {new Date(profile.joinDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Changes */}
          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} className="flex-1">
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}