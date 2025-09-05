"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  User, 
  UserCog, 
  UserRoundCheck, 
  UserRoundPen,
  Table,
  LayoutList,
  Logs,
  PanelTop,
  PanelBottom,
  ArrowDownZA
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "suspended" | "pending";
  verified: boolean;
  joinDate: string;
  listings: number;
  bookings: number;
  reports: number;
}

interface Report {
  id: string;
  type: "post" | "comment" | "listing" | "user";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "reviewing" | "resolved" | "dismissed";
  content: string;
  reporter: string;
  reportedUser: string;
  reason: string;
  date: string;
}

interface Listing {
  id: string;
  title: string;
  owner: string;
  status: "active" | "paused" | "flagged" | "removed";
  price: number;
  bookings: number;
  reports: number;
  created: string;
}

interface Booking {
  id: string;
  listing: string;
  guest: string;
  host: string;
  status: "confirmed" | "pending" | "cancelled" | "disputed";
  amount: number;
  dates: string;
  created: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data initialization
  useEffect(() => {
    const initializeData = () => {
      const mockUsers: User[] = [
        {
          id: "1",
          name: "Alice Johnson",
          email: "alice@example.com",
          status: "active",
          verified: true,
          joinDate: "2024-01-15",
          listings: 3,
          bookings: 12,
          reports: 0
        },
        {
          id: "2", 
          name: "Bob Smith",
          email: "bob@example.com",
          status: "suspended",
          verified: false,
          joinDate: "2024-02-20",
          listings: 1,
          bookings: 5,
          reports: 2
        },
        {
          id: "3",
          name: "Carol Davis",
          email: "carol@example.com", 
          status: "active",
          verified: true,
          joinDate: "2024-03-10",
          listings: 7,
          bookings: 28,
          reports: 1
        }
      ];

      const mockReports: Report[] = [
        {
          id: "1",
          type: "listing",
          severity: "high",
          status: "open",
          content: "Inappropriate photos in listing",
          reporter: "user123",
          reportedUser: "Bob Smith",
          reason: "Inappropriate content",
          date: "2024-03-15"
        },
        {
          id: "2",
          type: "user",
          severity: "medium", 
          status: "reviewing",
          content: "User harassment in messages",
          reporter: "user456",
          reportedUser: "John Doe",
          reason: "Harassment",
          date: "2024-03-14"
        }
      ];

      const mockListings: Listing[] = [
        {
          id: "1",
          title: "Luxury Downtown Apartment",
          owner: "Alice Johnson",
          status: "active",
          price: 250,
          bookings: 15,
          reports: 0,
          created: "2024-01-20"
        },
        {
          id: "2",
          title: "Cozy Studio Space",
          owner: "Bob Smith", 
          status: "flagged",
          price: 120,
          bookings: 3,
          reports: 2,
          created: "2024-02-25"
        }
      ];

      const mockBookings: Booking[] = [
        {
          id: "1",
          listing: "Luxury Downtown Apartment",
          guest: "John Guest",
          host: "Alice Johnson",
          status: "confirmed",
          amount: 750,
          dates: "Mar 20-23, 2024",
          created: "2024-03-10"
        },
        {
          id: "2",
          listing: "Cozy Studio Space",
          guest: "Jane Visitor",
          host: "Bob Smith",
          status: "disputed", 
          amount: 360,
          dates: "Mar 15-18, 2024",
          created: "2024-03-05"
        }
      ];

      setUsers(mockUsers);
      setReports(mockReports);
      setListings(mockListings);
      setBookings(mockBookings);
      setLoading(false);
    };

    setTimeout(initializeData, 1000);
  }, []);

  const handleUserAction = (userId: string, action: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        switch (action) {
          case "suspend":
            toast.success("User suspended successfully");
            return { ...user, status: "suspended" as const };
          case "unsuspend":
            toast.success("User unsuspended successfully");
            return { ...user, status: "active" as const };
          case "verify":
            toast.success("User verified successfully");
            return { ...user, verified: true };
          case "unverify":
            toast.success("User verification revoked");
            return { ...user, verified: false };
          default:
            return user;
        }
      }
      return user;
    }));
  };

  const handleReportAction = (reportId: string, action: string) => {
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        let newStatus: Report["status"];
        switch (action) {
          case "dismiss":
            newStatus = "dismissed";
            toast.success("Report dismissed");
            break;
          case "resolve":
            newStatus = "resolved";
            toast.success("Report resolved");
            break;
          default:
            newStatus = report.status;
        }
        return { ...report, status: newStatus };
      }
      return report;
    }));
  };

  const exportData = (type: string) => {
    toast.success(`${type} data exported to CSV`);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const activeListings = listings.filter(l => l.status === "active").length;
  const openReports = reports.filter(r => r.status === "open").length;
  const estimatedRevenue = bookings.reduce((sum, b) => sum + (b.amount * 0.1), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, content, and platform operations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => exportData("All")}>
              Export Data
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <LayoutList className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Logs className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2">
              <PanelTop className="h-4 w-4" />
              Safety
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <Table className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeListings}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Reports</CardTitle>
                  <Logs className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{openReports}</div>
                  <p className="text-xs text-muted-foreground">-15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Estimate</CardTitle>
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${estimatedRevenue.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">+22% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activity and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">User</Badge>
                    <span className="text-sm">New user registration: carol@example.com</span>
                    <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">Report</Badge>
                    <span className="text-sm">New report filed against listing #2</span>
                    <span className="text-xs text-muted-foreground ml-auto">4 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default">Booking</Badge>
                    <span className="text-sm">Booking dispute resolved for #1</span>
                    <span className="text-xs text-muted-foreground ml-auto">6 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80"
                />
                <Button variant="outline" onClick={() => exportData("Users")}>
                  Export Users
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <TableComponent>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Listings</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === "active" ? "default" : user.status === "suspended" ? "destructive" : "secondary"}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.verified ? "default" : "secondary"}>
                            {user.verified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.listings}</TableCell>
                        <TableCell>{user.reports}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>User Details: {selectedUser?.name}</DialogTitle>
                                  <DialogDescription>
                                    View and manage user account information
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Name</Label>
                                        <p className="text-sm">{selectedUser.name}</p>
                                      </div>
                                      <div>
                                        <Label>Email</Label>
                                        <p className="text-sm">{selectedUser.email}</p>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <Badge variant={selectedUser.status === "active" ? "default" : "destructive"}>
                                          {selectedUser.status}
                                        </Badge>
                                      </div>
                                      <div>
                                        <Label>Verified</Label>
                                        <Badge variant={selectedUser.verified ? "default" : "secondary"}>
                                          {selectedUser.verified ? "Yes" : "No"}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant={selectedUser.status === "active" ? "destructive" : "default"}
                                        size="sm"
                                        onClick={() => handleUserAction(selectedUser.id, selectedUser.status === "active" ? "suspend" : "unsuspend")}
                                      >
                                        {selectedUser.status === "active" ? "Suspend" : "Unsuspend"}
                                      </Button>
                                      <Button 
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUserAction(selectedUser.id, selectedUser.verified ? "unverify" : "verify")}
                                      >
                                        {selectedUser.verified ? "Revoke Verification" : "Grant Verification"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableComponent>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Moderation Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Content Moderation</h2>
              <div className="flex items-center gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <TableComponent>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Content Preview</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Badge variant="outline">{report.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              report.severity === "critical" ? "destructive" :
                              report.severity === "high" ? "destructive" :
                              report.severity === "medium" ? "secondary" : "default"
                            }
                          >
                            {report.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              report.status === "open" ? "destructive" :
                              report.status === "reviewing" ? "secondary" : "default"
                            }
                          >
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm">
                            {report.content}
                          </div>
                        </TableCell>
                        <TableCell>{report.reporter}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Report Review</DialogTitle>
                                  <DialogDescription>
                                    Review and take action on this report
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedReport && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Content</Label>
                                      <p className="text-sm mt-1">{selectedReport.content}</p>
                                    </div>
                                    <div>
                                      <Label>Reason</Label>
                                      <p className="text-sm mt-1">{selectedReport.reason}</p>
                                    </div>
                                    <div>
                                      <Label>Admin Notes</Label>
                                      <Textarea placeholder="Add your review notes..." />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleReportAction(selectedReport.id, "resolve")}
                                      >
                                        Remove Content
                                      </Button>
                                      <Button 
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleReportAction(selectedReport.id, "dismiss")}
                                      >
                                        Dismiss Report
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableComponent>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Listing & Booking Oversight</h2>
              <Button variant="outline" onClick={() => exportData("Listings")}>
                Export Listings
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Listings */}
              <Card>
                <CardHeader>
                  <CardTitle>Listings</CardTitle>
                  <CardDescription>Manage platform listings</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <TableComponent>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Reports</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{listing.title}</div>
                              <div className="text-sm text-muted-foreground">{listing.owner}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                listing.status === "active" ? "default" :
                                listing.status === "flagged" ? "destructive" : "secondary"
                              }
                            >
                              {listing.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${listing.price}/day</TableCell>
                          <TableCell>{listing.reports}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableComponent>
                </CardContent>
              </Card>

              {/* Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Bookings Audit</CardTitle>
                  <CardDescription>Review conflicts and disputes</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <TableComponent>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.listing}</div>
                              <div className="text-sm text-muted-foreground">{booking.dates}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                booking.status === "confirmed" ? "default" :
                                booking.status === "disputed" ? "destructive" : "secondary"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${booking.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableComponent>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reporting & Analytics</h2>
              <Button variant="outline" onClick={() => exportData("Reports")}>
                Generate Report
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>Download CSV reports for analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>User Data</span>
                    <Button variant="outline" size="sm" onClick={() => exportData("Users")}>
                      Export CSV
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Listing Data</span>
                    <Button variant="outline" size="sm" onClick={() => exportData("Listings")}>
                      Export CSV
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Report Data</span>
                    <Button variant="outline" size="sm" onClick={() => exportData("Reports")}>
                      Export CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analytics Overview</CardTitle>
                  <CardDescription>Platform performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>User Growth</span>
                    <div className="w-24 h-8 bg-muted rounded flex items-center justify-center text-xs">
                      📈 Sparkline
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Booking Volume</span>
                    <div className="w-24 h-8 bg-muted rounded flex items-center justify-center text-xs">
                      📊 Chart
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Report Trends</span>
                    <div className="w-24 h-8 bg-muted rounded flex items-center justify-center text-xs">
                      📉 Graph
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Role & Permission Management</h2>
              <Button>Create Role</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Roles</CardTitle>
                  <CardDescription>Manage user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Administrator</div>
                      <div className="text-sm text-muted-foreground">Full system access</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Moderator</div>
                      <div className="text-sm text-muted-foreground">Content moderation only</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Companion</div>
                      <div className="text-sm text-muted-foreground">Verified companion user</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Permission Matrix</CardTitle>
                  <CardDescription>Configure role permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Management</span>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Content Moderation</span>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Financial Reports</span>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Configuration</span>
                      <Checkbox />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Safety & Compliance</h2>
              <Button variant="destructive">Emergency Actions</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Flagged Accounts</CardTitle>
                  <CardDescription>High-risk user accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Suspended Users</span>
                      <Badge variant="destructive">2</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Under Review</span>
                      <Badge variant="secondary">5</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Banned IPs</span>
                      <Badge variant="destructive">12</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Takedowns</CardTitle>
                  <CardDescription>DMCA and legal requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending Requests</span>
                      <Badge variant="secondary">3</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed</span>
                      <Badge variant="default">18</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Upload Evidence
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Legal Actions</CardTitle>
                  <CardDescription>Ongoing legal cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Cases</span>
                      <Badge variant="secondary">1</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Resolved</span>
                      <Badge variant="default">7</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}