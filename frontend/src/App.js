import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Upload, FileText, DollarSign, AlertTriangle, CheckCircle, TrendingUp, Shield, Users, Crown, Lock, Trash2, Eye, Settings, Search, Sparkles, Home, BarChart3, X, Menu, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [page, setPage] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/me`);
      setUser(data.user);
    } catch (err) {
      logout();
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setPage('home');
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/google`, { token: credentialResponse.credential });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setShowAuth(false);
    } catch (err) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/send-otp`, { email });
      setOtpSent(true);
      alert('OTP sent to your email');
    } catch (err) {
      alert('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, { email, code: otp });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setShowAuth(false);
      setOtpSent(false);
      setEmail('');
      setOtp('');
    } catch (err) {
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const analyzeBill = async (file) => {
    try {
      setAnalyzing(true);
      const formData = new FormData();
      formData.append('bill', file);
      const { data } = await axios.post(`${API_URL}/analysis/analyze`, formData);
      setAnalysis(data.analysis);
      setPage('results');
    } catch (err) {
      alert('Analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchReports = async () => {
    const { data } = await axios.get(`${API_URL}/reports`);
    setReports(data.reports);
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    await axios.delete(`${API_URL}/reports/${id}`);
    fetchReports();
  };

  const fetchAdminData = async () => {
    const [usersRes, statsRes] = await Promise.all([
      axios.get(`${API_URL}/admin/users`),
      axios.get(`${API_URL}/admin/stats`)
    ]);
    setUsers(usersRes.data.users);
    setStats(statsRes.data);
  };

  const updateUser = async (userId, updates) => {
    await axios.patch(`${API_URL}/admin/users/${userId}`, updates);
    fetchAdminData();
    setEditingUser(null);
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`${API_URL}/admin/users/${userId}`);
    fetchAdminData();
  };

  useEffect(() => {
    if (user && page === 'dashboard') fetchReports();
    if (user?.role === 'admin' && page === 'admin') fetchAdminData();
  }, [page, user]);

  const Header = () => (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div onClick={() => setPage('home')} className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NoBillShit</span>
        </div>

        {user ? (
          <>
            <nav className="hidden md:flex gap-4">
              <button onClick={() => setPage('home')} className={`px-4 py-2 rounded-lg ${page === 'home' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>
                <Home className="w-4 h-4 inline mr-2" />Home
              </button>
              <button onClick={() => setPage('dashboard')} className={`px-4 py-2 rounded-lg ${page === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>
                <BarChart3 className="w-4 h-4 inline mr-2" />Dashboard
              </button>
              {user.role === 'admin' && (
                <button onClick={() => setPage('admin')} className={`px-4 py-2 rounded-lg ${page === 'admin' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'}`}>
                  <Shield className="w-4 h-4 inline mr-2" />Admin
                </button>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm font-medium">{user.name}</span>
              {user.isPremium && <Crown className="w-4 h-4 text-yellow-600" />}
              <button onClick={logout} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Logout</button>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2">
                {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </>
        ) : (
          <button onClick={() => setShowAuth(true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Sign In
          </button>
        )}
      </div>
      {mobileMenu && user && (
        <div className="md:hidden border-t bg-white p-4">
          <button onClick={() => { setPage('home'); setMobileMenu(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">Home</button>
          <button onClick={() => { setPage('dashboard'); setMobileMenu(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">Dashboard</button>
          {user.role === 'admin' && (
            <button onClick={() => { setPage('admin'); setMobileMenu(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">Admin</button>
          )}
        </div>
      )}
    </header>
  );

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Sign In</h2>
          <button onClick={() => setShowAuth(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setAuthMode('google')} className={`flex-1 py-2 rounded-lg ${authMode === 'google' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Google</button>
            <button onClick={() => setAuthMode('email')} className={`flex-1 py-2 rounded-lg ${authMode === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Email</button>
          </div>

          {authMode === 'google' ? (
            <GoogleLogin onSuccess={handleGoogleLogin} onError={() => alert('Login failed')} />
          ) : (
            <>
              {!otpSent ? (
                <>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  <button onClick={sendOTP} disabled={loading || !email} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-3 border rounded-lg text-center text-2xl"
                  />
                  <button onClick={verifyOTP} disabled={loading || otp.length !== 6} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button onClick={() => setOtpSent(false)} className="w-full text-sm text-gray-600">Change email</button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Stop Overpaying on <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Bills</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">Upload any bill. Our AI analyzes it and shows you exactly where you're being overcharged.</p>
        </div>

        {user ? (
          <div className="max-w-2xl mx-auto">
            {analyzing ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Analyzing your bill...</h3>
                <p className="text-gray-600">This takes 10-20 seconds</p>
              </div>
            ) : (
              <label className="block bg-white rounded-2xl p-12 text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition">
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files[0] && analyzeBill(e.target.files[0])} />
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Drop your bill here</h3>
                <p className="text-gray-600">PDF, JPG, PNG • Max 10MB</p>
              </label>
            )}
          </div>
        ) : (
          <div className="text-center">
            <button onClick={() => setShowAuth(true)} className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700">
              Get Started Free
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const ResultsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Analysis Complete!</span>
          </div>
          <h1 className="text-4xl font-bold">{analysis.fileName}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white">
            <DollarSign className="w-12 h-12 mb-4" />
            <p className="text-sm mb-2">Total Amount</p>
            <p className="text-5xl font-bold">${analysis.totalAmount}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-8 text-white">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <p className="text-sm mb-2">Issues Found</p>
            <p className="text-5xl font-bold">{analysis.issuesCount}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white">
            <TrendingUp className="w-12 h-12 mb-4" />
            <p className="text-sm mb-2">Potential Savings</p>
            <p className="text-5xl font-bold">${analysis.potentialSavings}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">AI Summary</h2>
          <p className="text-lg text-gray-700">{analysis.summary}</p>
        </div>

        {analysis.potentialIssues?.length > 0 && (
          <div className="bg-white rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Issues</h2>
            <div className="space-y-4">
              {analysis.potentialIssues.map((issue, i) => (
                <div key={i} className={`p-6 rounded-2xl border-2 ${issue.severity === 'high' ? 'bg-red-50 border-red-300' : issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-300' : 'bg-blue-50 border-blue-300'}`}>
                  <h3 className="font-bold text-lg mb-2">{issue.title}</h3>
                  <p className="text-gray-700">{issue.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.savingsOpportunities?.length > 0 && (
          <div className="bg-white rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Savings Opportunities</h2>
            <div className="space-y-4">
              {analysis.savingsOpportunities.map((opp, i) => (
                <div key={i} className="p-6 bg-green-50 rounded-2xl border-2 border-green-200 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{opp.title}</h3>
                    <p className="text-gray-700">{opp.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-3xl font-bold text-green-600">${opp.savings}</p>
                    <p className="text-sm text-gray-500">per month</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button onClick={() => setPage('home')} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:shadow-xl">
            Analyze Another Bill
          </button>
          <button onClick={() => setPage('dashboard')} className="px-8 py-4 bg-white border-2 text-gray-700 rounded-2xl font-bold hover:shadow-lg">
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardPage = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Reports</h1>
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
            <p className="text-gray-600 mb-6">Upload your first bill to get started</p>
            <button onClick={() => setPage('home')} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">Analyze First Bill</button>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div key={report._id} className="bg-white rounded-2xl p-6 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{report.fileName}</h3>
                  <p className="text-sm text-gray-500 mb-4">{new Date(report.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-4 text-sm">
                    <span><strong>${report.totalAmount}</strong> Total</span>
                    <span><strong>{report.issuesCount}</strong> Issues</span>
                    <span className="text-green-600"><strong>${report.potentialSavings}</strong> Savings</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setAnalysis(report.analysis); setPage('results'); }} className="p-2 hover:bg-gray-100 rounded-lg">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteReport(report._id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const AdminPage = () => {
    const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <div className="bg-white rounded-2xl p-6">
              <Crown className="w-8 h-8 text-yellow-600 mb-2" />
              <p className="text-3xl font-bold">{stats.premiumUsers || 0}</p>
              <p className="text-sm text-gray-600">Premium</p>
            </div>
            <div className="bg-white rounded-2xl p-6">
              <Lock className="w-8 h-8 text-red-600 mb-2" />
              <p className="text-3xl font-bold">{stats.blockedUsers || 0}</p>
              <p className="text-sm text-gray-600">Blocked</p>
            </div>
            <div className="bg-white rounded-2xl p-6">
              <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-3xl font-bold">{stats.totalAnalyses || 0}</p>
              <p className="text-sm text-gray-600">Analyses</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {u.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          {u.role === 'admin' && <span className="text-xs text-purple-600">Admin</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.isPremium ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          <Crown className="w-3 h-3 inline mr-1" />{u.premiumPlan}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">Free</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingUser(u)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateUser(u._id, { status: u.status === 'blocked' ? 'active' : 'blocked' })} className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                          <Lock className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteUser(u._id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-6">Edit User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input type="text" defaultValue={editingUser.name} onChange={(e) => editingUser.name = e.target.value} className="w-full px-4 py-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Plan</label>
                  <select defaultValue={editingUser.premiumPlan || 'free'} onChange={(e) => { editingUser.premiumPlan = e.target.value === 'free' ? null : e.target.value; editingUser.isPremium = e.target.value !== 'free'; }} className="w-full px-4 py-3 border rounded-lg">
                    <option value="free">Free</option>
                    <option value="monthly">Monthly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select defaultValue={editingUser.role} onChange={(e) => editingUser.role = e.target.value} className="w-full px-4 py-3 border rounded-lg">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setEditingUser(null)} className="flex-1 px-6 py-3 border rounded-lg font-semibold">Cancel</button>
                  <button onClick={() => updateUser(editingUser._id, editingUser)} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">
          {page === 'home' && <HomePage />}
          {page === 'results' && analysis && <ResultsPage />}
          {page === 'dashboard' && <DashboardPage />}
          {page === 'admin' && user?.role === 'admin' && <AdminPage />}
        </main>
        {showAuth && <AuthModal />}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
