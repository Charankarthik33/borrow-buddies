"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  avatar: string | null;
  email?: string;
}

interface Message {
  id: string | number;
  senderId: string;
  content: string;
  createdAt: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: number;
  participants: Array<{ userId: string; name: string; email?: string; image?: string | null }>;
  lastMessage: { id: number; content: string; senderId: string; createdAt: string } | null;
}

export const CommunicationPanel = () => {
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const authHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bearer_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Load contacts and conversations
  useEffect(() => {
    const load = async () => {
      if (!session?.user) return;
      try {
        const [cRes, convRes] = await Promise.all([
          fetch('/api/contacts', { headers: { 'Content-Type': 'application/json', ...authHeaders() } }),
          fetch('/api/conversations', { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
        ]);
        if (cRes.ok) {
          const cJson = await cRes.json();
          const normalized: Contact[] = (Array.isArray(cJson) ? cJson : []).map((c: any) => ({
            id: c.contactUser.id,
            name: c.contactUser.name || 'User',
            email: c.contactUser.email,
            avatar: c.contactUser.image || null
          }));
          setContacts(normalized);
        }
        if (convRes.ok) {
          const convJson = await convRes.json();
          setConversations(convJson || []);
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load messages');
      }
    };
    load();
  }, [session, authHeaders]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
      if (res.ok) {
        const data = await res.json();
        const normalized: Message[] = (Array.isArray(data) ? data : []).map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt,
          status: m.status
        }));
        setMessages(normalized);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load conversation');
    }
  }, [authHeaders]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContact]);

  // Filter contacts by search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectContact = async (contact: Contact) => {
    setSelectedContact(contact);
    // find or create conversation
    let conversationId = conversations.find(c => c.participants.some(p => p.userId === contact.id))?.id || null;
    if (!conversationId) {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ userId: contact.id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to start conversation');
        conversationId = data.id;
        setConversations(prev => [{...data}, ...prev]);
      } catch (e: any) {
        toast.error(e.message || 'Could not open conversation');
        return;
      }
    }
    setActiveConversationId(conversationId);
    await loadMessages(conversationId);
  };

  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim() || !activeConversationId || !session?.user) return;

    const temp: Message = {
      id: `temp-${Date.now()}`,
      senderId: session.user.id,
      content: messageInput,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };
    setMessages(prev => [...prev, temp]);
    setMessageInput("");

    try {
      const res = await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ content: temp.content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send');
      // replace temp with real
      setMessages(prev => prev.map(m => m.id === temp.id ? {
        id: data.id,
        senderId: data.senderId,
        content: data.content,
        createdAt: data.createdAt,
        status: data.status
      } : m));
    } catch (e: any) {
      toast.error(e.message || 'Message failed');
    }
  };

  // Search users (global) to add contact
  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const res = await fetch(`/api/users/search?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized: Contact[] = data.map((u: any) => ({ id: u.id, name: u.name || u.email || 'User', email: u.email, avatar: u.image }));
        setSearchResults(normalized);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Add contact
  const addContact = async (userId: string) => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to add contact');
      const c: Contact = { id: data.contactUser.id, name: data.contactUser.name || 'User', email: data.contactUser.email, avatar: data.contactUser.image };
      setContacts(prev => [c, ...prev.filter(p => p.id !== c.id)]);
      toast.success('Contact added');
    } catch (e: any) {
      toast.error(e.message || 'Could not add contact');
    }
  };

  if (isPending) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access messages</p>
        </div>
      </Card>
    );
  }

  const currentConversation = messages; // already filtered by active conversation

  return (
    <Card className="h-[600px] overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations or users..."
                value={searchQuery}
                onChange={(e) => {
                  const v = e.target.value; setSearchQuery(v); searchUsers(v);
                }}
                className="pl-9"
              />
            </div>
            {/* Global user search results with add/start */}
            {searchQuery && searchResults.length > 0 && (
              <div className="space-y-1">
                {searchResults.slice(0,5).map(u => (
                  <div key={u.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6"><AvatarImage src={u.avatar || undefined} /><AvatarFallback>{u.name?.charAt(0)}</AvatarFallback></Avatar>
                      <span className="truncate max-w-[140px]">{u.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="xs" variant="ghost" onClick={() => addContact(u.id)}>Add</Button>
                      <Button size="xs" onClick={() => selectContact(u)}>Chat</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contacts List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => selectContact(contact)}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                      selectedContact?.id === contact.id && "bg-accent"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={contact.avatar || undefined} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{contact.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedContact.avatar || undefined} alt={selectedContact.name} />
                      <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedContact.name}</h2>
                    <p className="text-sm text-muted-foreground">Chat</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentConversation.map((message) => {
                    const isSent = message.senderId === session.user?.id;
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isSent ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                            isSent
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <p>{message.content}</p>
                          <div className={cn(
                            "flex items-center justify-end space-x-1 mt-1",
                            isSent ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            <span className="text-xs">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isSent && (
                              <div>
                                {message.status === 'sent' && (
                                  <Check className="h-3 w-3" />
                                )}
                                {(message.status === 'delivered' || message.status === 'read') && (
                                  <CheckCheck className={cn(
                                    "h-3 w-3",
                                    message.status === 'read' && "text-blue-500"
                                  )} />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};