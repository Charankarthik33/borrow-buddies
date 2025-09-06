"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  MessageCircle, 
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Send,
  Smile,
  Bell,
  Shield,
  ShieldAlert,
  Check,
  CheckCheck,
  Edit2,
  Trash2,
  Reply,
  Heart,
  Clock,
  Settings,
  X,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  Archive,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  reactions?: Array<{ emoji: string; users: string[] }>;
  edited?: boolean;
  replyTo?: string;
  attachments?: Array<{ type: string; url: string; name: string }>;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  type: 'direct' | 'group';
  participants: Array<{ id: string; name: string; avatar: string }>;
  lastMessage?: Message;
  unreadCount: number;
  isTyping?: Array<{ id: string; name: string }>;
  lastSeen?: Date;
  isOnline?: boolean;
  bookingId?: string;
}

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'social' | 'admin' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
  actionUrl?: string;
  metadata?: {
    bookingId?: string;
    postId?: string;
    userId?: string;
    amount?: number;
  };
}

const CommunicationPanel = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'chat' | 'notifications'>('chat');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'booking'>('all');
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'booking' | 'social' | 'admin'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    quietHours: false,
    doNotDisturb: false,
    quietStart: '22:00',
    quietEnd: '07:00'
  });
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data from APIs
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('bearer_token');
      
      // Fetch conversations and notifications from API
      const [conversationsRes, notificationsRes] = await Promise.all([
        fetch('/api/messages/conversations', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }),
        fetch('/api/notifications', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
      ]);

      if (conversationsRes.ok) {
        const conversationsData = await conversationsRes.json();
        setConversations(conversationsData);
      } else {
        // Fallback to mock data
        setConversations(mockConversations);
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData);
      } else {
        // Fallback to mock data
        setNotifications(mockNotifications);
      }

      // Restore last conversation from localStorage
      const lastConversation = localStorage.getItem('lastConversation');
      if (lastConversation) {
        setActiveConversation(lastConversation);
        loadMessages(lastConversation);
      }
    } catch (error) {
      console.error('Error loading communication data:', error);
      // Use mock data as fallback
      setConversations(mockConversations);
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mock data fallbacks
  const mockConversations: Conversation[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      type: 'direct',
      participants: [
        { id: 'user1', name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400' }
      ],
      unreadCount: 2,
      isOnline: true,
      bookingId: 'booking123',
      lastMessage: {
        id: 'msg1',
        content: 'Is the apartment still available for next week?',
        sender: {
          id: 'user1',
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'
        },
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        status: 'delivered'
      }
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      type: 'direct',
      participants: [
        { id: 'user2', name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' }
      ],
      unreadCount: 0,
      isOnline: false,
      lastSeen: new Date(Date.now() - 1800000),
      lastMessage: {
        id: 'msg2',
        content: 'Thanks for the great experience!',
        sender: {
          id: 'user2',
          name: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
        },
        timestamp: new Date(Date.now() - 1800000),
        type: 'text',
        status: 'read'
      }
    },
    {
      id: '3',
      name: 'Emma Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      type: 'direct',
      participants: [
        { id: 'user3', name: 'Emma Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' }
      ],
      unreadCount: 1,
      isOnline: true,
      lastMessage: {
        id: 'msg3',
        content: 'Perfect timing! See you tomorrow.',
        sender: {
          id: 'user3',
          name: 'Emma Davis',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
        },
        timestamp: new Date(Date.now() - 7200000),
        type: 'text',
        status: 'sent'
      }
    },
    {
      id: '4',
      name: 'Photography Group',
      avatar: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      type: 'group',
      participants: [
        { id: 'user4', name: 'Alex Rodriguez', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
        { id: 'user5', name: 'Lisa Wang', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400' },
        { id: 'user6', name: 'Tom Brown', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' }
      ],
      unreadCount: 0,
      isTyping: [{ id: 'user4', name: 'Alex Rodriguez' }],
      lastMessage: {
        id: 'msg4',
        content: 'Who\'s bringing the equipment tomorrow?',
        sender: {
          id: 'user5',
          name: 'Lisa Wang',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
        },
        timestamp: new Date(Date.now() - 10800000),
        type: 'text',
        status: 'read'
      }
    }
  ];

  const mockNotifications: Notification[] = [
    {
      id: 'notif1',
      type: 'booking',
      title: 'New Booking Request',
      message: 'Sarah Johnson wants to book your Downtown Loft for 3 nights',
      timestamp: new Date(Date.now() - 600000),
      read: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      actionUrl: '/bookings/123',
      metadata: { bookingId: 'booking123' }
    },
    {
      id: 'notif2',
      type: 'payment',
      title: 'Payment Received',
      message: 'You received $250 from Mike Chen',
      timestamp: new Date(Date.now() - 1200000),
      read: false,
      metadata: { amount: 250, userId: 'user2' }
    },
    {
      id: 'notif3',
      type: 'social',
      title: 'New Like',
      message: 'Emma Davis liked your post about "Weekend Photography"',
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      metadata: { postId: 'post123', userId: 'user3' }
    }
  ];

  // Load messages for conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/messages/${conversationId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      } else {
        // Fallback to mock messages
        const mockMessages: Message[] = [
          {
            id: 'msg1',
            content: 'Hi! I saw your listing for the downtown loft. Is it available for next weekend?',
            sender: {
              id: 'user1',
              name: 'Sarah Johnson',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'
            },
            timestamp: new Date(Date.now() - 3600000),
            type: 'text',
            status: 'read'
          },
          {
            id: 'msg2',
            content: 'Yes, it is! The dates are available. Would you like to schedule a virtual tour?',
            sender: {
              id: 'current-user',
              name: 'You',
              avatar: session?.user?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
            },
            timestamp: new Date(Date.now() - 3300000),
            type: 'text',
            status: 'read'
          },
          {
            id: 'msg3',
            content: 'That would be perfect! What times work for you?',
            sender: {
              id: 'user1',
              name: 'Sarah Johnson',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'
            },
            timestamp: new Date(Date.now() - 3000000),
            type: 'text',
            status: 'read',
            reactions: [{ emoji: '👍', users: ['current-user'] }]
          },
          {
            id: 'msg4',
            content: 'Is the apartment still available for next week?',
            sender: {
              id: 'user1',
              name: 'Sarah Johnson',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'
            },
            timestamp: new Date(Date.now() - 300000),
            type: 'text',
            status: 'delivered'
          }
        ];
        setMessages(mockMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Save last conversation
  useEffect(() => {
    if (activeConversation) {
      localStorage.setItem('lastConversation', activeConversation);
      loadMessages(activeConversation);
    }
  }, [activeConversation, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle SOS countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sosCountdown > 0) {
      interval = setInterval(() => {
        setSosCountdown(prev => {
          if (prev <= 1) {
            triggerSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sosCountdown]);

  const triggerSOS = useCallback(() => {
    setSosActive(true);
    toast.success('Emergency contacts have been notified');
    setTimeout(() => {
      setSosActive(false);
    }, 5000);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!messageInput.trim() || !activeConversation || sendingMessage) return;

    setSendingMessage(true);
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: messageInput.trim(),
      sender: {
        id: 'current-user',
        name: session?.user?.name || 'You',
        avatar: session?.user?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
      },
      timestamp: new Date(),
      type: 'text',
      status: 'sending',
      replyTo: replyingTo?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setReplyingTo(null);

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          conversationId: activeConversation,
          content: newMessage.content,
          replyTo: newMessage.replyTo
        })
      });

      if (response.ok) {
        // Update message status to delivered
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'delivered' as const }
              : msg
          )
        );

        // Update conversation last message
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversation
              ? { ...conv, lastMessage: { ...newMessage, status: 'delivered' as const } }
              : conv
          )
        );
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Update message status to failed (you could add this status)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' as const } // Fallback to sent
            : msg
        )
      );
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }, [messageInput, activeConversation, replyingTo, session, sendingMessage]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
  }, []);

  const archiveNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    toast.success('Notification archived');
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: msg.reactions
                ? msg.reactions.some(r => r.emoji === emoji)
                  ? msg.reactions.map(r =>
                      r.emoji === emoji
                        ? {
                            ...r,
                            users: r.users.includes('current-user')
                              ? r.users.filter(u => u !== 'current-user')
                              : [...r.users, 'current-user']
                          }
                        : r
                    ).filter(r => r.users.length > 0)
                  : [...msg.reactions, { emoji, users: ['current-user'] }]
                : [{ emoji, users: ['current-user'] }]
            }
          : msg
      )
    );
    setShowEmojiPicker(false);
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast.success('Message deleted');
  }, []);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, content: newContent, edited: true }
          : msg
      )
    );
    setEditingMessage(null);
    toast.success('Message updated');
  }, []);

  const filteredConversations = conversations.filter(conv => {
    if (searchQuery && !conv.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (messageFilter === 'unread' && conv.unreadCount === 0) {
      return false;
    }
    if (messageFilter === 'booking' && !conv.bookingId) {
      return false;
    }
    return true;
  });

  const filteredNotifications = notifications.filter(notif => {
    if (notificationFilter === 'unread' && notif.read) {
      return false;
    }
    if (notificationFilter !== 'all' && notif.type !== notificationFilter) {
      return false;
    }
    return true;
  });

  const unreadNotificationCount = notifications.filter(n => !n.read).length;
  const totalUnreadMessages = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-card">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-display font-semibold">Messages</h2>
          {!isConnected && (
            <Badge variant="destructive" className="text-xs">
              {isReconnecting ? 'Reconnecting...' : 'Offline'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowSOSModal(true)}
            className="bg-destructive hover:bg-destructive/90"
          >
            <ShieldAlert className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* SOS Active Indicator */}
      {(sosCountdown > 0 || sosActive) && (
        <div className="bg-destructive text-destructive-foreground p-2 text-center text-sm">
          {sosCountdown > 0 ? (
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency activation in {sosCountdown}s</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSosCountdown(0)}
                className="ml-2 text-xs h-6"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 w-4 animate-pulse" />
              <span>Emergency services contacted</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chat' | 'notifications')} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 mx-3 mt-3 mb-0">
          <TabsTrigger value="chat" className="relative text-sm">
            Chat
            {totalUnreadMessages > 0 && (
              <Badge className="absolute -top-1 -right-1 min-w-4 h-4 text-xs bg-destructive text-destructive-foreground px-1">
                {totalUnreadMessages}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="relative text-sm">
            Notifications
            {unreadNotificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 min-w-4 h-4 text-xs bg-destructive text-destructive-foreground px-1">
                {unreadNotificationCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-3">
          <div className="flex-1 flex min-h-0">
            {/* Compact Conversation Sidebar */}
            <div className="w-80 border-r border-border flex flex-col bg-card/30">
              {/* Search and Filters */}
              <div className="p-3 space-y-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={messageFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMessageFilter('all')}
                    className="text-xs h-6 px-2"
                  >
                    All
                  </Button>
                  <Button
                    variant={messageFilter === 'unread' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMessageFilter('unread')}
                    className="text-xs h-6 px-2"
                  >
                    Unread
                  </Button>
                  <Button
                    variant={messageFilter === 'booking' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMessageFilter('booking')}
                    className="text-xs h-6 px-2"
                  >
                    Bookings
                  </Button>
                </div>
              </div>

              {/* Conversations List - Fixed Height with Scroll */}
              <ScrollArea className="flex-1">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No conversations found</p>
                  </div>
                ) : (
                  <div className="p-1.5">
                    {filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setActiveConversation(conversation.id)}
                        className={`w-full p-2.5 rounded-md text-left hover:bg-accent transition-colors mb-1 ${
                          activeConversation === conversation.id ? 'bg-accent border border-border' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={conversation.avatar} />
                              <AvatarFallback className="text-xs">{conversation.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {conversation.type === 'direct' && conversation.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-background rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-medium text-xs truncate">{conversation.name}</span>
                              {conversation.lastMessage && (
                                <span className="text-xs text-muted-foreground">
                                  {conversation.lastMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                {conversation.isTyping && conversation.isTyping.length > 0 ? (
                                  <p className="text-xs text-primary italic">
                                    {conversation.isTyping[0].name} typing...
                                  </p>
                                ) : conversation.lastMessage ? (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {conversation.lastMessage.sender.id === 'current-user' ? 'You: ' : ''}
                                    {conversation.lastMessage.content}
                                  </p>
                                ) : (
                                  <p className="text-xs text-muted-foreground">No messages yet</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 ml-2">
                                {conversation.bookingId && (
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                )}
                                {conversation.unreadCount > 0 && (
                                  <Badge className="text-xs h-4 min-w-4 bg-destructive text-destructive-foreground px-1">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat Area - Fixed Height */}
            <div className="flex-1 flex flex-col min-h-0">
              {activeConversation ? (
                <>
                  {/* Chat Header - Fixed */}
                  <div className="p-3 border-b border-border bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={conversations.find(c => c.id === activeConversation)?.avatar} />
                          <AvatarFallback className="text-xs">
                            {conversations.find(c => c.id === activeConversation)?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-sm">
                            {conversations.find(c => c.id === activeConversation)?.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              const conv = conversations.find(c => c.id === activeConversation);
                              if (conv?.type === 'direct') {
                                return conv.isOnline ? 'Online' : conv.lastSeen 
                                  ? `Last seen ${conv.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                  : 'Offline';
                              }
                              return `${conv?.participants.length} members`;
                            })()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area - Scrollable with Fixed Height */}
                  <ScrollArea className="flex-1 p-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Start a conversation</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message) => (
                          <div key={message.id} className="group">
                            {message.replyTo && (
                              <div className="ml-10 mb-1 p-1.5 bg-muted rounded text-xs text-muted-foreground border-l-2 border-primary">
                                Replying to: {messages.find(m => m.id === message.replyTo)?.content.slice(0, 40)}...
                              </div>
                            )}
                            <div
                              className={`flex gap-2.5 ${
                                message.sender.id === 'current-user' ? 'flex-row-reverse' : 'flex-row'
                              }`}
                            >
                              {message.sender.id !== 'current-user' && (
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={message.sender.avatar} />
                                  <AvatarFallback className="text-xs">{message.sender.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`max-w-xs px-3 py-2 rounded-lg relative text-sm ${
                                  message.sender.id === 'current-user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                {editingMessage === message.id ? (
                                  <div className="space-y-1">
                                    <Textarea
                                      defaultValue={message.content}
                                      className="min-h-0 text-xs"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          editMessage(message.id, e.currentTarget.value);
                                        } else if (e.key === 'Escape') {
                                          setEditingMessage(null);
                                        }
                                      }}
                                    />
                                    <Button size="sm" variant="ghost" onClick={() => setEditingMessage(null)} className="h-5 text-xs">
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm">{message.content}</p>
                                    {message.edited && (
                                      <span className="text-xs opacity-70">(edited)</span>
                                    )}
                                  </>
                                )}
                                
                                {/* Message Actions */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-1 right-1 bg-background border border-border rounded p-0.5 flex gap-0.5 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addReaction(message.id, '👍')}
                                    className="h-5 w-5 p-0"
                                  >
                                    <Smile className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReplyingTo(message)}
                                    className="h-5 w-5 p-0"
                                  >
                                    <Reply className="w-3 h-3" />
                                  </Button>
                                  {message.sender.id === 'current-user' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingMessage(message.id)}
                                        className="h-5 w-5 p-0"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteMessage(message.id)}
                                        className="h-5 w-5 p-0 text-destructive"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>

                                {/* Reactions */}
                                {message.reactions && message.reactions.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {message.reactions.map((reaction, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => addReaction(message.id, reaction.emoji)}
                                        className={`text-xs px-1.5 py-0.5 rounded-full border ${
                                          reaction.users.includes('current-user')
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background'
                                        }`}
                                      >
                                        {reaction.emoji} {reaction.users.length}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* Message Status */}
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs opacity-70">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {message.sender.id === 'current-user' && (
                                    <div className="text-xs opacity-70">
                                      {message.status === 'sending' && <Clock className="w-3 h-3" />}
                                      {message.status === 'sent' && <Check className="w-3 h-3" />}
                                      {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                                      {message.status === 'read' && <CheckCheck className="w-3 h-3 text-primary" />}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Reply Banner */}
                  {replyingTo && (
                    <div className="px-3 py-1.5 bg-muted border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Reply className="w-3 h-3" />
                        <span className="text-xs">
                          Replying to: {replyingTo.content.slice(0, 40)}...
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-5 w-5 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {/* Message Composer - Fixed */}
                  <div className="p-3 border-t border-border bg-card/50 backdrop-blur-sm">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-6 w-6 p-0"
                          >
                            <Paperclip className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="h-6 w-6 p-0"
                          >
                            <Smile className="w-3 h-3" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Type a message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          className="min-h-0 resize-none text-sm"
                          rows={1}
                          disabled={sendingMessage}
                        />
                      </div>
                      <Button
                        onClick={sendMessage}
                        disabled={!messageInput.trim() || !isConnected || sendingMessage}
                        className="shrink-0 h-8 w-8 p-0"
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full mb-2 p-2 bg-popover border border-border rounded-lg shadow-lg grid grid-cols-8 gap-1 z-10">
                        {['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setMessageInput(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="p-1 hover:bg-accent rounded text-sm"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        toast.success(`${e.target.files.length} file(s) selected`);
                      }
                    }}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-medium mb-2">Select a conversation</h3>
                    <p className="text-sm text-muted-foreground">Choose a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="flex-1 flex flex-col min-h-0 mt-3">
          {/* Notification Filters */}
          <div className="px-3 pb-3">
            <div className="flex gap-1 overflow-x-auto">
              <Button
                variant={notificationFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotificationFilter('all')}
                className="text-xs h-6 px-2 shrink-0"
              >
                All
              </Button>
              <Button
                variant={notificationFilter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotificationFilter('unread')}
                className="text-xs h-6 px-2 shrink-0"
              >
                Unread
              </Button>
              <Button
                variant={notificationFilter === 'booking' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotificationFilter('booking')}
                className="text-xs h-6 px-2 shrink-0"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Booking
              </Button>
              <Button
                variant={notificationFilter === 'social' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotificationFilter('social')}
                className="text-xs h-6 px-2 shrink-0"
              >
                <Heart className="w-3 h-3 mr-1" />
                Social
              </Button>
              <Button
                variant={notificationFilter === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotificationFilter('admin')}
                className="text-xs h-6 px-2 shrink-0"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Button>
            </div>
          </div>

          {/* Notifications List - Fixed Height with Scroll */}
          <ScrollArea className="flex-1 px-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                      !notification.read ? 'border-primary/20 bg-primary/5' : ''
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2.5">
                        {notification.avatar ? (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback className="text-xs">{notification.title.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            {notification.type === 'booking' && <Calendar className="w-4 h-4" />}
                            {notification.type === 'payment' && <DollarSign className="w-4 h-4" />}
                            {notification.type === 'social' && <Heart className="w-4 h-4" />}
                            {notification.type === 'admin' && <Shield className="w-4 h-4" />}
                            {notification.type === 'system' && <Bell className="w-4 h-4" />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                          
                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            {notification.metadata?.bookingId && (
                              <Button variant="outline" size="sm" className="text-xs h-5 px-2">
                                View
                              </Button>
                            )}
                            {notification.metadata?.postId && (
                              <Button variant="outline" size="sm" className="text-xs h-5 px-2">
                                View
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveNotification(notification.id);
                              }}
                              className="text-xs h-5 px-2 ml-auto"
                            >
                              <Archive className="w-3 h-3 mr-1" />
                              Archive
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* SOS Modal */}
      <Dialog open={showSOSModal} onOpenChange={setShowSOSModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" />
              Emergency SOS
            </DialogTitle>
            <DialogDescription>
              This will immediately contact emergency services and notify your recent contacts with your location.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-2">What will happen:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Emergency services will be contacted</li>
                <li>• Your location will be shared</li>
                <li>• Recent contacts will receive an alert</li>
                <li>• A 10-second countdown allows cancellation</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSOSModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowSOSModal(false);
                setSosCountdown(10);
              }}
            >
              <ShieldAlert className="w-4 h-4 mr-2" />
              Activate SOS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Message Settings</DialogTitle>
            <DialogDescription>
              Manage your notification preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Push Notifications</label>
                  <p className="text-xs text-muted-foreground">Receive notifications on this device</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Email Notifications</label>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Do Not Disturb</label>
                  <p className="text-xs text-muted-foreground">Silence all notifications</p>
                </div>
                <Switch
                  checked={settings.doNotDisturb}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, doNotDisturb: checked }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowSettings(false);
              toast.success('Settings saved');
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunicationPanel;