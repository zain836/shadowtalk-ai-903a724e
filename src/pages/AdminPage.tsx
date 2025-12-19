import { useState, useEffect } from "react";
import { Shield, Users, MessageSquare, TrendingUp, UserCheck, Zap, DollarSign, Activity, HeartPulse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { supabase } from "@/integrations/supabase/client";


// Helper to format data for charts
const processUserFlowData = (data) => {
  const monthly = {};
  const yearly = {};

  data.forEach(item => {
    const date = new Date(item.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const yearKey = date.getFullYear().toString();

    if (!monthly[monthKey]) monthly[monthKey] = 0;
    monthly[monthKey]++;

    if (!yearly[yearKey]) yearly[yearKey] = 0;
    yearly[yearKey]++;
  });

  const formatForChart = (aggData) => Object.keys(aggData).sort().map(key => ({ name: key, users: aggData[key] }));

  return { monthly: formatForChart(monthly), yearly: formatForChart(yearly) };
};


const AdminPage = () => {
  const [stats, setStats] = useState({ totalMessages: 0, newSignups: 0, proUsers: 0, eliteUsers: 0, feedbackCount: 0, totalEarnings: 0 });
  const [realTime, setRealTime] = useState({ activeUsers: 0, pages: {} });
  const [users, setUsers] = useState([]);
  const [userFlow, setUserFlow] = useState({ monthly: [], yearly: [] });

  // Real-time listeners from Firebase
  useEffect(() => {
    const statusRef = ref(db, 'status');
    const activityRef = ref(db, 'activity');
    const statsRef = ref(db, 'stats');

    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      const data = snapshot.val() || {};
      const userList = Object.keys(data).map(uid => ({ id: uid, ...data[uid] }));
      setUsers(userList);
      const activeUsers = userList.filter(u => u.state === 'online').length;
      setRealTime(prev => ({ ...prev, activeUsers }));
    });

    const unsubscribeActivity = onValue(activityRef, (snapshot) => {
      const data = snapshot.val() || {};
      const pageCounts = {};
      Object.values(data).forEach((activity: any) => {
        const page = activity.currentPage || 'unknown';
        pageCounts[page] = (pageCounts[page] || 0) + 1;
      });
      setRealTime(prev => ({ ...prev, pages: pageCounts }));
    });

    const unsubscribeStats = onValue(statsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setStats(prev => ({ ...prev, ...data }));
    });

    return () => {
      unsubscribeStatus();
      unsubscribeActivity();
      unsubscribeStats();
    };
  }, []);

  // Data fetching from Supabase
  useEffect(() => {
    const fetchData = async () => {
      // Fetch total earnings from referrals
      const { data: earningsData, error: earningsError } = await supabase
        .from('referrals')
        .select('commission_amount')
        .eq('status', 'paid_out');
      
      if (earningsData) {
        const totalEarnings = earningsData.reduce((acc, item) => acc + item.commission_amount, 0);
        setStats(prev => ({...prev, totalEarnings}));
      }

      // Fetch user flow data
      const { data: usageData, error: usageError } = await supabase
        .from('usage_analytics')
        .select('created_at')
        .eq('action_type', 'user_login'); // Assuming 'user_login' tracks flow

      if (usageData) {
        const processedData = processUserFlowData(usageData);
        setUserFlow(processedData);
      }
    };

    fetchData();
  }, []);

  const healthScore = Math.round(((realTime.activeUsers / 50) * 0.4 + (stats.newSignups / 10) * 0.3 + (stats.totalMessages / 1000) * 0.3) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">ShadowTalk AI Analytics & Management</p>
          </div>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Earnings" value={`$${stats.totalEarnings.toFixed(2)}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground"/>} description="From referral commissions" />
                <StatCard title="Total Messages" value={stats.totalMessages.toLocaleString()} icon={<MessageSquare className="h-4 w-4 text-muted-foreground"/>} description="+12% this week" />
                <StatCard title="New Signups (24h)" value={stats.newSignups} icon={<UserCheck className="h-4 w-4 text-muted-foreground"/>} />
                <StatCard title="Active Users" value={realTime.activeUsers} icon={<Users className="h-4 w-4 text-muted-foreground"/>} description="Currently online" />
            </div>
            <div className="grid gap-4 mt-6 md:grid-cols-3 lg:grid-cols-5">
              <Card className="md:col-span-3 lg:col-span-3 row-span-2 bg-muted/20 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-green-500" />Real-Time User Flow</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                        {Object.entries(realTime.pages).length > 0 ? Object.entries(realTime.pages).map(([page, count]) => (
                            count > 0 && (
                                <div key={page}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">{page}</span>
                                        <span className="text-sm text-muted-foreground">{count} users</span>
                                    </div>
                                    <Progress value={(count / (realTime.activeUsers || 1)) * 100} className="h-2" />
                                </div>
                            )
                        )) : <p className="text-sm text-muted-foreground text-center py-8">No user activity detected.</p>}
                    </div>
                </CardContent>
              </Card>

               <Card className="md:col-span-2 lg:col-span-2 row-span-2 flex flex-col justify-center items-center">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5"/>Website Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-40 h-40 flex items-center justify-center rounded-full bg-gradient-to-tr from-primary/10 to-primary/30">
                        <div className="w-32 h-32 flex items-center justify-center rounded-full bg-background">
                            <p className="text-4xl font-bold text-primary">{Math.min(100, healthScore)}<span className="text-2xl">%</span></p>
                        </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">Based on activity & growth</p>
                </CardContent>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/>User Flow</CardTitle></CardHeader>
                <CardContent>
                    <Tabs defaultValue="monthly">
                        <TabsList>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly">Yearly</TabsTrigger>
                        </TabsList>
                        <TabsContent value="monthly">
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={userFlow.monthly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="users" fill="#8884d8" /></BarChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>
                        <TabsContent value="yearly">
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={userFlow.yearly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="users" stroke="#82ca9d" /></LineChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
             <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View, search, and manage all registered users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Last Seen</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.email || 'N/A'}</TableCell>
                                    <TableCell><Badge variant={user.state === 'online' ? 'success' : 'secondary'}>{user.state}</Badge></TableCell>
                                    <TableCell>{new Date(user.last_changed).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

const StatCard = ({ title, value, icon, description }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

export default AdminPage;
