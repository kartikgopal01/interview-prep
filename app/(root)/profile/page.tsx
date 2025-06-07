import React from 'react';
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getUserStats } from "@/lib/actions/general.action";
import { getUserPeerInterviews } from "@/lib/actions/peer-interview.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Trophy, TrendingUp, Target, Star, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfilePage = async () => {
    const user = await getCurrentUser();
    
    if (!user) {
        return null;
    }

    const [userStats, peerInterviews] = await Promise.all([
        getUserStats(user.id),
        getUserPeerInterviews(user.id)
    ]);

    // Calculate peer interview stats
    const peerStats = {
        total: peerInterviews?.length || 0,
        pending: peerInterviews?.filter(interview => interview.status === 'pending').length || 0,
        active: peerInterviews?.filter(interview => interview.status === 'active').length || 0,
        completed: peerInterviews?.filter(interview => interview.status === 'completed').length || 0
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Profile Header */}
            <div className="mb-8">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Member since {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Interviews Taken</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats?.totalInterviews || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{userStats?.recentInterviews || 0} this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                                <Trophy className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats?.averageScore || 0}/100</div>
                                <p className="text-xs text-muted-foreground">
                                    Best: {userStats?.bestScore || 0}/100
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Interviews Created</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats?.totalCreatedInterviews || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    For practice sessions
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Peer Interviews</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{peerStats.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    {peerStats.completed} completed
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Strengths and Improvement Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    Your Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {userStats?.strengths && userStats.strengths.length > 0 ? (
                                    <ul className="space-y-2">
                                        {userStats.strengths.slice(0, 5).map((strength, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm">{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Complete your first interview to see your strengths!
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-blue-500" />
                                    Areas for Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {userStats?.improvementAreas && userStats.improvementAreas.length > 0 ? (
                                    <ul className="space-y-2">
                                        {userStats.improvementAreas.slice(0, 5).map((area, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="text-sm">{area}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Complete your first interview to get improvement suggestions!
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                <Button asChild>
                                    <Link href="/interview">Start AI Interview</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/peer-interview/create">Create Peer Interview</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/peer-interview">Join Peer Interview</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/">View My Interviews</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    {/* Interview Types Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Types Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {userStats?.interviewTypes && Object.keys(userStats.interviewTypes).length > 0 ? (
                                <div className="space-y-3">
                                    {Object.entries(userStats.interviewTypes).map(([type, count]) => (
                                        <div key={type} className="flex items-center justify-between">
                                            <span className="capitalize">{type.replace('_', ' ')}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-500 h-2 rounded-full" 
                                                        style={{ 
                                                            width: `${(count / userStats.totalInterviews) * 100}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">
                                    No interviews completed yet. Start your first interview to see analytics!
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Peer Interview Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Peer Interview Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-500">{peerStats.pending}</div>
                                    <div className="text-sm text-gray-500">Pending</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-500">{peerStats.active}</div>
                                    <div className="text-sm text-gray-500">Active</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-500">{peerStats.completed}</div>
                                    <div className="text-sm text-gray-500">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{peerStats.total}</div>
                                    <div className="text-sm text-gray-500">Total</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Progress Insights */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Progress Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Score Progress</span>
                                        <span>{userStats?.averageScore || 0}/100</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full" 
                                            style={{ width: `${(userStats?.averageScore || 0)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Best Score Achievement</span>
                                        <span>{userStats?.bestScore || 0}/100</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full" 
                                            style={{ width: `${(userStats?.bestScore || 0)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {userStats?.totalInterviews && userStats.totalInterviews > 0 && (
                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            📈 You've completed {userStats.totalInterviews} interview{userStats.totalInterviews !== 1 ? 's' : ''} 
                                            {userStats.totalCreatedInterviews > 0 && ` and created ${userStats.totalCreatedInterviews} practice session${userStats.totalCreatedInterviews !== 1 ? 's' : ''}`}!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProfilePage; 