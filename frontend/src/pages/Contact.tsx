import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Clock, HelpCircle, CheckCircle, AlertCircle, ChevronRight, MessageSquare, Star, Users, Award, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { contactService } from '../services/contactService';
import { useAuth } from '../context/AuthContext';

interface ContactProps {
  onNavigate: (page: string) => void;
}

export function Contact({ onNavigate }: ContactProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // If user is logged in, use their email and name from auth
    const submitData = {
      ...formData,
      name: user?.fullName || formData.name,
      email: user?.email || formData.email
    };
    
    try {
      await contactService.submitContact(submitData);
      setSubmitted(true);
      setFormData({ name: user?.fullName || '', email: user?.email || '', phone: '', subject: '', message: '' });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error: any) {
      console.error('Error submitting contact:', error);
      setError(error.response?.data?.message || t('Failed to send message. Please try again.', 'መልእክት መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።'));
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: t('Phone', 'ስልክ'),
      details: ['+251 91 123 4567', '+251 92 987 6543'],
      action: 'tel:+251911234567',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: t('Email', 'ኢሜይል'),
      details: ['info@tomshop.com', 'support@tomshop.com'],
      action: 'mailto:info@tomshop.com',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: t('Address', 'አድራሻ'),
      details: [t('Bole, Addis Ababa', 'ቦሌ፣ አዲስ አበባ'), t('Ethiopia', 'ኢትዮጵያ')],
      action: 'https://maps.google.com/?q=Addis+Ababa+Ethiopia',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      gradient: 'from-green-500 to-green-600'
    }
  ];

  const faqs = [
    {
      question: t('How long does delivery take?', 'ማድረስ ምን ያህል ጊዜ ይወስዳል?'),
      answer: t(
        'Delivery typically takes 2-5 business days within Addis Ababa and 5-7 days to other regions.',
        'ማድረስ በአዲስ አበባ ውስጥ በተለምዶ 2-5 የስራ ቀናት እና ወደ ሌሎች ክልሎች 5-7 ቀናት ይወስዳል።'
      )
    },
    {
      question: t('What payment methods do you accept?', 'ምን የክፍያ መንገዶችን ይቀበላሉ?'),
      answer: t(
        'We accept Telebirr, bank transfer, and cash on delivery.',
        'ቴሌብር፣ የባንክ ዝውውር እና በአደራ ላይ ጥሬ ገንዘብ እንቀበላለን።'
      )
    },
    {
      question: t('Can I return a product?', 'ምርት መመለስ እችላለሁ?'),
      answer: t(
        'Yes, we offer a 7-day return policy for most products.',
        'አዎ፣ ለአብዛኛዎቹ ምርቶች የ7 ቀን የመመለሻ ፖሊሲ እናቀርባለን።'
      )
    },
    {
      question: t('Do you ship internationally?', 'ወደ ውጭ አገር ትልካላችሁ?'),
      answer: t(
        'Currently, we only ship within Ethiopia. We are working on international shipping!',
        'በአሁኑ ጊዜ በኢትዮጵያ ውስጥ ብቻ እንልካለን። ወደ ውጭ አገር ለመላክ እየሰራን ነው!'
      )
    }
  ];

  const stats = [
    { label: t('Happy Customers', 'ደስተኛ ደንበኞች'), value: '50k+', icon: Users },
    { label: t('Products', 'ምርቶች'), value: '10k+', icon: Star },
    { label: t('Satisfaction', 'እርካታ'), value: '99%', icon: Award },
    { label: t('Support 24/7', 'ድጋፍ 24/7'), value: '24/7', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-500">
      
      {/* Hero Section - Light mode clean, Dark mode subtle gradient */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950/30">
        {/* Light mode decorative elements - hidden in dark mode */}
        <div className="absolute inset-0 opacity-[0.02] light-mode-only">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-light" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-900"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-light)" />
          </svg>
        </div>
        
        {/* Dark mode decorative elements - hidden in light mode */}
        <div className="absolute inset-0 opacity-10 dark-mode-only">
          <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Badge with animation - light/dark aware */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 border border-indigo-200 dark:border-indigo-800">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('Get in Touch', 'ያግኙን')}
            </div>
            
            {/* Main Heading - light/dark aware */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {t('We\'d Love to', 'እኛ እንወዳለን')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {t('Hear From You', 'ከእርስዎ መስማት')}
              </span>
            </h1>
            
            {/* Description - light/dark aware */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl">
              {t(
                'Have questions? We\'re here to help. Reach out to us anytime and our team will get back to you within 24 hours.',
                'ጥያቄዎች አሉዎት? እኛ ለመርዳት እዚህ ነን። በማንኛውም ጊዜ ያግኙን እና ቡድናችን በ24 ሰዓታት ውስጥ ይመልስልዎታል።'
              )}
            </p>

            {/* Quick Links for Logged-in Users */}
            {user && (
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('my-messages')}
                  className="group px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center gap-2 relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  <MessageSquare className="h-5 w-5" />
                  <span>{t('View My Messages', 'መልእክቶቼን ተመልከት')}</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom gradient transition - light/dark aware */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/50 to-transparent dark:from-slate-950 dark:via-slate-950/50"></div>
      </section>

      {/* Quick Stats Section - light/dark aware */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:scale-110 transition-transform">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 lg:p-10 
                        border border-gray-100 dark:border-gray-700
                        transform hover:scale-[1.02] transition-all duration-500
                        relative overflow-hidden group">
            
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-indigo-600/0 group-hover:from-indigo-600/5 group-hover:to-indigo-600/0 transition-all duration-500"></div>
            
            <div className="relative">
              <div className="mb-8">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-medium mb-4">
                  <Send className="h-3 w-3 mr-1" />
                  {t('Send Message', 'መልእክት ላክ')}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('Send us a Message', 'መልእክት ይላኩልን')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('Fill out the form below and we\'ll get back to you within 24 hours.', 
                     'ከዚህ በታች ያለውን ቅጽ ይሙሉ እና በ24 ሰዓታት ውስጥ እንመልስልዎታለን።')}
                </p>
              </div>

              {/* Success Message */}
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                              rounded-xl flex items-center space-x-3 animate-slideDown">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                      {t('Message Sent!', 'መልእክት ተልኳል!')}
                    </h3>
                    <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                      {t('Thank you for contacting us. We\'ll respond soon.', 
                         'እኛን ስላገኙን እናመሰግናለን። በቅርቡ እንመልሳለን።')}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                              rounded-xl flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Your Name', 'ስምዎ')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={!!user?.fullName}
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                               rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               transition-all duration-300
                               ${user?.fullName ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                      placeholder={t('John Doe', 'ጆን ዶ')}
                    />
                    {user?.fullName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('Using your account name', 'የመለያ ስምዎን በመጠቀም ላይ')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Your Email', 'ኢሜይልዎ')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={!!user?.email}
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                               rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               transition-all duration-300
                               ${user?.email ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                      placeholder="john@example.com"
                    />
                    {user?.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('Using your account email', 'የመለያ ኢሜይልዎን በመጠቀም ላይ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Phone Number', 'ስልክ ቁጥር')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                               rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               transition-all duration-300"
                      placeholder="+251 91 234 5678"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Subject', 'ርዕስ')} *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                               rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               transition-all duration-300"
                      placeholder={t('How can we help?', 'እንዴት መርዳት እንችላለን?')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('Message', 'መልእክት')} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                             rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             transition-all duration-300 resize-none"
                    placeholder={t('Tell us more about your inquiry...', 'ስለጥያቄዎ የበለጠ ይንገሩን...')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 
                           hover:from-indigo-700 hover:to-indigo-800
                           dark:from-indigo-600 dark:to-indigo-700
                           dark:hover:from-indigo-700 dark:hover:to-indigo-800
                           text-white py-4 rounded-xl font-semibold text-lg
                           transition-all duration-500 transform hover:scale-105 
                           disabled:from-gray-400 disabled:to-gray-400 
                           disabled:cursor-not-allowed disabled:transform-none 
                           flex items-center justify-center space-x-3
                           shadow-lg hover:shadow-xl relative overflow-hidden
                           group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>{t('Sending...', 'በመላክ ላይ...')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>{t('Send Message', 'መልእክት ላክ')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Business Hours & FAQ */}
          <div className="space-y-8">
            {/* Business Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 
                          border border-gray-100 dark:border-gray-700
                          transform hover:scale-[1.02] transition-all duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                  <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('Business Hours', 'የስራ ሰዓታት')}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {t('Monday - Friday', 'ሰኞ - አርብ')}
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {t('Saturday', 'ቅዳሜ')}
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {t('Sunday', 'እሁድ')}
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold">10:00 AM - 4:00 PM</span>
                </div>
              </div>

              {/* Message History Link for Logged-in Users */}
              {user && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => onNavigate('my-messages')}
                    className="w-full flex items-center justify-between p-4 
                             bg-indigo-50 dark:bg-indigo-900/20 rounded-xl
                             hover:bg-indigo-100 dark:hover:bg-indigo-900/30
                             transition-colors group"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('View your message history', 'የመልእክት ታሪክዎን ይመልከቱ')}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-600 dark:text-indigo-400 
                                          group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>

            {/* FAQ Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 
                          border border-gray-100 dark:border-gray-700
                          transform hover:scale-[1.02] transition-all duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                  <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('Frequently Asked Questions', 'በተደጋጋሚ የሚጠየቁ ጥያቄዎች')}
                </h3>
              </div>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {faq.question}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-8 text-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <p className="text-indigo-100 text-sm">{t('Support', 'ድጋፍ')}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">30 min</div>
                  <p className="text-indigo-100 text-sm">{t('Response Time', 'የምላሽ ጊዜ')}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">99%</div>
                  <p className="text-indigo-100 text-sm">{t('Satisfaction', 'እርካታ')}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">50k+</div>
                  <p className="text-indigo-100 text-sm">{t('Customers', 'ደንበኞች')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden
                      border border-gray-100 dark:border-gray-700">
          <div className="h-96 relative">
            <iframe
              title="TomShop Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126108.776627146!2d38.703792!3d8.9806034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab9bcd%3A0x73b5e7e92f3f3e3e!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-500"
            ></iframe>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Prefer to Shop Instead?', 'መግዛት ይመርጣሉ?')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            {t('Browse thousands of products with fast delivery', 'በፈጣን ማድረስ በሺዎች የሚቆጠሩ ምርቶችን ያስሱ')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => onNavigate('shop')}
              className="group bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 
                       rounded-xl font-semibold text-lg transition-all duration-500 
                       transform hover:scale-105 hover:shadow-2xl
                       inline-flex items-center space-x-3 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              <span>{t('Continue Shopping', 'ግዢ ይቀጥሉ')}</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {user && (
              <button
                onClick={() => onNavigate('my-messages')}
                className="group bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 
                         border-2 border-indigo-600 dark:border-indigo-400 px-10 py-4 
                         rounded-xl font-semibold text-lg transition-all duration-500 
                         transform hover:scale-105 hover:shadow-2xl
                         inline-flex items-center space-x-3 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-indigo-100 
                               dark:from-indigo-900/20 dark:to-indigo-800/20 -translate-x-full 
                               group-hover:translate-x-full transition-transform duration-1000"></span>
                <MessageSquare className="h-5 w-5" />
                <span>{t('My Messages', 'መልእክቶቼ')}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Add custom CSS for mode-specific visibility */}
      <style>{`
        .light-mode-only {
          display: block;
        }
        .dark-mode-only {
          display: none;
        }
        .dark .light-mode-only {
          display: none;
        }
        .dark .dark-mode-only {
          display: block;
        }
      `}</style>
    </div>
  );
}
