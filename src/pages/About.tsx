import { Users, Target, Award, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('About EthioShop', 'ስለ ኢትዮሾፕ')}
          </h1>
          <p className="text-xl text-green-100">
            {t('Your trusted partner in online shopping', 'በመስመር ላይ ግዢ ላይ የተማመነ አጋርዎ')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img
              src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="About us"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('Who We Are', 'እኛ ማን ነን')}
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {t(
                'EthioShop is Ethiopia\'s premier online marketplace, connecting thousands of buyers and sellers across the country. Since our founding, we\'ve been committed to making quality products accessible to everyone, everywhere in Ethiopia.',
                'ኢትዮሾፕ በኢትዮጵያ ውስጥ ዋነኛ የመስመር ላይ ገበያ ሲሆን በሺዎች የሚቆጠሩ ገዥዎችና ሻጮችን ያገናኛል። ከመመስረታችን ጀምሮ የጥራት ምርቶችን ለሁሉም፣ በኢትዮጵያ ውስጥ በየትኛውም ቦታ ተደራሽ ለማድረግ ቁርጠኞች ሆነናል።'
              )}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {t(
                'We believe in the power of e-commerce to transform lives and create opportunities. Our platform serves as a bridge between quality products and customers who need them, while supporting local businesses and entrepreneurs.',
                'የኢ-ኮሜርስ ኃይል ህይወትን ለመቀየር እና እድሎችን ለመፍጠር እንደሚችል እናምናለን። የእኛ መድረክ በጥራት ምርቶች እና የሚፈልጓቸው ደንበኞች መካከል እንደ ድልድይ ሲያገለግል፣ የሀገር ውስጥ ንግዶችንና ሥራ ፈጣሪዎችን ይደግፋል።'
              )}
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('Our Core Values', 'የእኛ ዋና እሴቶች')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('Quality', 'ጥራት')}</h3>
              <p className="text-gray-600 text-sm">
                {t('We ensure all products meet high quality standards', 'ሁሉም ምርቶች ከፍተኛ የጥራት ደረጃን እንዲያሟሉ እናደርጋለን')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('Customer First', 'ደንበኛ መጀመሪያ')}</h3>
              <p className="text-gray-600 text-sm">
                {t('Your satisfaction is our top priority', 'እርካታዎ የእኛ ቅድሚያ ነው')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('Excellence', 'እውቀት')}</h3>
              <p className="text-gray-600 text-sm">
                {t('We strive for excellence in everything we do', 'በምናደርገው ሁሉ ለክብር እንጥራለን')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('Integrity', 'ታማኝነት')}</h3>
              <p className="text-gray-600 text-sm">
                {t('We conduct business with honesty and transparency', 'ንግድ በታማኝነት እና በግልፅነት እናከናውናለን')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('Join Thousands of Happy Customers', 'በሺዎች ከሚቆጠሩ ደስተኛ ደንበኞች ጋር ይቀላቀሉ')}
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            {t(
              'Experience the best online shopping in Ethiopia',
              'በኢትዮጵያ ውስጥ ምርጡን የመስመር ላይ ግዢ ይለማመዱ'
            )}
          </p>
          <div className="flex justify-center space-x-12">
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <p className="text-green-100">{t('Happy Customers', 'ደስተኛ ደንበኞች')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <p className="text-green-100">{t('Products', 'ምርቶች')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <p className="text-green-100">{t('Satisfaction', 'እርካታ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
