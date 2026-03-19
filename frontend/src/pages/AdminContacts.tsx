import { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Reply,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Send,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { contactService, ContactMessage, ContactStats } from '../services/contactService';
import { useAuth } from '../context/AuthContext';

interface AdminContactsProps {
  onNavigate: (page: string) => void;
}

export function AdminContacts({ onNavigate }: AdminContactsProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    unread: 0,
    replied: 0,
    today: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [replyError, setReplyError] = useState('');

  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [currentPage, filterStatus, searchQuery]);

const fetchMessages = async () => {
  try {
    setLoading(true);
    const data = await contactService.getContactMessages({
      page: currentPage,
      limit: 10,
      isRead: filterStatus === 'unread' ? false : undefined,
      isReplied: filterStatus === 'replied' ? true : undefined,
      search: searchQuery || undefined
    });
    setMessages(data.messages);
    setTotalPages(data.pages);
    setTotal(data.total);
  } catch (error) {
    console.error('Error fetching messages:', error);
  } finally {
    setLoading(false);
  }
};

  const fetchStats = async () => {
    try {
      const data = await contactService.getContactStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
    fetchStats();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await contactService.markAsRead(id);
      fetchMessages();
      fetchStats();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    try {
      setReplying(true);
      setReplyError('');
      
      await contactService.replyToMessage(selectedMessage._id, replyText);
      
      // Update the message in the list
      setMessages(prev => 
        prev.map(msg => 
          msg._id === selectedMessage._id 
            ? { ...msg, reply: replyText, isReplied: true, repliedAt: new Date().toISOString() } 
            : msg
        )
      );
      
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 3000);
      
      setShowReplyModal(false);
      setReplyText('');
      setSelectedMessage(null);
      
      // Refresh data
      fetchMessages();
      fetchStats();
    } catch (error) {
      console.error('Error sending reply:', error);
      setReplyError(t('Failed to send reply', 'መልስ መላክ አልተሳካም'));
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('Are you sure you want to delete this message?', 'ይህን መልእክት መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት?'))) {
      return;
    }
    
    try {
      await contactService.deleteMessage(id);
      fetchMessages();
      fetchStats();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert(t('Failed to delete message', 'መልእክት መሰረዝ አልተሳካም'));
    }
  };

  const getStatusBadge = (message: ContactMessage) => {
    if (message.isReplied) {
      return {
        text: t('Replied', 'መልስ ተልኳል'),
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      };
    } else if (message.isRead) {
      return {
        text: t('Read', 'ተነቧል'),
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      };
    } else {
      return {
        text: t('Unread', 'ያልተነበበ'),
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      };
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

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
            {t('Contact Messages', 'የመገኛ መልእክቶች')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('Manage customer inquiries and feedback', 'የደንበኛ ጥያቄዎችን እና አስተያየቶችን ያስተዳድሩ')}
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 
                   dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 
                   rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('Refresh', 'አድስ')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('Total', 'ጠቅላላ')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
              <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('Unread', 'ያልተነበበ')}
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.unread}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('Replied', 'መልስ የተላከለት')}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.replied}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <Reply className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('Today', 'ዛሬ')}
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.today}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 
                    border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('Search by name or email...', 'በስም ወይም በኢሜይል ፈልግ...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                       rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('All Messages', 'ሁሉም መልእክቶች')}</option>
            <option value="unread">{t('Unread Only', 'ያልተነበቡ ብቻ')}</option>
            <option value="read">{t('Read Only', 'የተነበቡ ብቻ')}</option>
            <option value="replied">{t('Replied Only', 'መልስ የተላከላቸው ብቻ')}</option>
          </select>

          {/* Total count */}
          <div className="flex items-center justify-end">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'am'
                ? `${messages.length} ከ ${total} እየታዩ ነው`
                : `Showing ${messages.length} of ${total} messages`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden
                    border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Status', 'ሁኔታ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('From', 'ላኪ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Subject', 'ርዕስ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Received', 'የደረሰበት')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Actions', 'እርምጃዎች')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {messages && messages.length > 0 ? (
                messages.map((message) => {
                  const status = getStatusBadge(message);
                  return (
                    <tr 
                      key={message._id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer
                        ${!message.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.isRead) {
                          handleMarkAsRead(message._id);
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 
                                      rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {message.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {message.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {message.subject}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {message.message.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(message.createdAt)}
                        </div>
                        {message.phone && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {message.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                          {!message.isReplied && (
                            <button
                              onClick={() => {
                                setSelectedMessage(message);
                                setShowReplyModal(true);
                              }}
                              className="p-1 text-indigo-600 hover:text-indigo-700 
                                       dark:text-indigo-400 dark:hover:text-indigo-300
                                       hover:bg-indigo-50 dark:hover:bg-indigo-900/20 
                                       rounded-lg transition-colors"
                              title={t('Reply', 'መልስ')}
                            >
                              <Reply className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(message._id)}
                            className="p-1 text-red-600 hover:text-red-700 
                                     dark:text-red-400 dark:hover:text-red-300
                                     hover:bg-red-50 dark:hover:bg-red-900/20 
                                     rounded-lg transition-colors"
                            title={t('Delete', 'ሰርዝ')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {t('No messages found', 'ምንም መልእክቶች አልተገኙም')}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 
                        flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 
                       text-gray-700 dark:text-gray-300 disabled:opacity-50 
                       disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {language === 'am'
                ? `ገጽ ${currentPage} ከ ${totalPages}`
                : `Page ${currentPage} of ${totalPages}`
              }
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 
                       text-gray-700 dark:text-gray-300 disabled:opacity-50 
                       disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && !showReplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto
                        border border-gray-100 dark:border-gray-700">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 
                          px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('Message Details', 'የመልእክት ዝርዝሮች')}
              </h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Sender Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('Name', 'ስም')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('Email', 'ኢሜይል')}</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('Phone', 'ስልክ')}</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('Date', 'ቀን')}</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('Subject', 'ርዕስ')}</p>
                <p className="text-base font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                  {selectedMessage.subject}
                </p>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('Message', 'መልእክት')}</p>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Reply if exists */}
              {selectedMessage.reply && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Reply className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                      {t('Your Reply', 'የእርስዎ መልስ')}
                    </p>
                    {selectedMessage.repliedAt && (
                      <span className="ml-auto text-xs text-indigo-600 dark:text-indigo-400">
                        {formatDate(selectedMessage.repliedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-indigo-900 dark:text-indigo-200">
                    {selectedMessage.reply}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {!selectedMessage.isReplied && (
                  <button
                    onClick={() => {
                      setShowReplyModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white 
                             rounded-xl transition-all transform hover:scale-105
                             flex items-center space-x-2"
                  >
                    <Reply className="h-4 w-4" />
                    <span>{t('Reply', 'መልስ')}</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-xl text-gray-700 dark:text-gray-300 
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('Close', 'ዝጋ')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full
                        border border-gray-100 dark:border-gray-700">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 
                          px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'am'
                  ? `ለ${selectedMessage.name} መልስ ላክ`
                  : `Reply to ${selectedMessage.name}`
                }
              </h2>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setReplyError('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Success Message */}
              {replySuccess && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('Reply sent successfully!', 'መልስ በተሳካ ሁኔታ ተልኳል!')}
                </div>
              )}

              {/* Error Message */}
              {replyError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {replyError}
                </div>
              )}

              {/* Original Message Preview */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('Original Message', 'ዋናው መልእክት')}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Reply Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Your Reply', 'መልስዎ')} *
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  placeholder={t('Type your reply here...', 'መልስዎን እዚህ ይጻፉ...')}
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyText('');
                    setReplyError('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-xl text-gray-700 dark:text-gray-300 
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('Cancel', 'ሰርዝ')}
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || replying}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white 
                           rounded-xl transition-all transform hover:scale-105
                           disabled:bg-gray-400 disabled:cursor-not-allowed 
                           disabled:transform-none flex items-center space-x-2"
                >
                  {replying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 
                                    border-2 border-white border-t-transparent"></div>
                      <span>{t('Sending...', 'በመላክ ላይ...')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{t('Send Reply', 'መልስ ላክ')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
