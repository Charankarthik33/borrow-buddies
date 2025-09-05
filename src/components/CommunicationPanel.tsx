"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  MessageSquareMore, 
  MessageCircleMore,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Plus,
  Paperclip,
  Send,
  Smile,
  Bell,
  BellOff,
  Shield,
  ShieldAlert,
  Filter,
  Archive,
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
  User,
  MapPin,
  Calendar,
  DollarSign,
  Volume2,
  VolumeX,
  Moon,
  Eye,
  EyeOff
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

  // Simulate Socket.IO connection
  useEffect(() => {
    const connectSocket = () => {
      setIsReconnecting(true);
      setTimeout(() => {
        setIsConnected(true);
        setIsReconnecting(false);
        loadInitialData();
      }, 1000);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setTimeout(connectSocket, 3000);
    };

    connectSocket();

    // Simulate random disconnections
    const disconnectInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        handleDisconnect();
      }
    }, 30000);

    return () => clearInterval(disconnectInterval);
  }, []);

  // Load initial data
  const loadInitialData = useCallback(() => {
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
        name: 'Downtown Loft Group',
        avatar: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
        type: 'group',
        participants: [
          { id: 'user2', name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' },
          { id: 'user3', name: 'Emma Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
          { id: 'user4', name: 'Alex Rodriguez', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }
        ],
        unreadCount: 0,
        isTyping: [{ id: 'user2', name: 'Mike Chen' }],
        lastMessage: {
          id: 'msg2',
          content: 'Great meeting everyone today!',
          sender: {
            id: 'user3',
            name: 'Emma Davis',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
          },
          timestamp: new Date(Date.now() - 1800000),
          type: 'text',
          status: 'read'
        }
      },
      {
        id: '3',
        name: 'James Wilson',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        type: 'direct',
        participants: [
          { id: 'user5', name: 'James Wilson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' }
        ],
        unreadCount: 1,
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000),
        lastMessage: {
          id: 'msg3',
          content: 'Thanks for the quick response!',
          sender: {
            id: 'user5',
            name: 'James Wilson',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
          },
          timestamp: new Date(Date.now() - 7200000),
          type: 'text',
          status: 'sent'
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
        message: 'You received $250 from James Wilson',
        timestamp: new Date(Date.now() - 1200000),
        read: false,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        metadata: { amount: 250, userId: 'user5' }
      },
      {
        id: 'notif3',
        type: 'social',
        title: 'New Like',
        message: 'Emma Davis liked your post about "Perfect Weekend Getaway"',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        metadata: { postId: 'post123', userId: 'user3' }
      },
      {
        id: 'notif4',
        type: 'admin',
        title: 'Verification Update',
        message: 'Your identity verification has been approved',
        timestamp: new Date(Date.now() - 7200000),
        read: true,
        metadata: {}
      }
    ];

    setConversations(mockConversations);
    setNotifications(mockNotifications);

    // Restore last conversation from localStorage
    const lastConversation = localStorage.getItem('lastConversation');
    if (lastConversation && mockConversations.find(c => c.id === lastConversation)) {
      setActiveConversation(lastConversation);
      loadMessages(lastConversation);
    }
  }, []);

  // Load messages for conversation
  const loadMessages = useCallback((conversationId: string) => {
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
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
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
  }, []);

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
    
    // Simulate Twilio SMS/Call
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      if (success) {
        toast.success('Emergency contacts have been notified');
        // Simulate broadcasting to recent contacts
        const recentContacts = conversations.slice(0, 3);
        recentContacts.forEach(contact => {
          const sosMessage: Message = {
            id: `sos-${Date.now()}-${contact.id}`,
            content: '🆘 EMERGENCY: I need immediate assistance. Location shared.',
            sender: {
              id: 'current-user',
              name: 'You',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
            },
            timestamp: new Date(),
            type: 'text',
            status: 'sent'
          };
          // In real app, this would send via socket
          console.log(`SOS message sent to ${contact.name}`);
        });
      } else {
        toast.error('Emergency notification failed. Please try again or call emergency services directly.');
      }
      
      setTimeout(() => {
        setSosActive(false);
      }, 5000);
    }, 2000);
  }, [conversations]);

  const sendMessage = useCallback(() => {
    if (!messageInput.trim() || !activeConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: messageInput.trim(),
      sender: {
        id: 'current-user',
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
      },
      timestamp: new Date(),
      type: 'text',
      status: 'sending',
      replyTo: replyingTo?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setReplyingTo(null);

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
    }, 1000);

    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversation
          ? { ...conv, lastMessage: { ...newMessage, status: 'delivered' as const } }
          : conv
      )
    );
  }, [messageInput, activeConversation, replyingTo]);

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

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-display font-semibold">Communications</h2>
          {!isConnected && (
            <Badge variant="destructive" className="text-xs">
              {isReconnecting ? 'Reconnecting...' : 'Offline'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
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
            SOS
          </Button>
        </div>
      </div>

      {/* SOS Active Indicator */}
      {(sosCountdown > 0 || sosActive) && (
        <div className="bg-destructive text-destructive-foreground p-3 text-center">
          {sosCountdown > 0 ? (
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency activation in {sosCountdown}s</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSosCountdown(0)}
                className="ml-4 text-xs"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>Emergency services contacted. Help is on the way.</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chat' | 'notifications')} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="chat" className="relative">
            Chat
            {totalUnreadMessages > 0 && (
              <Badge className="absolute -top-2 -right-2 min-w-5 h-5 text-xs bg-destructive text-destructive-foreground">
                {totalUnreadMessages}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            Notifications
            {unreadNotificationCount > 0 && (
              <Badge className="absolute -top-2 -right-2 min-w-5 h-5 text-xs bg-destructive text-destructive-foreground">
                {unreadNotificationCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
          <div className="flex-1 flex">
            {/* Conversation List */}
            <div className="w-1/3 border-r border-border flex flex-col">
              {/* Search and Filters */}
              <div className="p-3 space-y-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={messageFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMessageFilter('all')}
                    className="text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant={messageFilter === 'unread' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMessageFilter('unread')}
                    className="text-xs"
                  >
                    Unread
                  </Button>
                  <Button
                    variant={messageFilter === 'booking' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMessageFilter('booking')}
                    className="text-xs"
                  >
                    Booking
                  </Button>
                </div>
              </div>

              {/* Conversations */}
              <ScrollArea className="flex-1">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations found</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setActiveConversation(conversation.id)}
                        className={`w-full p-3 rounded-lg text-left hover:bg-accent transition-colors mb-2 ${
                          activeConversation === conversation.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={conversation.avatar} />
                              <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {conversation.type === 'direct' && conversation.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm truncate">{conversation.name}</span>
                              {conversation.lastMessage && (
                                <span className="text-xs text-muted-foreground">
                                  {conversation.lastMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                {conversation.isTyping && conversation.isTyping.length > 0 ? (
                                  <p className="text-sm text-primary italic">
                                    {conversation.isTyping.map(t => t.name).join(', ')} typing...
                                  </p>
                                ) : conversation.lastMessage ? (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {conversation.lastMessage.sender.id === 'current-user' ? 'You: ' : ''}
                                    {conversation.lastMessage.content}
                                  </p>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No messages yet</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                {conversation.bookingId && (
                                  <Badge variant="outline" className="text-xs">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Booking
                                  </Badge>
                                )}
                                {conversation.unreadCount > 0 && (
                                  <Badge className="text-xs bg-destructive text-destructive-foreground">
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

            {/* Message Area */}
            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={conversations.find(c => c.id === activeConversation)?.avatar} />
                          <AvatarFallback>
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
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Start a conversation</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className="group">
                            {message.replyTo && (
                              <div className="ml-12 mb-1 p-2 bg-muted rounded text-sm text-muted-foreground border-l-2 border-primary">
                                Replying to: {messages.find(m => m.id === message.replyTo)?.content.slice(0, 50)}...
                              </div>
                            )}
                            <div
                              className={`flex gap-3 ${
                                message.sender.id === 'current-user' ? 'flex-row-reverse' : 'flex-row'
                              }`}
                            >
                              {message.sender.id !== 'current-user' && (
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={message.sender.avatar} />
                                  <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                                  message.sender.id === 'current-user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                {editingMessage === message.id ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      defaultValue={message.content}
                                      className="min-h-0 text-sm"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          editMessage(message.id, e.currentTarget.value);
                                        } else if (e.key === 'Escape') {
                                          setEditingMessage(null);
                                        }
                                      }}
                                    />
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="ghost" onClick={() => setEditingMessage(null)}>
                                        Cancel
                                      </Button>
                                    </div>
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
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-2 right-2 bg-background border border-border rounded-md p-1 flex gap-1 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addReaction(message.id, '👍')}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Smile className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReplyingTo(message)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Reply className="w-3 h-3" />
                                  </Button>
                                  {message.sender.id === 'current-user' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingMessage(message.id)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteMessage(message.id)}
                                        className="h-6 w-6 p-0 text-destructive"
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
                                        className={`text-xs px-2 py-1 rounded-full border ${
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
                    <div className="px-4 py-2 bg-muted border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Reply className="w-4 h-4" />
                        <span className="text-sm">
                          Replying to: {replyingTo.content.slice(0, 50)}...
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Message Composer */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            <Smile className="w-4 h-4" />
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
                          className="min-h-0 resize-none"
                          rows={1}
                        />
                      </div>
                      <Button
                        onClick={sendMessage}
                        disabled={!messageInput.trim() || !isConnected}
                        className="shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full mb-2 p-2 bg-popover border border-border rounded-lg shadow-lg grid grid-cols-8 gap-1">
                        {['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setMessageInput(prev => prev + emoji)}
                            className="p-2 hover:bg-accent rounded text-lg"
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
        <TabsContent value="notifications" className="flex-1 flex flex-col mt-4">
          {/* Notification Filters */}
          <div className="px-4 pb-4">
            <div className="flex gap-1 overflow-x-auto">
              <Button
                variant={notificationFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotificationFilter('all')}
                className="text-xs shrink-0"
              >
                All
              </Button>
              <Button
                variant={notificationFilter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotificationFilter('unread')}
                className="text-xs shrink-0"
              >
                Unread
              </Button>
              <Button
                variant={notificationFilter === 'booking' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotificationFilter('booking')}
                className="text-xs shrink-0"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Booking
              </Button>
              <Button
                variant={notificationFilter === 'social' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotificationFilter('social')}
                className="text-xs shrink-0"
              >
                <Heart className="w-3 h-3 mr-1" />
                Social
              </Button>
              <Button
                variant={notificationFilter === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotificationFilter('admin')}
                className="text-xs shrink-0"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="flex-1 px-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      !notification.read ? 'border-primary/20 bg-primary/5' : ''
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {notification.avatar ? (
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback>{notification.title.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            {notification.type === 'booking' && <Calendar className="w-5 h-5" />}
                            {notification.type === 'payment' && <DollarSign className="w-5 h-5" />}
                            {notification.type === 'social' && <Heart className="w-5 h-5" />}
                            {notification.type === 'admin' && <Shield className="w-5 h-5" />}
                            {notification.type === 'system' && <Bell className="w-5 h-5" />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          
                          {/* Quick Actions */}
                          <div className="flex items-center gap-2">
                            {notification.metadata?.bookingId && (
                              <Button variant="outline" size="sm" className="text-xs">
                                View Booking
                              </Button>
                            )}
                            {notification.metadata?.postId && (
                              <Button variant="outline" size="sm" className="text-xs">
                                View Post
                              </Button>
                            )}
                            {notification.metadata?.userId && (
                              <Button variant="outline" size="sm" className="text-xs">
                                Message User
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveNotification(notification.id);
                              }}
                              className="text-xs ml-auto"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" />
              Emergency SOS
            </DialogTitle>
            <DialogDescription>
              This will immediately contact emergency services and notify your recent contacts with your location.
              <br />
              <br />
              <span className="text-xs text-muted-foreground">
                * Twilio integration required for SMS/call functionality
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-2">What will happen:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Emergency services will be contacted via Twilio</li>
                <li>• Your location will be shared</li>
                <li>• Recent contacts will receive an alert message</li>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Communication Settings</DialogTitle>
            <DialogDescription>
              Manage your notification preferences and privacy settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Notifications */}
            <div>
              <h4 className="font-medium mb-3">Notifications</h4>
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

            <Separator />

            {/* Quiet Hours */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Quiet Hours</h4>
                  <p className="text-xs text-muted-foreground">Automatically silence notifications during these hours</p>
                </div>
                <Switch
                  checked={settings.quietHours}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, quietHours: checked }))
                  }
                />
              </div>
              {settings.quietHours && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Start Time</label>
                    <Input
                      type="time"
                      value={settings.quietStart}
                      onChange={(e) => setSettings(prev => ({ ...prev, quietStart: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">End Time</label>
                    <Input
                      type="time"
                      value={settings.quietEnd}
                      onChange={(e) => setSettings(prev => ({ ...prev, quietEnd: e.target.value }))}
                    />
                  </div>
                </div>
              )}
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