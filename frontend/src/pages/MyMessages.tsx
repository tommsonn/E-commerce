import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  Reply, 
  ChevronRight, 
  X,
  ArrowLeft,
  Send,
  User,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { contactService, ContactMessage } from '../services/contactService';
import { useAuth } from '../context/AuthContext';

interface MyMessagesProps {
  onNavigate: (page: string) => void;
  messageId?: string;
}

export function MyMessages({ onNavigate, messageId }: MyMessagesProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('👤 Current user:', {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin
      });
      fetchMyMessages();
    }
  }, [user]);

  // Auto-select message if messageId is provided
  useEffect(() => {
    if (messageId) {
      console.log('🔍 Looking for message with ID:', messageId);
      
      // First check if we already have it in the messages array
      if (messages.length > 0) {
        const message = messages.find(m => m._id === messageId);
        if (message) {
          console.log('✅ Found message in list:', message.subject);
          setSelectedMessage(message);
          if (!message.isRead) {
            markMessageAsRead(messageId);
          }
          return;
        }
      }
      
      // If not found in list, fetch it directly
      fetchSpecificMessage(messageId);
    }
  }, [messageId, messages]);

  const fetchSpecificMessage = async (id: string) => {
    try {
      console.log('📡 Fetching specific message:', id);
      const message = await contactService.getMessageById(id);
      if (message) {
        console.log('✅ Found specific message:', message.subject);
        setSelectedMessage(message);
        if (!message.isRead && !user?.isAdmin) {
          markMessageAsRead(id);
        }
      } else {
        console.log('❌ Message not found with ID:', id);
        setError(t('Message not found', 'መልእክት አልተገኘም'));
      }
    } catch (error: any) {
      console.error('Error fetching specific message:', error);
      setError(error.message || 'Failed to load message');
    }
  };

  const fetchMyMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching messages for user:', user?.email);
      
      const response = await contactService.getMyMessages();
      console.log('📨 Messages response:', response);
      
      if (response.messages && response.messages.length > 0) {
        console.log(`✅ Found ${response.messages.length} messages`);
        setMessages(response.messages);
      } else {
        console.log('⚠️ No messages found for this user');
        setMessages([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching messages:', error);
      setError(error.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (id: string) => {
    try {
      await contactService.markAsRead(id);
      setMessages(prev => 
        prev.map(msg => 
          msg._id === id ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    try {
      setSendingReply(true);
      setReplyError(null);
      
      const updatedMessage = await contactService.replyToMessage(selectedMessage._id, replyText);
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg._id === selectedMessage._id 
            ? { ...msg, reply: replyText, isReplied: true, repliedAt: new Date().toISOString() } 
            : msg
        )
      );
      
      setSelectedMessage(prev => 
        prev ? { 
          ...prev, 
          reply: replyText, 
          isReplied: true, 
          repliedAt: new Date().toISOString() 
        } : null
      );
      
      setReplyText('');
      setReplySuccess(true);
      
      setTimeout(() => setReplySuccess(false), 3000);
      
    } catch (error) {
      console.error('Error sending reply:', error);
      setReplyError(t('Failed to send reply', 'መልስ መላክ አልተሳካም'));
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (message: ContactMessage) => {
    if (message.isReplied) {
      return {
        text: t('Replied', 'መልስ ተልኳል'),
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle
      };
    } else if (message.isRead) {
      return {
        text: t('Read', 'ተነቧል'),
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Mail
      };
    } else {
      return {
        text: t('Pending', 'በመጠባበቅ ላይ'),
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock
      };
    }
  };

  const handleMessageClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.isRead && !user?.isAdmin) {
      markMessageAsRead(message._id);
    }
    
    // Update URL to include message ID
    const url = new URL(window.location.href);
    url.pathname = `/my-messages/${message._id}`;
    window.history.pushState({}, '', url.toString());
  };

  const handleCloseMessage = () => {
    setSelectedMessage(null);
    setReplyText('');
    setReplyError(null);
    
    // Update URL back to messages list
    const url = new URL(window.location.href);
    url.pathname = '/my-messages';
    window.history.pushState({}, '', url.toString());
  };

  const handleSendNewMessage = () => {
    console.log('Navigating to contact page');
    handleCloseMessage();
    onNavigate('contact');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 
                    dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 
                    flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-20 h-20 
                        flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('Please sign in to view your messages', 'እባክዎ መልእክቶችዎን ለማየት ይግቡ')}
          </h2>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white 
                     rounded-xl transition-all transform hover:scale-105"
          >
            {t('Go to Login', 'ወደ መግቢያ ይሂዱ')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 
                    dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 
                    flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 
                        border-indigo-200 border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 
                    dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                        rounded-2xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchMyMessages();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              {t('Try Again', 'እንደገና ሞክር')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 
                  dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => onNavigate(user?.isAdmin ? 'admin' : 'profile')}
            className="group flex items-center text-gray-600 dark:text-gray-400 
                     hover:text-indigo-600 dark:hover:text-indigo-400 
                     transition-colors px-4 py-2 rounded-lg mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('Back', 'ተመለስ')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-indigo-600 dark:text-indigo-400" />
            {user?.isAdmin ? t('All Messages', 'ሁሉም መልእክቶች') : t('My Messages', 'መልእክቶቼ')}
          </h1>
          {messageId && (
            <span className="ml-4 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 
                           text-indigo-700 dark:text-indigo-300 text-sm rounded-full">
              {t('Message opened from notification', 'ከማሳወቂያ የተከፈተ መልእክት')}
            </span>
          )}
        </div>

        {/* Messages List */}
        {messages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('No messages yet', 'ገና ምንም መልእክት የለም')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {user?.isAdmin 
                ? t('No customer messages to display', 'ምንም የደንበኛ መልእክት የለም')
                : t('Send us a message from the contact page', 'ከመገኛ ገጽ መልእክት ይላኩልን')}
            </p>
            {!user?.isAdmin && (
              <button
                onClick={() => onNavigate('contact')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white 
                         rounded-xl transition-all transform hover:scale-105"
              >
                {t('Go to Contact', 'ወደ መገኛ ገጽ ይሂዱ')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const status = getStatusBadge(message);
              const StatusIcon = status.icon;
              return (
                <div
                  key={message._id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md 
                           hover:shadow-xl transition-all duration-300 
                           overflow-hidden border border-gray-100 dark:border-gray-700 
                           cursor-pointer transform hover:-translate-y-1
                           ${!message.isRead && !user?.isAdmin ? 'border-l-4 border-l-indigo-500' : ''}
                           ${message._id === messageId ? 'ring-2 ring-indigo-500 shadow-lg bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                          {user?.isAdmin && (
                            <div className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                              <User className="h-3 w-3 mr-1" />
                              <span className="font-medium">{message.name}</span>
                            </div>
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {message.subject}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.text}
                          </span>
                          {message._id === messageId && (
                            <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                              {t('New', 'አዲስ')}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {message.message}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(message.createdAt)}
                      </div>
                      {user?.isAdmin && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <a href={`mailto:${message.email}`} className="hover:text-indigo-600">
                            {message.email}
                          </a>
                        </div>
                      )}
                      {message.isReplied && (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <Reply className="h-4 w-4 mr-1" />
                          {t('Replied', 'መልስ ተልኳል')}
                        </div>
                      )}
                    </div>

                    {/* Reply Preview */}
                    {message.reply && !user?.isAdmin && (
                      <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                        <div className="flex items-center mb-1">
                          <Reply className="h-3 w-3 text-indigo-600 dark:text-indigo-400 mr-1" />
                          <span className="text-xs font-medium text-indigo-800 dark:text-indigo-300">
                            {t('Admin Reply', 'የአስተዳዳሪ መልስ')}:
                          </span>
                        </div>
                        <p className="text-sm text-indigo-900 dark:text-indigo-200 line-clamp-2">
                          {message.reply}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl 
                          max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              
              <div className="sticky top-0 bg-white dark:bg-gray-800 
                            border-b border-gray-200 dark:border-gray-700 
                            px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('Message Details', 'የመልእክት ዝርዝሮች')}
                </h2>
                <button
                  onClick={handleCloseMessage}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                           dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Message Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {selectedMessage.subject}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>

                {/* Sender Info - Show full details for admins */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedMessage.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedMessage.email}
                        </p>
                      </div>
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedMessage.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Message */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('Message', 'መልእክት')}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {/* Admin Reply - Show existing reply */}
                {selectedMessage.reply && (
                  <div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 
                                mb-2 flex items-center">
                      <Reply className="h-4 w-4 mr-1" />
                      {user?.isAdmin ? t('Your Reply', 'የእርስዎ መልስ') : t('Admin Reply', 'የአስተዳዳሪ መልስ')}
                      {selectedMessage.repliedAt && (
                        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(selectedMessage.repliedAt)}
                        </span>
                      )}
                    </p>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
                      <p className="text-indigo-900 dark:text-indigo-200 whitespace-pre-wrap">
                        {selectedMessage.reply}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reply Form - Only for admins */}
                {user?.isAdmin && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {selectedMessage.isReplied 
                        ? t('Send Additional Reply', 'ተጨማሪ መልስ ይላኩ')
                        : t('Send Reply', 'መልስ ይላኩ')}
                    </p>
                    
                    {/* Success Message */}
                    {replySuccess && (
                      <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 
                                    text-green-700 dark:text-green-300 rounded-xl
                                    flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        {t('Reply sent successfully!', 'መልስ በተሳካ ሁኔታ ተልኳል!')}
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {replyError && (
                      <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 
                                    text-red-700 dark:text-red-300 rounded-xl">
                        {replyError}
                      </div>
                    )}
                    
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t('Type your reply here...', 'መልስዎን እዚህ ይጻፉ...')}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 
                               border border-gray-300 dark:border-gray-600 
                               rounded-xl focus:ring-2 focus:ring-indigo-500 
                               focus:border-transparent dark:text-white"
                    />
                    
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sendingReply}
                        className="flex items-center space-x-2 px-6 py-2 
                                 bg-indigo-600 hover:bg-indigo-700 
                                 text-white rounded-xl transition-all 
                                 transform hover:scale-105 disabled:opacity-50 
                                 disabled:cursor-not-allowed"
                      >
                        {sendingReply ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>{t('Sending...', 'በመላክ ላይ...')}</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>{t('Send Reply', 'መልስ ይላኩ')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Send New Message Button - For customers */}
                {!user?.isAdmin && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Want to send another message?', 'ሌላ መልእክት መላክ ይፈልጋሉ?')}
                    </p>
                    <button
                      onClick={handleSendNewMessage}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 
                               bg-indigo-600 hover:bg-indigo-700 text-white
                               rounded-xl transition-all transform hover:scale-105
                               shadow-md hover:shadow-lg"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span className="font-medium">{t('Send New Message', 'አዲስ መልእክት ይላኩ')}</span>
                    </button>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleCloseMessage}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 
                             text-white rounded-xl transition-all 
                             transform hover:scale-105"
                  >
                    {t('Close', 'ዝጋ')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
