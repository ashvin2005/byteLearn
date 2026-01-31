import {
  LogOut,
  MoveUpRight,
  Settings,
  CreditCard,
  FileText,
  Book,
  ChevronRight,
  BookOpen,
  PlusCircle,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { useState, useEffect } from "react";

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}

interface UserActivity {
  type: string;
  title: string;
  date: string;
  icon: React.ReactNode;
}

const defaultProfile = {
  subscription: "Free Trial",
};

export default function Profile01({
  subscription = defaultProfile.subscription,
}: { subscription?: string } = {}) {
  const { user, signOut } = useAuth();
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Get user's metadata similar to nav-user.tsx
  const displayName = user?.user_metadata?.display_name || "User";
  const email = user?.email || "";
  const avatarInitials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "N/A";

  // Mock statistics for the dashboard
  const userStats = {
    articlesRead: 12,
    bookmarkedArticles: 8,
    coursesEnrolled: 3,
    joinDate: createdAt,
  };

  // Generate mock recent activity
  useEffect(() => {
    const mockActivities: UserActivity[] = [
      {
        type: "article",
        title: "History of Internet",
        date: "Today at 10:24 AM",
        icon: <BookOpen className="h-4 w-4 text-indigo-500" />,
      },
      {
        type: "course",
        title: "Convolutional Neural Networks",
        date: "Yesterday at 2:30 PM",
        icon: <Book className="h-4 w-4 text-emerald-500" />,
      },
      {
        type: "bookmark",
        title: "Data Link Layer",
        date: "2 days ago",
        icon: <PlusCircle className="h-4 w-4 text-amber-500" />,
      },
      {
        type: "article",
        title: "Pillars of OOP",
        date: "3 days ago",
        icon: <BookOpen className="h-4 w-4 text-indigo-500" />,
      },
    ];

    setRecentActivity(mockActivities);
  }, []);

  const menuItems: MenuItem[] = [
    {
      label: "Subscription",
      value: subscription,
      href: "#",
      icon: <CreditCard className="w-4 h-4" />,
      external: false,
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Terms & Policies",
      href: "#",
      icon: <FileText className="w-4 h-4" />,
      external: true,
    },
  ];

  const handleLogout = () => {
    if (signOut) {
      signOut();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          {/* Profile Card */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 rounded-lg">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback className="rounded-lg bg-primary/10">
                    {avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{displayName}</CardTitle>
                  <CardDescription>{email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="text-sm text-muted-foreground">
                  Subscription
                </div>
                <div className="font-medium">{subscription}</div>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div className="text-sm text-muted-foreground">
                  Member since
                </div>
                <div className="font-medium">{userStats.joinDate}</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center justify-between w-full px-6 py-3 
                                            hover:bg-accent rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center">
                      {item.value && (
                        <span className="text-sm text-muted-foreground mr-2">
                          {item.value}
                        </span>
                      )}
                      {item.external ? (
                        <MoveUpRight className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          {/* Custom Tab Navigation */}
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "overview" ? "border-b-2 border-primary" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "activity" ? "border-b-2 border-primary" : ""
              }`}
              onClick={() => setActiveTab("activity")}
            >
              Activity
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "courses" ? "border-b-2 border-primary" : ""
              }`}
              onClick={() => setActiveTab("courses")}
            >
              My Courses
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Articles Read
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {userStats.articlesRead}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +3 from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Bookmarked Articles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {userStats.bookmarkedArticles}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +2 from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Courses Enrolled
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {userStats.coursesEnrolled}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +1 from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Reading Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">5 days</div>
                    <p className="text-xs text-muted-foreground">Keep it up!</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest interactions on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center">
                        <div className="mr-4 rounded-full p-2 bg-muted">
                          {activity.icon}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>
                  Your complete activity history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity
                    .concat(recentActivity)
                    .map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 hover:bg-muted rounded-lg transition-colors"
                      >
                        <div className="rounded-full p-2 bg-background border">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.type.charAt(0).toUpperCase() +
                              activity.type.slice(1)}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activity.date}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Courses</CardTitle>
                <CardDescription>
                  Courses you are currently taking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-col md:flex-row gap-4 items-center">
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Book className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          Data Link Layer
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Networking fundamentals and protocol design
                        </p>
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full w-[75%]"></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          75% completed
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Continue
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-col md:flex-row gap-4 items-center">
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Book className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          History of Internet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          From ARPANET to modern web technologies
                        </p>
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full w-[40%]"></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          40% completed
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Continue
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-col md:flex-row gap-4 items-center">
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Book className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          Convolutional Neural Networks
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Deep learning for computer vision
                        </p>
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full w-[10%]"></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          10% completed
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
