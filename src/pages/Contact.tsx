import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('Contact Us', 'አግኙን')}
          </h1>
          <p className="text-xl text-green-100">
            {t('We\'d love to hear from you', 'ከእርስዎ መስማት እንፈልጋለን')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t('Phone', 'ስልክ')}</h3>
            <p className="text-gray-600">+251 91 123 4567</p>
            <p className="text-gray-600">+251 92 987 6543</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t('Email', 'ኢሜይል')}</h3>
            <p className="text-gray-600">info@ethioshop.com</p>
            <p className="text-gray-600">support@ethioshop.com</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t('Address', 'አድራሻ')}</h3>
            <p className="text-gray-600">{t('Bole, Addis Ababa', 'ቦሌ፣ አዲስ አበባ')}</p>
            <p className="text-gray-600">{t('Ethiopia', 'ኢትዮጵያ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('Send us a Message', 'መልእክት ይላኩልን')}
            </h2>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                {t('Thank you! Your message has been sent successfully.', 'እናመሰግናለን! መልእክትዎ በተሳካ ሁኔታ ተልኳል።')}
              </div>
            ) : null}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Name', 'ስም')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Email', 'ኢሜይል')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Phone', 'ስልክ')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Subject', 'ጉዳይ')} *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Message', 'መልእክት')} *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>{t('Send Message', 'መልእክት ላክ')}</span>
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('Business Hours', 'የስራ ሰዓታት')}
              </h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>{t('Monday - Friday:', 'ሰኞ - አርብ:')}</span>
                  <span className="font-medium">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('Saturday:', 'ቅዳሜ:')}</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('Sunday:', 'እሁድ:')}</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('FAQ', 'ተደጋጋሚ ጥያቄዎች')}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('How long does delivery take?', 'ማድረስ ምን ያህል ጊዜ ይወስዳል?')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {t('Delivery typically takes 2-5 business days within Addis Ababa and 5-7 days to other regions.', 'ማድረስ በአዲስ አበባ ውስጥ በተለምዶ 2-5 የስራ ቀናት እና ወደ ሌሎች ክልሎች 5-7 ቀናት ይወስዳል።')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('What payment methods do you accept?', 'ምን የክፍያ መንገዶችን ይቀበላሉ?')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {t('We accept Telebirr, bank transfer, and cash on delivery.', 'ቴሌብር፣ የባንክ ዝውውር እና በአደራ ላይ ጥሬ ገንዘብ እንቀበላለን።')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('Can I return a product?', 'ምርት መመለስ እችላለሁ?')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {t('Yes, we offer a 7-day return policy for most products.', 'አዎ፣ ለአብዛኛዎቹ ምርቶች የ7 ቀን የመመለሻ ፖሊሲ እናቀርባለን።')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
