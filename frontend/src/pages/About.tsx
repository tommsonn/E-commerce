import { Users, Target, Award, Heart, Shield, Truck, Star, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import thomasImage from '../assets/tom2.jpg';

interface AboutProps {
  onNavigate: (page: string) => void;
}

export function About({ onNavigate }: AboutProps) {
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  const teamMembers = [
    {
      name: 'Thomas Tesema',
      role: t('Founder & CEO', 'መስራች እና ዋና ስራ አስፈፃሚ'),
      image: thomasImage,
      bio: t('10+ years in e-commerce and retail', 'ከ10+ ዓመታት በኢ-ኮሜርስ እና ችርቻሮ ልምድ')
    },
    {
      name: 'Tigist Haile',
      role: t('Head of Operations', 'የኦፕሬሽን ኃላፊ'),
      image: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: t('Supply chain expert', 'የአቅርቦት ሰንሰለት ባለሙያ')
    },
    {
      name: 'Yonas Desta',
      role: t('Customer Experience Lead', 'የደንበኛ ልምድ መሪ'),
      image: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: t('Dedicated to customer satisfaction', 'ለደንበኛ እርካታ የተሰጠ')
    },
    {
      name: 'Meron Alemu',
      role: t('Marketing Director', 'የማርኬቲንግ ዳይሬክተር'),
      image: 'https://images.pexels.com/photos/3778877/pexels-photo-3778877.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: t('Digital marketing specialist', 'የዲጂታል ማርኬቲንግ ስፔሻሊስት')
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: t('TomShop Founded', 'ቶምሾፕ ተመሠረተ'),
      description: t('Started with a vision to transform Ethiopian e-commerce', 'የኢትዮጵያን ኢ-ኮሜርስ ለመለወጥ በራዕይ ተጀመረ')
    },
    {
      year: '2021',
      title: t('10,000 Customers', '10,000 ደንበኞች'),
      description: t('Reached our first major milestone', 'የመጀመሪያ ትልቅ ክንውናችን ላይ ደረስን')
    },
    {
      year: '2022',
      title: t('Expanded Nationwide', 'በመላ አገሪቱ ተስፋፋ'),
      description: t('Delivery to all major Ethiopian cities', 'ወደ ሁሉም ዋና የኢትዮጵያ ከተሞች ማድረስ ጀመርን')
    },
    {
      year: '2023',
      title: t('50,000+ Happy Customers', '50,000+ ደስተኛ ደንበኞች'),
      description: t('Trusted by thousands across the nation', 'በመላ አገሪቱ በሺዎች የሚቆጠሩ ታማኝ ደንበኞች')
    }
  ];

  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: t('Quality', 'ጥራት'),
      description: t('We ensure all products meet high quality standards', 'ሁሉም ምርቶች ከፍተኛ የጥራት ደረጃ እንዲያሟሉ እናረጋግጣለን')
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('Customer First', 'ደንበኛ መጀመሪያ'),
      description: t('Your satisfaction is our top priority', 'እርካታዎ ቅድሚያ የምንሰጠው ጉዳይ ነው')
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: t('Excellence', 'ልህቀት'),
      description: t('We strive for excellence in everything we do', 'በምንሠራው ሁሉ ልህቀትን እንጥራለን')
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('Integrity', 'ታማኝነት'),
      description: t('We conduct business with honesty and transparency', 'ንግድን በሐቀኝነት እና ግልጽነት እንመራለን')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-500">
      
      {/* Hero Section */}
<section className="relative bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950/30 py-20 sm:py-28 overflow-hidden">
  {/* Decorative Elements */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
  
  {/* Subtle pattern overlay */}
  <div className="absolute inset-0 opacity-[0.02]">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-900 dark:text-white"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
  
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Content */}
      <div className="space-y-6">
        {/* Badge with animation */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium border border-indigo-200 dark:border-indigo-800 animate-pulse">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <Shield className="h-4 w-4 mr-2" />
          {t('About TomShop', 'ስለ ቶምሾፕ')}
        </div>
        
        {/* Main Heading with Gradient */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {t('Your Trusted', 'የታመነ')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {t('Partner', 'አጋር')}
          </span>
          <br />
          {t('in Online Shopping', 'በመስመር ላይ ግዢ')}
        </h1>
        
        {/* Description with improved typography */}
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          {t(
            'We believe in the power of e-commerce to transform lives and create opportunities for everyone in Ethiopia. Our commitment to quality and customer satisfaction drives everything we do.',
            'የኢ-ኮሜርስ ኃይል ሕይወትን ለመቀየር እና በኢትዮጵያ ውስጥ ለሁሉም ሰው እድሎችን ለመፍጠር እንደሚችል እናምናለን። ለጥራት እና ለደንበኛ እርካታ ያለን ቁርጠኝነት በምንሠራው ነገር ሁሉ ይመራናል።'
          )}
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-8 pt-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">50k+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('Happy Customers', 'ደስተኛ ደንበኞች')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">50+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('Cities', 'ከተሞች')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4.9</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('Rating', 'ደረጃ')}</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <button
            onClick={() => onNavigate('shop')}
            className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center gap-2 relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            <span>{t('Start Shopping', 'ግዢ ይጀምሩ')}</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Right Content - Values Preview Cards */}
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative grid grid-cols-2 gap-4">
          {/* Quality Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
              <Target className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('Quality', 'ጥራት')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('Premium products', 'ከፍተኛ ምርቶች')}</p>
          </div>
          
          {/* Customer First Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl mt-8">
            <div className="bg-purple-50 dark:bg-purple-900/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('Customer First', 'ደንበኛ መጀመሪያ')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('24/7 support', '24/7 ድጋፍ')}</p>
          </div>
          
          {/* Excellence Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
            <div className="bg-green-50 dark:bg-green-900/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
              <Award className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('Excellence', 'ልህቀት')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('Best service', 'ምርጥ አገልግሎት')}</p>
          </div>
          
          {/* Integrity Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl mt-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
              <Heart className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('Integrity', 'ታማኝነት')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('Trustworthy', 'ታማኝ')}</p>
          </div>
        </div>
        
        {/* Floating Badge */}
        <div className="absolute -bottom-4 -right-4 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          {t('Since 2020', 'ከ2020')}
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Mission & Vision - Clean cards like product cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <span className="inline-block px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs sm:text-sm font-medium">
              {t('Our Mission', 'ተልዕኮአችን')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t('Connecting Ethiopia Through Commerce', 'ኢትዮጵያን በንግድ ማገናኘት')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {t(
                'TomShop was founded with a simple mission: to make quality products accessible to everyone in Ethiopia. We connect local sellers with buyers across the nation, creating opportunities and building trust.',
                'ቶምሾፕ የተመሰረተው ጥራት ያላቸውን ምርቶች በኢትዮጵያ ውስጥ ላሉ ሁሉ ተደራሽ ለማድረግ በሚል ቀላል ተልዕኮ ነው። የሀገር ውስጥ ሻጮችን ከገዢዎች ጋር በማገናኘት እድሎችን እንፈጥራለን እና መተማመንን እንገነባለን።'
              )}
            </p>
            
            <div className="flex gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                  <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">50+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('Cities', 'ከተሞች')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">50k+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('Customers', 'ደንበኞች')}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Ethiopian marketplace"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                  <Star className="h-5 w-5 text-indigo-600 dark:text-indigo-400 fill-current" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">4.9</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('Customer Rating', 'የደንበኛ ደረጃ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Core Values - Product card style with Preview Cards Design */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
  <div className="text-center mb-12">
    <span className="inline-block px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs sm:text-sm font-medium mb-4">
      {t('Our Core Values', 'ዋና እሴቶቻችን')}
    </span>
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
      {t('What Drives Us', 'የሚያንቀሳቅሰን')}
    </h2>
    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
      {t('The principles that guide everything we do', 'እኛ የምንሰራውን ሁሉ የሚመሩ መርሆች')}
    </p>
  </div>

  {/* Core Values Cards with Preview Design */}
  <div className="relative">
    {/* Background gradient effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl blur-3xl"></div>
    
    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Quality Card */}
      <div className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          <Target className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {t('Quality', 'ጥራት')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {t('We ensure all products meet high quality standards', 'ሁሉም ምርቶች ከፍተኛ የጥራት ደረጃ እንዲያሟሉ እናረጋግጣለን')}
        </p>
      </div>
      
      {/* Customer First Card */}
      <div className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl lg:mt-8">
        <div className="bg-purple-50 dark:bg-purple-900/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          <Users className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {t('Customer First', 'ደንበኛ መጀመሪያ')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {t('Your satisfaction is our top priority', 'እርካታዎ ቅድሚያ የምንሰጠው ጉዳይ ነው')}
        </p>
      </div>
      
      {/* Excellence Card */}
      <div className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
        <div className="bg-green-50 dark:bg-green-900/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-green-600 dark:text-green-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          <Award className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          {t('Excellence', 'ልህቀት')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {t('We strive for excellence in everything we do', 'በምንሠራው ሁሉ ልህቀትን እንጥራለን')}
        </p>
      </div>
      
      {/* Integrity Card */}
      <div className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl lg:mt-8">
        <div className="bg-amber-50 dark:bg-amber-900/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          <Heart className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {t('Integrity', 'ታማኝነት')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {t('We conduct business with honesty and transparency', 'ንግድን በሐቀኝነት እና ግልጽነት እንመራለን')}
        </p>
      </div>
    </div>
    
    {/* Floating decoration */}
    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-2xl"></div>
    <div className="absolute -top-4 -left-4 w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-2xl"></div>
  </div>
</section>

      {/* Milestones - Clean timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs sm:text-sm font-medium mb-4">
            {t('Our Journey', 'ጉዟችን')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Key Milestones', 'ዋና ዋና ክንውኖች')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('How we grew to become Ethiopia\'s trusted marketplace', 'እንዴት የኢትዮጵያ ታማኝ የገበያ ቦታ ለመሆን እንደበቃን')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-xl 
                       transition-all duration-500 transform hover:-translate-y-1
                       border border-gray-100 dark:border-gray-700"
            >
              <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium mb-4">
                {milestone.year}
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {milestone.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {milestone.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section - Product card style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs sm:text-sm font-medium mb-4">
            {t('Our Team', 'ቡድናችን')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Meet the People Behind TomShop', 'ከቶምሾፕ በስተጀርባ ያሉ ሰዎችን ይወቁ')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('Dedicated professionals working to serve you better', 'እርስዎን በተሻለ ለማገልገል የሚሰሩ ቁርጠኛ ባለሙያዎች')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl 
                       transition-all duration-500 transform hover:-translate-y-1 hover:scale-105
                       overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                  {member.name}
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section - Clean stats like home page */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                50,000+
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('Happy Customers', 'ደስተኛ ደንበኞች')}</p>
              <div className="w-12 h-1 bg-indigo-200 dark:bg-indigo-800 mx-auto mt-3 rounded-full group-hover:w-16 transition-all"></div>
            </div>
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                10,000+
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('Products', 'ምርቶች')}</p>
              <div className="w-12 h-1 bg-indigo-200 dark:bg-indigo-800 mx-auto mt-3 rounded-full group-hover:w-16 transition-all"></div>
            </div>
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                99%
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('Satisfaction Rate', 'የእርካታ መጠን')}</p>
              <div className="w-12 h-1 bg-indigo-200 dark:bg-indigo-800 mx-auto mt-3 rounded-full group-hover:w-16 transition-all"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Simple like home page */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Ready to Start Shopping?', 'ለመግዛት ዝግጁ ነዎት?')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('Join thousands of happy customers and experience the best online shopping in Ethiopia', 
               'ከሺዎች ደስተኛ ደንበኞች ጋር ይቀላቀሉ እና በኢትዮጵያ ምርጥ የመስመር ላይ ግብይት ይለማመዱ')}
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center gap-2 group"
          >
            <span>{t('Shop Now', 'አሁን ግዙ')}</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}
