"use client";

import { useState, useEffect, useRef } from "react";
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

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  messages: Message[];
  participant: Contact;
}

export const CommunicationPanel = () => {
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data initialization
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: "1",
        name: "Sarah Johnson",
        avatar: "/api/placeholder/40/40",
        lastMessage: "Hey! Are you still available for the weekend?",
        timestamp: "2 min ago",
        unreadCount: 2,
        isOnline: true,
        isTyping: false
      },
      {
        id: "2",
        name: "Mike Chen",
        avatar: "/api/placeholder/40/40",
        lastMessage: "Thanks for the great experience!",
        timestamp: "1 hour ago",
        unreadCount: 0,
        isOnline: false,
        isTyping: false
      },
      {
        id: "3",
        name: "Emma Davis",
        avatar: "/api/placeholder/40/40",
        lastMessage: "Can we reschedule for tomorrow?",
        timestamp: "3 hours ago",
        unreadCount: 1,
        isOnline: true,
        isTyping: true
      },
      {
        id: "4",
        name: "Alex Rodriguez",
        avatar: "/api/placeholder/40/40",
        lastMessage: "Perfect! See you at 3 PM",
        timestamp: "Yesterday",
        unreadCount: 0,
        isOnline: false,
        isTyping: false
      },
      {
        id: "5",
        name: "Lisa Wang",
        avatar: "/api/placeholder/40/40",
        lastMessage: "The photos look amazing!",
        timestamp: "2 days ago",
        unreadCount: 0,
        isOnline: true,
        isTyping: false
      }
    ];

    const mockConversations: Conversation[] = mockContacts.map(contact => ({
      id: contact.id,
      participant: contact,
      messages: [
        {
          id: `${contact.id}-1`,
          senderId: contact.id,
          content: contact.lastMessage,
          timestamp: contact.timestamp,
          isRead: contact.unreadCount === 0,
          status: 'delivered'
        }
      ]
    }));

    setContacts(mockContacts);
    setConversations(mockConversations);
    setSelectedContact(mockContacts[0]);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, selectedContact]);

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedContact || !session?.user) return;

    const newMessage: Message = {
      id: `${Date.now()}`,
      senderId: session.user.id,
      content: messageInput,
      timestamp: "now",
      isRead: false,
      status: 'sending'
    };

    setConversations(prev => prev.map(conv => 
      conv.id === selectedContact.id 
        ? { ...conv, messages: [...conv.messages, newMessage] }
        : conv
    ));

    setMessageInput("");

    // Simulate message status updates
    setTimeout(() => {
      setConversations(prev => prev.map(conv => 
        conv.id === selectedContact.id 
          ? { 
            ...conv, 
            messages: conv.messages.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
            )
          }
          : conv
      ));
    }, 500);
  };

  const currentConversation = conversations.find(conv => conv.id === selectedContact?.id);

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

  return (
    <Card className="h-[600px] overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Contacts List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No conversations found</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                      selectedContact?.id === contact.id && "bg-accent"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {contact.isOnline && (
                        <Circle className="absolute -bottom-1 -right-1 h-4 w-4 fill-green-500 text-green-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{contact.name}</h3>
                        <span className="text-xs text-muted-foreground">{contact.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.isTyping ? (
                            <span className="text-primary">Typing...</span>
                          ) : (
                            contact.lastMessage
                          )}
                        </p>
                        {contact.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 h-5 min-w-5 text-xs">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
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
                      <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                      <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {selectedContact.isOnline && (
                      <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedContact.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedContact.isOnline ? "Online" : "Offline"}
                    </p>
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
                  {currentConversation?.messages.map((message) => {
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
                            <span className="text-xs">{message.timestamp}</span>
                            {isSent && (
                              <div>
                                {message.status === 'sending' && (
                                  <Circle className="h-3 w-3" />
                                )}
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
                  
                  {selectedContact.isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <Circle className="h-2 w-2 animate-bounce fill-current" />
                          <Circle className="h-2 w-2 animate-bounce fill-current" style={{animationDelay: '0.1s'}} />
                          <Circle className="h-2 w-2 animate-bounce fill-current" style={{animationDelay: '0.2s'}} />
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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