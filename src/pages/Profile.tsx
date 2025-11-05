import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, User as UserIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { Link } from "react-router-dom";
import { MobileSidebar } from "@/components/MobileSidebar";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  full_name: z.string().trim().max(100, "Name must be less than 100 characters").optional(),
  contact_number: z.string().trim().max(20, "Contact number must be less than 20 characters").regex(/^[0-9+\-() ]*$/, "Invalid phone number format").optional().or(z.literal("")),
  age: z.number().int().min(13, "Must be at least 13 years old").max(120, "Invalid age").optional().nullable(),
  personal_goal: z.string().trim().max(1000, "Goal must be less than 1000 characters").optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    contact_number: "",
    age: "",
    personal_goal: "",
    avatar_url: "",
    email_daily_reminder: true,
    email_weekly_summary: true,
    email_streak_achievements: true,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        contact_number: data.contact_number || "",
        age: data.age?.toString() || "",
        personal_goal: data.personal_goal || "",
        avatar_url: data.avatar_url || "",
        email_daily_reminder: data.email_daily_reminder ?? true,
        email_weekly_summary: data.email_weekly_summary ?? true,
        email_streak_achievements: data.email_streak_achievements ?? true,
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Validate inputs
      const validationResult = profileSchema.safeParse({
        full_name: profile.full_name,
        contact_number: profile.contact_number,
        age: profile.age ? parseInt(profile.age) : null,
        personal_goal: profile.personal_goal,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          contact_number: profile.contact_number,
          age: profile.age ? parseInt(profile.age) : null,
          personal_goal: profile.personal_goal,
          avatar_url: profile.avatar_url,
          email_daily_reminder: profile.email_daily_reminder,
          email_weekly_summary: profile.email_weekly_summary,
          email_streak_achievements: profile.email_streak_achievements,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      toast.loading("Uploading avatar...");

      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath && !oldPath.startsWith('data:')) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload to storage bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.dismiss();
      toast.success("Avatar uploaded! Click Save to update.");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to upload avatar");
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    setChangingPassword(true);
    try {
      const validationResult = passwordSchema.safeParse(passwordData);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setChangingPassword(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeletingAccount(true);
    try {
      // Delete all user data from profiles, habits, completions, etc.
      // The foreign key cascades will handle related data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Sign out the user
      await supabase.auth.signOut();
      
      toast.success("Account deleted successfully. Goodbye!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header user={user} />

      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <MobileSidebar />
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center gap-2 group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 animate-slide-in">
            {/* Avatar Section */}
            <Card className="p-6 hover:shadow-glow transition-shadow">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="text-3xl bg-gradient-growth text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Camera className="h-5 w-5 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{profile.full_name || "Add your name"}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </Card>

            {/* Profile Details */}
            <Card className="p-6 hover:shadow-glow transition-shadow">
              <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email || ""} disabled />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input
                      id="contact_number"
                      value={profile.contact_number}
                      onChange={(e) =>
                        setProfile({ ...profile, contact_number: e.target.value })
                      }
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age}
                      onChange={(e) =>
                        setProfile({ ...profile, age: e.target.value })
                      }
                      placeholder="25"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal_goal">Personal Goal</Label>
                  <Textarea
                    id="personal_goal"
                    value={profile.personal_goal}
                    onChange={(e) =>
                      setProfile({ ...profile, personal_goal: e.target.value })
                    }
                    placeholder="What are you working towards?"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full bg-gradient-growth hover:opacity-90 hover:scale-105 transition-all"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 animate-slide-in">
            {/* Email Notifications */}
            <Card className="p-6 hover:shadow-glow transition-shadow">
              <h3 className="text-lg font-semibold mb-6">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Daily Habit Reminders</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive daily reminders to complete your habits
                    </p>
                  </div>
                  <Switch
                    checked={profile.email_daily_reminder}
                    onCheckedChange={(checked) =>
                      setProfile({ ...profile, email_daily_reminder: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Weekly Progress Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      Get a weekly overview of your progress
                    </p>
                  </div>
                  <Switch
                    checked={profile.email_weekly_summary}
                    onCheckedChange={(checked) =>
                      setProfile({ ...profile, email_weekly_summary: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Streak Achievement Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Celebrate your streak milestones
                    </p>
                  </div>
                  <Switch
                    checked={profile.email_streak_achievements}
                    onCheckedChange={(checked) =>
                      setProfile({ ...profile, email_streak_achievements: checked })
                    }
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full bg-gradient-growth hover:opacity-90 hover:scale-105 transition-all"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Notification Preferences"}
                </Button>
              </div>
            </Card>

            {/* Change Password */}
            <Card className="p-6 hover:shadow-glow transition-shadow">
              <h3 className="text-lg font-semibold mb-6">Change Password</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm new password"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="w-full bg-gradient-growth hover:opacity-90 hover:scale-105 transition-all"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {changingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </Card>

            {/* Delete Account */}
            <Card className="p-6 border-destructive/50 hover:shadow-glow transition-shadow">
              <h3 className="text-lg font-semibold mb-6 text-destructive">Danger Zone</h3>
              <div className="space-y-4">
                <div className="p-4 border border-destructive/50 rounded-lg">
                  <h4 className="font-medium mb-2 text-destructive">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={deletingAccount}>
                        {deletingAccount ? "Deleting..." : "Delete Account"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and all associated data including:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>All your habits and completions</li>
                            <li>Your profile information</li>
                            <li>Achievement history and streaks</li>
                            <li>Mood tracking data</li>
                          </ul>
                          <p className="mt-3 font-semibold text-destructive">
                            This action cannot be undone.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Yes, Delete My Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
