import { Users, Target, Award, Heart, Shield, Truck, Clock, Star, ChevronRight } from 'lucide-react';
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
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-indigo-100 text-sm font-medium mb-8 border border-white/20">
              <Shield className="h-4 w-4 mr-2 text-indigo-300" />
              {t('About TomShop', 'ስለ ቶምሾፕ')}
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-blue-200">
                {t('Your Trusted Partner in Online Shopping', 'በመስመር ላይ ግዢ የታመነ አጋርዎ')}
              </span>
            </h1>
            
            <p className="text-xl text-indigo-100 mb-10 leading-relaxed max-w-2xl">
              {t(
                'We believe in the power of e-commerce to transform lives and create opportunities for everyone in Ethiopia.',
                'የኢ-ኮሜርስ ኃይል ሕይወትን ለመቀየር እና በኢትዮጵያ ውስጥ ለሁሉም ሰው እድሎችን ለመፍጠር እንደሚችል እናምናለን።'
              )}
            </p>
            
            <button
              onClick={() => onNavigate('shop')}
              className="group bg-white text-indigo-900 px-8 py-4 rounded-xl font-semibold 
                       hover:bg-indigo-50 transition-all duration-500 transform hover:scale-105 
                       hover:shadow-2xl flex items-center space-x-3 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-200/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              <span>{t('Start Shopping', 'ግዢ ይጀምሩ')}</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/50 to-transparent dark:from-slate-950 dark:via-slate-950/50"></div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-medium">
              {t('Our Mission', 'ተልዕኮአችን')}
            </span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              {t('Connecting Ethiopia Through Commerce', 'ኢትዮጵያን በንግድ ማገናኘት')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {t(
                'TomShop was founded with a simple mission: to make quality products accessible to everyone in Ethiopia. We connect local sellers with buyers across the nation, creating opportunities and building trust.',
                'ቶምሾፕ የተመሰረተው ጥራት ያላቸውን ምርቶች በኢትዮጵያ ውስጥ ላሉ ሁሉ ተደራሽ ለማድረግ በሚል ቀላል ተልዕኮ ነው። የሀገር ውስጥ ሻጮችን ከገዢዎች ጋር በማገናኘት እድሎችን እንፈጥራለን እና መተማመንን እንገነባለን።'
              )}
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                  <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">50+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('Cities', 'ከተሞች')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">50k+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('Customers', 'ደንበኞች')}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Ethiopian marketplace"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                  <Star className="h-6 w-6 text-indigo-600 dark:text-indigo-400 fill-current" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">4.9</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('Customer Rating', 'የደንበኛ ደረጃ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-medium mb-4">
            {t('Our Core Values', 'ዋና እሴቶቻችን')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('What Drives Us', 'የሚያንቀሳቅሰን')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('The principles that guide everything we do', 'እኛ የምንሰራውን ሁሉ የሚመሩ መርሆች')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg 
                       hover:shadow-2xl transition-all duration-500 
                       transform hover:-translate-y-2 hover:scale-105
                       border border-gray-100 dark:border-gray-700
                       relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-indigo-600/0 
                            group-hover:from-indigo-600/5 group-hover:to-indigo-600/0 
                            transition-all duration-500"></div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 
                              dark:from-indigo-900/30 dark:to-indigo-800/30 
                              w-16 h-16 rounded-2xl flex items-center justify-center 
                              mb-6 group-hover:scale-110 group-hover:rotate-3 
                              transition-all duration-500 text-indigo-600 dark:text-indigo-400">
                  {value.icon}
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white 
                             group-hover:text-indigo-600 dark:group-hover:text-indigo-400 
                             transition-colors">
                  {value.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones/Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-medium mb-4">
            {t('Our Journey', 'ጉዟችን')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Key Milestones', 'ዋና ዋና ክንውኖች')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('How we grew to become Ethiopia\'s trusted marketplace', 'እንዴት የኢትዮጵያ ታማኝ የገበያ ቦታ ለመሆን እንደበቃን')}
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-indigo-200 to-indigo-600 dark:from-indigo-800 dark:to-indigo-400 rounded-full"></div>
          
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className="w-1/2"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg z-10"></div>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium mb-3">
                      {milestone.year}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-medium mb-4">
            {t('Our Team', 'ቡድናችን')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Meet the People Behind TomShop', 'ከቶምሾፕ በስተጀርባ ያሉ ሰዎችን ይወቁ')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('Dedicated professionals working to serve you better', 'እርስዎን በተሻለ ለማገልገል የሚሰሩ ቁርጠኛ ባለሙያዎች')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg 
                       hover:shadow-2xl transition-all duration-500 
                       transform hover:-translate-y-2 overflow-hidden
                       border border-gray-100 dark:border-gray-700"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 dark:from-slate-900 dark:to-indigo-950 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform">50,000+</div>
              <p className="text-indigo-200 text-lg">{t('Happy Customers', 'ደስተኛ ደንበኞች')}</p>
              <div className="w-16 h-1 bg-indigo-400 mx-auto mt-4 rounded-full group-hover:w-24 transition-all"></div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform">10,000+</div>
              <p className="text-indigo-200 text-lg">{t('Products', 'ምርቶች')}</p>
              <div className="w-16 h-1 bg-indigo-400 mx-auto mt-4 rounded-full group-hover:w-24 transition-all"></div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform">99%</div>
              <p className="text-indigo-200 text-lg">{t('Satisfaction Rate', 'የእርካታ መጠን')}</p>
              <div className="w-16 h-1 bg-indigo-400 mx-auto mt-4 rounded-full group-hover:w-24 transition-all"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t('Ready to Start Shopping?', 'ለመግዛት ዝግጁ ነዎት?')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            {t('Join thousands of happy customers and experience the best online shopping in Ethiopia', 
               'ከሺዎች ደስተኛ ደንበኞች ጋር ይቀላቀሉ እና በኢትዮጵያ ምርጥ የመስመር ላይ ግብይት ይለማመዱ')}
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="group bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 
                     rounded-xl font-semibold text-lg transition-all duration-500 
                     transform hover:scale-105 hover:shadow-2xl
                     inline-flex items-center space-x-3 relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            <span>{t('Shop Now', 'አሁን ግዙ')}</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}