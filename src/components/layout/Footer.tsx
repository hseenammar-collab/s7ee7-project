'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Heart
} from 'lucide-react'

const footerLinks = {
  quickLinks: [
    { href: '/courses', label: 'الكورسات' },
    { href: '/about', label: 'من نحن' },
    { href: '/contact', label: 'تواصل معنا' },
    { href: '/faq', label: 'الأسئلة الشائعة' },
  ],
  support: [
    { href: '/help', label: 'مركز المساعدة' },
    { href: '/privacy', label: 'سياسة الخصوصية' },
    { href: '/terms', label: 'الشروط والأحكام' },
    { href: '/refund', label: 'سياسة الاسترداد' },
  ],
}

const socialLinks = [
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-600' },
  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube', color: 'hover:bg-red-600' },
  { href: 'https://t.me', icon: MessageCircle, label: 'Telegram', color: 'hover:bg-sky-500' },
]

const contactInfo = [
  { icon: Mail, text: 'info@s7ee7.com', href: 'mailto:info@s7ee7.com' },
  { icon: Phone, text: '+964 770 123 4567', href: 'tel:+9647701234567' },
  { icon: MapPin, text: 'بغداد، العراق', href: '#' },
]

export default function Footer() {
  return (
    <footer className="relative bg-[#0a0a0f] text-gray-300 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent" />

      {/* Top Border Glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="relative container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                S7ee7 Academy
              </span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              منصة تعليمية عراقية متخصصة في المهارات الرقمية والتسويق الإلكتروني.
              نساعدك على بناء مستقبلك المهني.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center transition-all ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full" />
              روابط سريعة
            </h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-purple-500 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              الدعم
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-blue-500 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              تواصل معنا
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                  >
                    <span className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <item.icon size={16} className="text-purple-400" />
                    </span>
                    <span dir="ltr">{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">طرق الدفع المتاحة:</span>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium">
                  Zain Cash
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-orange-600/20 to-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-sm font-medium">
                  FIB
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium">
                  بطاقة ائتمان
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-500 text-sm flex items-center gap-1">
            © {new Date().getFullYear()} S7ee7 Academy. جميع الحقوق محفوظة.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            صنع بـ
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            في العراق
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
