/**
 * @license
 * Dynamic Exam Management System for Our Reading Room (আমাদের স্টাডি রুম)
 * Bengali Medical & Engineering Prep Exam Portal
 */

(function () {
  'use strict';

  let _openLeaderboardFilterModalImpl = null;
  window.openLeaderboardFilterModal = function() {
    if (typeof _openLeaderboardFilterModalImpl === 'function') {
      return _openLeaderboardFilterModalImpl.apply(this, arguments);
    }
  };

  function escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toBn(val) {
    const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(val == null ? '' : val).replace(/[0-9]/g, (d) => map[Number(d)]);
  }

  // 1. Predefined Subjects matching reference image gradients & titles
  const DEFAULT_SUBJECTS = [
    // --- HSC SUBJECTS ---
    {
      id: 'phy1',
      category: 'HSC',
      titleBn: 'পদার্থবিজ্ঞান ১ম পত্র',
      titleEn: 'Physics 1st Paper',
      tag: 'এইচএসসি ও ভর্তি পরীক্ষা',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
      chapters: [
        { id: 'phy1_ch1', num: 1, name: 'ভৌত জগৎ ও পরিমাপ', icon: '🔬' },
        { id: 'phy1_ch2', num: 2, name: 'ভেক্টর', icon: '➡️' },
        { id: 'phy1_ch3', num: 3, name: 'গতিবিদ্যা', icon: '🏎️' },
        { id: 'phy1_ch4', num: 4, name: 'নিউটনীয় বলবিদ্যা', icon: '🍎' },
        { id: 'phy1_ch5', num: 5, name: 'কাজ, শক্তি ও ক্ষমতা', icon: '⚡' },
        { id: 'phy1_ch8', num: 8, name: 'পর্যায়বৃত্ত গতি', icon: '🔄' }
      ]
    },
    {
      id: 'phy2',
      category: 'HSC',
      titleBn: 'পদার্থবিজ্ঞান ২য় পত্র',
      titleEn: 'Physics 2nd Paper',
      tag: 'এইচএসসি ও ভর্তি পরীক্ষা',
      gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)',
      chapters: [
        { id: 'phy2_ch1', num: 1, name: 'তাপগতিবিদ্যা', icon: '🔥' },
        { id: 'phy2_ch2', num: 2, name: 'স্থির তড়িৎ', icon: '⚡' },
        { id: 'phy2_ch3', num: 3, name: 'চল তড়িৎ', icon: '💡' },
        { id: 'phy2_ch7', num: 7, name: 'ভৌত আলোকবিজ্ঞান', icon: '🌈' },
        { id: 'phy2_ch8', num: 8, name: 'আধুনিক পদার্থবিজ্ঞান', icon: '⚛️' }
      ]
    },
    {
      id: 'chem1',
      category: 'HSC',
      titleBn: 'রসায়ন ১ম পত্র',
      titleEn: 'Chemistry 1st Paper',
      tag: 'মেডিকেল ও ভার্সিটি',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
      chapters: [
        { id: 'chem1_ch1', num: 1, name: 'ল্যাবরেটরির নিরাপদ ব্যবহার', icon: '🧪' },
        { id: 'chem1_ch2', num: 2, name: 'গুণগত রসায়ন', icon: '⚗️' },
        { id: 'chem1_ch3', num: 3, name: 'মৌলের পর্যায়বৃত্ত ধর্ম', icon: '📊' },
        { id: 'chem1_ch4', num: 4, name: 'রাসায়নিক পরিবর্তন', icon: '💥' }
      ]
    },
    {
      id: 'chem2',
      category: 'HSC',
      titleBn: 'রসায়ন ২য় পত্র',
      titleEn: 'Chemistry 2nd Paper',
      tag: 'মেডিকেল ও ভার্সিটি',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #1d4ed8 100%)',
      chapters: [
        { id: 'chem2_ch1', num: 1, name: 'পরিবেশ রসায়ন', icon: '🌍' },
        { id: 'chem2_ch2', num: 2, name: 'জৈব রসায়ন', icon: '🧬' },
        { id: 'chem2_ch3', num: 3, name: 'পরিমাণগত রসায়ন', icon: '⚖️' },
        { id: 'chem2_ch4', num: 4, name: 'তড়িৎ রসায়ন', icon: '🔋' },
        { id: 'chem2_ch5', num: 5, name: 'অর্থনৈতিক রসায়ন', icon: '🏭' }
      ]
    },
    {
      id: 'math1',
      category: 'HSC',
      titleBn: 'উচ্চতর গণিত ১ম পত্র',
      titleEn: 'Higher Math 1st Paper',
      tag: 'ইঞ্জিনিয়ারিং ও প্রযুক্তি',
      gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)',
      chapters: [
        { id: 'math1_ch1', num: 1, name: 'ম্যাট্রিক্স ও নির্ণায়ক', icon: '📐' },
        { id: 'math1_ch3', num: 3, name: 'সরলরেখা', icon: '📏' },
        { id: 'math1_ch4', num: 4, name: 'বৃত্ত', icon: '⭕' },
        { id: 'math1_ch7', num: 7, name: 'সংযুক্ত কোণের ত্রিকোণমিতি', icon: '📈' },
        { id: 'math1_ch9', num: 9, name: 'অন্তরীকরণ', icon: '∫' }
      ]
    },
    {
      id: 'math2',
      category: 'HSC',
      titleBn: 'উচ্চতর গণিত ২য় পত্র',
      titleEn: 'Higher Math 2nd Paper',
      tag: 'ইঞ্জিনিয়ারিং ও প্রযুক্তি',
      gradient: 'linear-gradient(135deg, #ca8a04 0%, #a16207 50%, #854d0e 100%)',
      chapters: [
        { id: 'math2_ch1', num: 1, name: 'বাস্তব সংখ্যা ও অসমতা', icon: '🔢' },
        { id: 'math2_ch3', num: 3, name: 'জটিল সংখ্যা', icon: 'ℹ️' },
        { id: 'math2_ch4', num: 4, name: 'বহুপদী ও বহুপদী সমীকরণ', icon: '📊' },
        { id: 'math2_ch6', num: 6, name: 'কনিক্স', icon: '🪐' },
        { id: 'math2_ch7', num: 7, name: 'বিপরীত ত্রিকোণমিতিক ফাংশন', icon: '🔄' }
      ]
    },
    {
      id: 'bio1',
      category: 'HSC',
      titleBn: 'জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)',
      titleEn: 'Biology 1st Paper',
      tag: 'মেডিকেল ড্রিমার্স',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
      chapters: [
        { id: 'bio1_ch1', num: 1, name: 'কোষ ও এর গঠন', icon: '🔬' },
        { id: 'bio1_ch2', num: 2, name: 'কোষ বিভাজন', icon: '🧬' },
        { id: 'bio1_ch4', num: 4, name: 'অণুজীব', icon: '🦠' },
        { id: 'bio1_ch9', num: 9, name: 'উদ্ভিদ শারীরতত্ত্ব', icon: '🌿' },
        { id: 'bio1_ch11', num: 11, name: 'জীবপ্রযুক্তি', icon: '🧪' }
      ]
    },
    {
      id: 'bio2',
      category: 'HSC',
      titleBn: 'জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)',
      titleEn: 'Biology 2nd Paper',
      tag: 'মেডিকেল ড্রিমার্স',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
      chapters: [
        { id: 'bio2_ch1', num: 1, name: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস', icon: '🦁' },
        { id: 'bio2_ch2', num: 2, name: 'প্রাণীর পরিচিতি (হাইড্রা, ঘাসফড়িং, রুই মাছ)', icon: '🐟' },
        { id: 'bio2_ch3', num: 3, name: 'পরিপাক ও শোষণ', icon: '🍔' },
        { id: 'bio2_ch4', num: 4, name: 'রক্ত ও সংবহন', icon: '🩸' },
        { id: 'bio2_ch5', num: 5, name: 'শ্বসন ও শ্বাসক্রিয়া', icon: '🫁' },
        { id: 'bio2_ch11', num: 11, name: 'জিনতত্ত্ব ও বিবর্তন', icon: '🧬' }
      ]
    },
    {
      id: 'eng',
      category: 'HSC',
      titleBn: 'ইংরেজি (English)',
      titleEn: 'English',
      tag: 'সকল শাখা ও ভর্তি পরীক্ষা',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
      chapters: [
        { id: 'eng_ch1', num: 1, name: 'Parts of Speech & Identification', icon: '📝' },
        { id: 'eng_ch2', num: 2, name: 'Right Form of Verbs & Subject-Verb Agreement', icon: '✍️' },
        { id: 'eng_ch3', num: 3, name: 'Preposition & Idioms', icon: '📖' },
        { id: 'eng_ch4', num: 4, name: 'Vocabulary & Synonyms/Antonyms', icon: '🔤' }
      ]
    },
    {
      id: 'gk',
      category: 'HSC',
      titleBn: 'সাধারণ জ্ঞান (General Knowledge)',
      titleEn: 'General Knowledge',
      tag: 'বাংলাদেশ ও আন্তর্জাতিক',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
      chapters: [
        { id: 'gk_ch1', num: 1, name: 'প্রাচীন বাংলা ও স্বাধীনতা সংগ্রাম', icon: '🇧🇩' },
        { id: 'gk_ch2', num: 2, name: '১৯৭১ এর মুক্তিযুদ্ধ ও সেক্টর', icon: '⚔️' },
        { id: 'gk_ch3', num: 3, name: 'বাংলাদেশের সংবিধান ও সরকার ব্যবস্থা', icon: '📜' },
        { id: 'gk_ch4', num: 4, name: 'সাম্প্রতিক বাংলাদেশ ও বিশ্ব', icon: '🌐' }
      ]
    },
    {
      id: 'ict',
      category: 'HSC',
      titleBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',
      titleEn: 'ICT',
      tag: 'এইচএসসি ও ভর্তি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 40%, #1e1b4b 100%)',
      chapters: [
        { id: 'ict_ch1', num: 1, name: 'তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত', icon: '💻' },
        { id: 'ict_ch2', num: 2, name: 'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং', icon: '📡' },
        { id: 'ict_ch3', num: 3, name: 'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', icon: '🔢' },
        { id: 'ict_ch4', num: 4, name: 'ওয়েব ডিজাইন পরিচিতি ও HTML', icon: '🌐' },
        { id: 'ict_ch5', num: 5, name: 'প্রোগ্রামিং ভাষা (C Programming)', icon: '👨‍💻' }
      ]
    },
    {
      id: 'bangla1',
      category: 'HSC',
      titleBn: 'বাংলা ১ম পত্র',
      titleEn: 'Bangla 1st Paper',
      tag: 'এইচএসসি ও ভর্তি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 45%, #4c0519 100%)',
      chapters: [
        { id: 'ban1_ch1', num: 1, name: 'অপরিচিতা (গল্প)', icon: '📖' },
        { id: 'ban1_ch2', num: 2, name: 'বিলাসী (গল্প)', icon: '📚' },
        { id: 'ban1_ch3', num: 3, name: 'সোনার তরী (কবিতা)', icon: '⛵' },
        { id: 'ban1_ch4', num: 4, name: 'বিদ্রোহী (কবিতা)', icon: '🔥' }
      ]
    },
    {
      id: 'bangla2',
      category: 'HSC',
      titleBn: 'বাংলা ২য় পত্র',
      titleEn: 'Bangla 2nd Paper',
      tag: 'এইচএসসি ও ভর্তি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #e11d48 0%, #9f1239 45%, #4c0519 100%)',
      chapters: [
        { id: 'ban2_ch1', num: 1, name: 'বাংলা উচ্চারণের নিয়ম', icon: '🗣️' },
        { id: 'ban2_ch2', num: 2, name: 'বাংলা বানানের নিয়ম', icon: '✍️' },
        { id: 'ban2_ch3', num: 3, name: 'ব্যাকরণিক শব্দশ্রেণি', icon: '📑' }
      ]
    },

    // --- SSC SUBJECTS ---
    {
      id: 'ssc_phy',
      category: 'SSC',
      titleBn: 'পদার্থবিজ্ঞান (SSC)',
      titleEn: 'Physics',
      tag: 'এসএসসি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
      chapters: [
        { id: 'ssc_phy_ch1', num: 1, name: 'ভৌত রাশি ও পরিমাপ', icon: '🔬' },
        { id: 'ssc_phy_ch2', num: 2, name: 'গতি', icon: '🏎️' },
        { id: 'ssc_phy_ch3', num: 3, name: 'বল', icon: '⚖️' },
        { id: 'ssc_phy_ch4', num: 4, name: 'কাজ, ক্ষমতা ও শক্তি', icon: '⚡' }
      ]
    },
    {
      id: 'ssc_chem',
      category: 'SSC',
      titleBn: 'রসায়ন (SSC)',
      titleEn: 'Chemistry',
      tag: 'এসএসসি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
      chapters: [
        { id: 'ssc_chem_ch1', num: 1, name: 'পদার্থের অবস্থা', icon: '🧪' },
        { id: 'ssc_chem_ch2', num: 2, name: 'পদার্থের গঠন', icon: '⚛️' },
        { id: 'ssc_chem_ch3', num: 3, name: 'পর্যায় সারণি', icon: '📊' },
        { id: 'ssc_chem_ch4', num: 4, name: 'রাসায়নিক বন্ধন', icon: '🔗' }
      ]
    },
    {
      id: 'ssc_bio',
      category: 'SSC',
      titleBn: 'জীববিজ্ঞান (SSC)',
      titleEn: 'Biology',
      tag: 'এসএসসি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
      chapters: [
        { id: 'ssc_bio_ch1', num: 1, name: 'জীবন পাঠ', icon: '🌱' },
        { id: 'ssc_bio_ch2', num: 2, name: 'জীবকোষ ও টিস্যু', icon: '🔬' },
        { id: 'ssc_bio_ch3', num: 3, name: 'কোষ বিভাজন', icon: '🧬' }
      ]
    },
    {
      id: 'ssc_math',
      category: 'SSC',
      titleBn: 'সাধারণ গণিত (SSC)',
      titleEn: 'General Math',
      tag: 'এসএসসি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)',
      chapters: [
        { id: 'ssc_math_ch1', num: 1, name: 'বাস্তব সংখ্যা', icon: '🔢' },
        { id: 'ssc_math_ch2', num: 2, name: 'সেট ও ফাংশন', icon: '📐' },
        { id: 'ssc_math_ch3', num: 3, name: 'বীজগাণিতিক রাশি', icon: '✖️' }
      ]
    },

    // --- ADMISSION SUBJECTS ---
    {
      id: 'adm_med_bio',
      category: 'Admission',
      titleBn: 'মেডিকেল জীববিজ্ঞান',
      titleEn: 'Medical Biology',
      tag: 'মেডিকেল ভর্তি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      chapters: [
        { id: 'adm_bio_ch1', num: 1, name: 'কোষ ও বংশগতি', icon: '🧬' },
        { id: 'adm_bio_ch2', num: 2, name: 'মানব শারীরতত্ত্ব', icon: '🫀' },
        { id: 'adm_bio_ch3', num: 3, name: 'উদ্ভিদ শারীরতত্ত্ব ও অণুজীব', icon: '🦠' }
      ]
    },
    {
      id: 'adm_med_chem',
      category: 'Admission',
      titleBn: 'মেডিকেল ও ভার্সিটি রসায়ন',
      titleEn: 'Admission Chemistry',
      tag: 'ভর্তি পরীক্ষা প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #1d4ed8 100%)',
      chapters: [
        { id: 'adm_chem_ch1', num: 1, name: 'গুণগত ও জৈব রসায়ন', icon: '⚗️' },
        { id: 'adm_chem_ch2', num: 2, name: 'মৌলের পর্যায়বৃত্ত ধর্ম ও বন্ধন', icon: '📊' }
      ]
    },
    {
      id: 'adm_eng_phy',
      category: 'Admission',
      titleBn: 'ইঞ্জিনিয়ারিং পদার্থবিজ্ঞান',
      titleEn: 'Engineering Physics',
      tag: 'বুয়েট ও ইঞ্জিনিয়ারিং প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)',
      chapters: [
        { id: 'adm_phy_ch1', num: 1, name: 'বলবিদ্যা ও গতিবিদ্যা', icon: '⚙️' },
        { id: 'adm_phy_ch2', num: 2, name: 'তড়িৎ ও তাপগতিবিদ্যা', icon: '⚡' }
      ]
    },
    {
      id: 'adm_eng_math',
      category: 'Admission',
      titleBn: 'ইঞ্জিনিয়ারিং উচ্চতর গণিত',
      titleEn: 'Engineering Math',
      tag: 'ইঞ্জিনিয়ারিং প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      chapters: [
        { id: 'adm_math_ch1', num: 1, name: 'ক্যালকুলাস ও কনিক্স', icon: '📐' },
        { id: 'adm_math_ch2', num: 2, name: 'ম্যাট্রিক্স ও ত্রিকোণমিতি', icon: '📏' }
      ]
    },
    {
      id: 'adm_gk_eng',
      category: 'Admission',
      titleBn: 'জিকে ও ইংরেজি (ভর্তি)',
      titleEn: 'GK & English',
      tag: 'মেডিকেল ও ঢাবি ভর্তি',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%)',
      chapters: [
        { id: 'adm_gk_ch1', num: 1, name: 'সাধারণ জ্ঞান বাংলাদেশ ও বিশ্ব', icon: '🌍' },
        { id: 'adm_eng_ch1', num: 2, name: 'Medical & Varsity English Grammar', icon: '📖' }
      ]
    },

    // --- BCS / JOB SUBJECTS ---
    {
      id: 'bcs_bangla',
      category: 'BCS',
      titleBn: 'বাংলা ভাষা ও সাহিত্য (BCS)',
      titleEn: 'Bangla Language & Literature',
      tag: 'বিসিএস প্রিলি ও লিখিত',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #9d174d 100%)',
      chapters: [
        { id: 'bcs_ban_ch1', num: 1, name: 'প্রাচীন ও মধ্যযুগ', icon: '📜' },
        { id: 'bcs_ban_ch2', num: 2, name: 'আধুনিক যুগ', icon: '✒️' },
        { id: 'bcs_ban_ch3', num: 3, name: 'বাংলা ব্যাকরণ ও ভাষা', icon: '📖' }
      ]
    },
    {
      id: 'bcs_english',
      category: 'BCS',
      titleBn: 'ইংরেজি ভাষা ও সাহিত্য (BCS)',
      titleEn: 'English Language & Literature',
      tag: 'বিসিএস ও ব্যাংক প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #5b21b6 100%)',
      chapters: [
        { id: 'bcs_eng_ch1', num: 1, name: 'English Grammar & Parts of Speech', icon: '🔤' },
        { id: 'bcs_eng_ch2', num: 2, name: 'Vocabulary, Idioms & Correction', icon: '📝' },
        { id: 'bcs_eng_ch3', num: 3, name: 'English Literature', icon: '📚' }
      ]
    },
    {
      id: 'bcs_bd',
      category: 'BCS',
      titleBn: 'বাংলাদেশ বিষয়াবলি (BCS)',
      titleEn: 'Bangladesh Affairs',
      tag: 'বিসিএস ও চাকরি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #065f46 100%)',
      chapters: [
        { id: 'bcs_bd_ch1', num: 1, name: 'বাংলার ইতিহাস ও মুক্তিযুদ্ধ', icon: '🇧🇩' },
        { id: 'bcs_bd_ch2', num: 2, name: 'সংবিধান, অর্থনীতি ও শাসনব্যবস্থা', icon: '⚖️' },
        { id: 'bcs_bd_ch3', num: 3, name: 'ভূগোল ও সাম্প্রতিক বাংলাদেশ', icon: '🗺️' }
      ]
    },
    {
      id: 'bcs_intl',
      category: 'BCS',
      titleBn: 'আন্তর্জাতিক বিষয়াবলি (BCS)',
      titleEn: 'International Affairs',
      tag: 'বিসিএস ও চাকরি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
      chapters: [
        { id: 'bcs_intl_ch1', num: 1, name: 'বৈশ্বিক ইতিহাস ও ভূ-রাজনীতি', icon: '🌐' },
        { id: 'bcs_intl_ch2', num: 2, name: 'আন্তর্জাতিক সংস্থা ও চুক্তি', icon: '🏛️' },
        { id: 'bcs_intl_ch3', num: 3, name: 'সাম্প্রতিক বিশ্ব ও পরিবেশ', icon: '🌍' }
      ]
    },
    {
      id: 'bcs_math',
      category: 'BCS',
      titleBn: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
      titleEn: 'Math & Mental Ability',
      tag: 'বিসিএস গণিত ও যুক্তি',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      chapters: [
        { id: 'bcs_math_ch1', num: 1, name: 'পাটিগণিত ও শতকরা-লাভক্ষতি', icon: '🧮' },
        { id: 'bcs_math_ch2', num: 2, name: 'বীজগণিত ও জ্যামিতি', icon: '📐' },
        { id: 'bcs_math_ch3', num: 3, name: 'মানসিক দক্ষতা ও বিশ্লেষণ', icon: '🧠' }
      ]
    },
    {
      id: 'bcs_sci_ict',
      category: 'BCS',
      titleBn: 'সাধারণ বিজ্ঞান, কম্পিউটার ও নৈতিকতা',
      titleEn: 'General Science, ICT & Ethics',
      tag: 'বিসিএস বিজ্ঞান ও আইসিটি',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #155e75 100%)',
      chapters: [
        { id: 'bcs_sci_ch1', num: 1, name: 'দৈনন্দিন ও ভৌত-জীববিজ্ঞান', icon: '🔬' },
        { id: 'bcs_sci_ch2', num: 2, name: 'কম্পিউটার ও তথ্যপ্রযুক্তি', icon: '💻' },
        { id: 'bcs_sci_ch3', num: 3, name: 'নৈতিকতা, মূল্যবোধ ও সুশাসন', icon: '🏛️' }
      ]
    }
  ];

  // Default Question Bank sample
  const BUILTIN_QUESTION_BANKS = {
    chem2_ch1: [
      {
        question: 'বায়ুমণ্ডলের কোন স্তরে ওজোন গ্যাসের স্তর অবস্থিত?',
        options: ['ট্রপোস্ফিয়ার', 'স্ট্র্যাটোস্ফিয়ার', 'মেসোস্ফিয়ার', 'থার্মোস্ফিয়ার'],
        correct: 1,
        explanation: 'স্ট্র্যাটোস্ফিয়ার স্তরে ওজোন স্তর (Ozone Layer) অবস্থিত, যা সূর্যের ক্ষতিকর অতিবেগুনি রশ্মি শোষণ করে।'
      },
      {
        question: 'STP-তে ১ মোল যেকোনো আদর্শ গ্যাসের আয়তন কত লিটার?',
        options: ['২২.৪ লিটার', '২৪.৭৮৯ লিটার', '২০.০ লিটার', '২২.৭ লিটার'],
        correct: 0,
        explanation: 'Standard Temperature and Pressure (STP, 0°C ও 1 atm) এ ১ মোল আদর্শ গ্যাসের মোলার আয়তন ২২.৪১৪ লিটার।'
      },
      {
        question: 'গ্রিনহাউস গ্যাসের মধ্যে বৈশ্বিক উষ্ণায়নে সর্বাধিক অবদান রাখে কোনটি?',
        options: ['মিথেন (CH4)', 'কার্বন ডাই অক্সাইড (CO2)', 'নাইট্রাস অক্সাইড (N2O)', 'সিএফসি (CFC)'],
        correct: 1,
        explanation: 'বায়ুমণ্ডলে পরিমাণের দিক থেকে কার্বন ডাই অক্সাইড সর্বাধিক পরিমাণে নির্গত হওয়ায় গ্রিনহাউস প্রভাবে এর অবদান সর্বোচ্চ (প্রায় ৫০-৬০%)।'
      },
      {
        question: 'বয়েলের সূত্রে কোন দুটি রাশি ধ্রুবক থাকে?',
        options: ['তাপমাত্রা ও গ্যাসের ভর', 'চাপ ও গ্যাসের ভর', 'আয়তন ও তাপমাত্রা', 'চাপ ও তাপমাত্রা'],
        correct: 0,
        explanation: 'বয়েলের সূত্র অনুসারে নির্দিষ্ট ভরের গ্যাসের ক্ষেত্রে স্থির তাপমাত্রায় গ্যাসের আয়তন প্রযুক্ত চাপের ব্যস্তানুপাতিক।'
      },
      {
        question: 'এসিড বৃষ্টির জন্য মূলত কোন গ্যাসগুলো দায়ী?',
        options: ['SO2 ও NO2', 'CO ও CH4', 'O2 ও N2', 'He ও Ar'],
        correct: 0,
        explanation: 'SO2 এবং NO2 বৃষ্টির পানির সাথে বিক্রিয়া করে সালফিউরিক ও নাইট্রিক এসিড উৎপন্ন করে, যা এসিড বৃষ্টির মূল কারণ।'
      }
    ],
    chem2_ch2: [
      {
        question: 'জৈব যৌগের সমগোত্রীয় শ্রেণীর সদস্যদের মধ্যে কিসের ব্যবধান থাকে?',
        options: ['-CH2- (মিথিলিন মূলক)', '-CH3 (মিথাইল মূলক)', '-OH মূলক', '-COOH মূলক'],
        correct: 0,
        explanation: 'সমগোত্রীয় শ্রেণীর পরপর দুটি সদস্যের আণবিক সংকেতের মধ্যে একটি মিথিলিন (-CH2-) মূলকের পার্থক্য থাকে।'
      },
      {
        question: 'মার্শ গ্যাস নামে কোনটি পরিচিত?',
        options: ['ইথেন', 'মিথেন', 'প্রোপেন', 'বিউটেন'],
        correct: 1,
        explanation: 'জলাভূমি বা ধানক্ষেতের পচা জৈব পদার্থ থেকে মিথেন গ্যাস উৎপন্ন হয় বলে একে মার্শ গ্যাস বলা হয়।'
      },
      {
        question: 'বেনজিনে কয়টি সিগমা (σ) এবং কয়টি পাই (π) বন্ধন থাকে?',
        options: ['১২টি σ এবং ৩টি π', '৬টি σ এবং ৩টি π', '৩টি σ এবং ৩টি π', '৯টি σ এবং ৩টি π'],
        correct: 0,
        explanation: 'বেনজিনে ৬টি C-C এবং ৬টি C-H বন্ধন মিলিয়ে মোট ১২টি সিগমা বন্ধন এবং ৩টি সঞ্চারণশীল পাই বন্ধন থাকে।'
      }
    ],
    bio2_ch4: [
      {
        question: 'মানবদেহে সার্বজনীন রক্ত গ্রহীতা (Universal Recipient) কোন গ্রুপ?',
        options: ['O পজিটিভ', 'AB পজিটিভ', 'A নেগেটিভ', 'B পজিটিভ'],
        correct: 1,
        explanation: 'AB পজিটিভ গ্রুপের রক্তের রক্তরসে কোনো অ্যান্টিবডি না থাকায় এটি যেকোনো গ্রুপের রক্ত গ্রহণ করতে পারে।'
      },
      {
        question: 'হৃদপিণ্ডের প্রাকৃতিক পেসমেকার (Natural Pacemaker) কোনটি?',
        options: ['SAN (সাইনোট্রিয়াল নোড)', 'AVN', 'পারকিঞ্জি তন্তু', 'বান্ডল অব হিজ'],
        correct: 0,
        explanation: 'সাইনোট্রিয়াল নোড (SAN) স্বয়ংক্রিয়ভাবে বিদ্যুৎ তরঙ্গ সৃষ্টি করে হৃদস্পন্দন শুরু করায় একে প্রাকৃতিক পেসমেকার বলা হয়।'
      },
      {
        question: 'রক্ত জমাট বাঁধতে সাহায্য করে কোন রক্তকণিকা?',
        options: ['অণুচক্রিকা (Platelet)', 'লোহিত রক্তকণিকা', 'শ্বেত রক্তকণিকা', 'লিম্ফোসাইট'],
        correct: 0,
        explanation: 'অণুচক্রিকা বা থ্রম্বোসাইট থ্রম্বোপ্লাস্টিন নিঃসরণের মাধ্যমে রক্ত তঞ্চন বা ক্লটিংয়ে প্রধান ভূমিকা পালন করে।'
      }
    ],
    gk_ch2: [
      {
        question: '১৯৭১ সালের মহান মুক্তিযুদ্ধে বাংলাদেশকে কয়টি সেক্টরে ভাগ করা হয়েছিল?',
        options: ['৭টি', '৯টি', '১১টি', '১৪টি'],
        correct: 2,
        explanation: 'যুদ্ধ পরিচালনার সুবিধার জন্য সমগ্র বাংলাদেশকে ১১টি সেক্টরে এবং ৬৪টি সাব-সেক্টরে বিভক্ত করা হয়েছিল।'
      },
      {
        question: 'কোন সেক্টরে কোনো নিয়মিত সেক্টর কমান্ডার ছিলেন না?',
        options: ['১০ নম্বর সেক্টর', '১ নম্বর সেক্টর', '২ নম্বর সেক্টর', '৮ নম্বর সেক্টর'],
        correct: 0,
        explanation: '১০ নম্বর নৌ-সেক্টর ছিল একটি ব্যতিক্রমী সেক্টর, যেখানে কোনো নির্দিষ্ট সেক্টর কমান্ডার ছিলেন না। নৌ কমান্ডোরা সদর দপ্তর থেকে পরিচালিত হতো।'
      },
      {
        question: 'স্বাধীন বাংলা বেতার কেন্দ্র থেকে প্রচারিত "চরমপত্র" কে পাঠ করতেন?',
        options: ['এম আর আখতার মুকুল', 'কামাল লোহানী', 'বেলাল মোহাম্মদ', 'আব্দুল গাফফার চৌধুরী'],
        correct: 0,
        explanation: 'জনপ্রিয় ব্যঙ্গাত্মক অনুষ্ঠান "চরমপত্র" রচনা ও স্বকণ্ঠে পাঠ করতেন বিশিষ্ট সাংবাদিক এম আর আখতার মুকুল।'
      }
    ]
  };

  // State Management
  const State = {
    subjects: DEFAULT_SUBJECTS,
    currentTab: 'assigned', // 'assigned' | 'subjects' | 'leaderboard'
    currentSubject: null,
    currentChapter: null,
    activeExam: null, // exam configuration
    activeQuestions: [],
    currentQIndex: 0,
    userAnswers: {}, // { [qIdx]: selectedOptionIdx }
    flaggedQuestions: new Set(),
    timerInterval: null,
    autoSubmitTimer: null,
    timeRemainingSeconds: 0,
    totalDurationSeconds: 0,
    examEndTime: 0,
    examExpiryHandled: false,
    activeSessionId: null,
    tabSwitchCount: 0,
    isExamRunning: false,
    leaveCountdownInterval: null,
    leaveCountdownSeconds: 20,
    penaltyApplied: false,
    startTime: null,
    soundMuted: false,
    negativeMarkingEnabled: false
  };

  // DOM Elements cache
  let elements = {};
  let activePortalClass = localStorage.getItem('sr_class') || 'HSC';

  function init() {
    renderButtonsUnderInspiration();
    renderExamPortalModalMarkup();
    cacheDOMElements();
    bindGlobalListeners();
    loadSubjectsFromDB();
    loadAssignedExamsFromDB();
    loadLeaderboardFromDB();
  }

  // 2. Insert Action Buttons Below Inspiration
  function renderButtonsUnderInspiration() {
    let row = document.getElementById('examActionRow');
    if (!row) {
      const qt = document.getElementById('qt');
      const inspCard = qt ? qt.closest('.card') : null;
      if (!inspCard) return;

      row = document.createElement('div');
      row.id = 'examActionRow';
      row.className = 'exam-action-buttons';
      row.innerHTML = `
        <button class="exam-btn-primary" id="btnOpenExamPortal" type="button" aria-label="অনলাইন এক্সাম পোর্টাল খুলুন">
          <span class="exam-btn-icon">📝</span>
          <div class="exam-btn-text">
            <span class="exam-btn-title">Exams</span>
            <span class="exam-btn-sub">লাইভ এক্সাম, চ্যাপ্টার প্র্যাকটিস ও লিডারবোর্ড</span>
          </div>
        </button>
        <button class="exam-btn-secondary" id="btnJumpShortcut" type="button" aria-label="পড়ার শর্টকাটে যান">
          <span class="exam-btn-icon">🔗</span>
          <div class="exam-btn-text">
            <span class="exam-btn-title">পড়ার শর্টকাট</span>
            <span class="exam-btn-sub">প্রয়োজনীয় ক্লাস লিঙ্ক ও স্টাডি ফাইলস</span>
          </div>
        </button>
      `;
      inspCard.parentNode.insertBefore(row, inspCard.nextSibling);
    }

    const openBtn = document.getElementById('btnOpenExamPortal');
    if (openBtn) {
      openBtn.onclick = () => {
        openPortal();
      };
    }

    const jumpBtn = document.getElementById('btnJumpShortcut');
    if (jumpBtn) {
      jumpBtn.onclick = () => {
        openInPageShortcutModal();
      };
    }
  }

  const PORTAL_THEME_KEY = 'sr_exam_portal_theme';

  function getPortalTheme() {
    try {
      return localStorage.getItem(PORTAL_THEME_KEY) === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function applyPortalTheme(theme) {
    const mode = theme === 'light' ? 'light' : 'dark';
    try {
      localStorage.setItem(PORTAL_THEME_KEY, mode);
    } catch (e) {}
    const targets = [
      document.getElementById('examPortalOverlay'),
      document.getElementById('confirmSubmitOverlay'),
      document.getElementById('preExamSettingsOverlay'),
      document.getElementById('strictWarningOverlay')
    ];
    targets.forEach((el) => {
      if (el) el.setAttribute('data-portal-theme', mode);
    });
    const btn = document.getElementById('btnExamThemeToggle');
    if (btn) {
      const isLight = mode === 'light';
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      btn.setAttribute('title', isLight ? 'ডার্ক মোড চালু করুন' : 'লাইট মোড চালু করুন');
      btn.setAttribute('aria-label', isLight ? 'ডার্ক মোড চালু করুন' : 'লাইট মোড চালু করুন');
      btn.innerHTML = isLight
        ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
    }
  }

  // 3. Render Modal Shell in Document
  function renderExamPortalModalMarkup() {
    if (document.getElementById('examPortalOverlay')) return;

    const modalMarkup = `
      <!-- Main Exam Portal Modal -->
      <div id="examPortalOverlay" class="exam-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="examPortalTitle">
        <div class="exam-modal-container">
          
          <!-- Top Navigation Header -->
          <header class="exam-portal-header">
            <div class="exam-brand-wrapper">
              <div class="exam-brand-icon">🎓</div>
              <div>
                <h3 class="exam-portal-title" id="examPortalTitle">আমার অধ্যয়ন কক্ষ</h3>
                <p class="exam-portal-sub">ডিজিটাল এক্সাম পোর্টাল</p>
              </div>
            </div>

            <!-- Portal Tabs -->
            <nav class="exam-nav-tabs" id="portalNavTabs">
              <button class="exam-tab-btn active" data-tab="assigned" type="button">📋 নির্ধারিত পরীক্ষা</button>
              <button class="exam-tab-btn" data-tab="subjects" type="button">📚 বিষয় ও চ্যাপ্টার</button>
              <button class="exam-tab-btn" data-tab="leaderboard" type="button">🏆 লিডারবোর্ড</button>
              <button class="exam-tab-btn" data-tab="history" type="button">🕒 আমার বিগত পরীক্ষা</button>
            </nav>

            <div class="exam-header-actions">
              <button class="exam-theme-toggle-btn" id="btnExamThemeToggle" type="button" title="লাইট মোড চালু করুন" aria-label="লাইট মোড চালু করুন" aria-pressed="false"></button>
              <button class="exam-close-btn" id="btnExamClose" type="button" title="বন্ধ করুন" aria-label="Close">✕</button>
            </div>
          </header>

          <!-- Scrollable Body Content -->
          <div class="exam-portal-body" id="portalBodyContent">
            
            <!-- Student Profile Class Display (Only User Selected Class) -->
            <div id="examPortalClassRow" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--ex-border);flex-wrap:wrap;gap:10px">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:13px;color:var(--ex-muted);font-weight:600">আপনার কোর্স / ক্লাস:</span>
                <span id="userPortalClassBadge" class="exam-portal-class-badge">
                  🎓 এইচএসসি (HSC)
                </span>
              </div>
              <div id="examPortalRegularClassNote" style="display:flex;align-items:center;gap:8px">
                <span style="font-size:12.5px;color:var(--ex-muted)">ক্লাস পরিবর্তনের জন্য প্রোফাইল সেটিংস থেকে আবেদন করুন</span>
              </div>
              <div id="examPortalVipClassSwitcher" style="display:none;align-items:center;gap:6px;flex-wrap:wrap">
                <span style="font-size:12px;color:var(--rev-correct);font-weight:600">ক্লাস বদলান (VIP):</span>
                <button type="button" class="vip-portal-cls-btn" data-cls="HSC">HSC</button>
                <button type="button" class="vip-portal-cls-btn" data-cls="SSC">SSC</button>
                <button type="button" class="vip-portal-cls-btn" data-cls="Admission">Admission</button>
                <button type="button" class="vip-portal-cls-btn" data-cls="BCS">BCS / Job</button>
              </div>
            </div>

            <!-- Offline / Failed Submission Backup Queue Bar -->
            <div id="examPendingQueueBar" style="display:none;margin-bottom:14px;padding:12px 14px;border-radius:12px;background:rgba(245,158,11,0.14);border:1.5px solid rgba(245,158,11,0.55);color:var(--ex-ink);align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"></div>
            <div id="examCancelledSessionNotice" class="exam-cancelled-banner" style="display:none"></div>

            <!-- View 1: Assigned Exams -->
            <div class="exam-view-panel active" id="viewAssigned">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px">
                <h4 style="margin:0;font-size:18px;font-weight:700;color:var(--ex-ink)">📅 আজকের ও নির্ধারিত পরীক্ষা সমূহ</h4>
                <span style="font-size:12.5px;color:var(--ex-muted)">রুম কোড ও রোল অনুযায়ী স্বয়ংক্রিয় ফিল্টার</span>
              </div>
              <div class="assigned-exams-list" id="assignedExamsListContainer">
                <div class="sr-skeleton-stack" aria-hidden="true">
                  <div class="sr-skeleton-card"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div><div class="sr-skeleton-line sr-skeleton-bar"></div></div>
                  <div class="sr-skeleton-card"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div><div class="sr-skeleton-line sr-skeleton-bar"></div></div>
                  <div class="sr-skeleton-card"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div><div class="sr-skeleton-line sr-skeleton-bar"></div></div>
                </div>
              </div>
            </div>

            <!-- View 2: Subjects & Chapters -->
            <div class="exam-view-panel" id="viewSubjects">
              <!-- Subjects Listing (Step 1) -->
              <div id="subjectsListingContainer">
                <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                  <div>
                    <h4 style="margin:0 0 4px 0;font-size:18px;font-weight:700;color:var(--ex-ink)">১. বিষয় নির্বাচন করুন (Subject Hierarchy) — <span id="subjectCategoryTitleBadge">HSC</span></h4>
                    <p style="margin:0;font-size:12.5px;color:var(--ex-muted)">যেকোনো বিষয়ে ক্লিক করে চ্যাপ্টার ভিত্তিক এমসিকিউ অনুশীলন শুরু করুন</p>
                  </div>
                </div>
                <div class="subject-grid" id="subjectGridContainer"></div>
              </div>

              <!-- Chapters Listing (Step 2) -->
              <div id="chaptersListingContainer" style="display:none">
                <div class="chapter-header-bar" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                    <button class="btn-back-subjects" id="btnBackToSubjects" type="button">← সব বিষয়ে ফিরে যান</button>
                    <h4 id="selectedSubjectTitle" style="margin:0;font-size:17px;font-weight:700;color:var(--ex-accent)"></h4>
                  </div>
                </div>
                <div class="chapters-grid" id="chaptersGridContainer"></div>
              </div>

              <!-- Chapter Exams Listing (Step 3: New 4-Step Hierarchy) -->
              <div id="chapterExamsListingContainer" style="display:none">
                <div class="chapter-header-bar" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                    <button class="btn-back-subjects" id="btnBackToChapters" type="button">← অধ্যায়সমূহে ফিরে যান</button>
                    <h4 id="selectedChapterExamTitle" style="margin:0;font-size:17px;font-weight:700;color:var(--ex-accent)"></h4>
                  </div>
                </div>

                <!-- Previous Score Preview Card -->
                <div id="chapterPrevScoreCard" class="chapter-prev-score-card">
                  <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:24px">📊</span>
                    <div>
                      <div style="font-size:12.5px;color:var(--ex-muted);font-weight:600">পূর্ববর্তী সেরা ফলাফল:</div>
                      <div id="chapterPrevScoreText" style="font-size:15px;font-weight:700;color:var(--ex-accent)">কোনো পূর্ববর্তী রেকর্ড নেই (প্রথম প্রচেষ্টা)</div>
                    </div>
                  </div>
                  <span id="chapterPrevScoreBadge" style="font-size:12px;padding:4px 12px;border-radius:20px;background:rgba(56,189,248,0.15);color:var(--ex-accent);font-weight:700">নতুন প্রস্তুতি</span>
                </div>

                <!-- List of Exams for this chapter -->
                <div class="chapter-exams-grid" id="chapterExamsGridContainer" style="display:grid;gap:12px"></div>
              </div>

              <!-- Personal Wrong & Skipped Question Chapter View ("আমার ভুল করা প্রশ্ন") -->
              <div id="wrongBankListingContainer" style="display:none">
                <div class="chapter-header-bar" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
                  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                    <button class="btn-back-subjects" id="btnBackFromWrongBank" type="button">← সব বিষয়ে ফিরে যান</button>
                    <div>
                      <h4 id="wrongBankChapterTitle" style="margin:0;font-size:18px;font-weight:800;color:var(--rev-wrong)">আমার ভুল করা প্রশ্ন</h4>
                      <div id="wrongBankUserSub" style="font-size:12px;color:var(--ex-muted);margin-top:2px">১ দিন আগের পরীক্ষার ভুল ও স্কিপ করা প্রশ্ন (নতুনগুলো উপরে, পুরোনোগুলো নিচে)</div>
                    </div>
                  </div>
                  <button id="btnStartWrongBankExam" type="button" style="display:none;background:linear-gradient(135deg,#e11d48,#be123c);color:#fff;border:none;padding:9px 16px;border-radius:11px;font-weight:700;font-size:13.5px;cursor:pointer;box-shadow:0 6px 18px rgba(225,29,72,0.35)">
                    ▶ এই অধ্যায় দিয়ে পরীক্ষা দিন
                  </button>
                </div>

                <div id="wrongBankTodayNotice" class="wb-today-notice" style="display:none"></div>

                <div id="wrongBankStatsBar" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">
                  <div id="wrongBankFilterPills" style="display:flex;gap:8px;flex-wrap:wrap">
                    <button type="button" class="wb-filter-btn active" data-wb-filter="all">সব (<span id="wbCountAll">০</span>)</button>
                    <button type="button" class="wb-filter-btn wb-filter-wrong" data-wb-filter="wrong">ভুল উত্তর (<span id="wbCountWrong">০</span>)</button>
                    <button type="button" class="wb-filter-btn wb-filter-skipped" data-wb-filter="skipped">স্কিপ করা (<span id="wbCountSkipped">০</span>)</button>
                  </div>
                  <span id="wrongBankOrderHint" style="font-size:12px;color:var(--ex-muted)">সর্বশেষ প্রশ্ন সবার উপরে</span>
                </div>

                <div id="wrongBankQuestionsList" style="display:grid;gap:12px"></div>
              </div>
            </div>

            <!-- View 3: Leaderboard -->
            <div class="exam-view-panel" id="viewLeaderboard">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
                <h4 style="margin:0;font-size:18px;font-weight:700;color:var(--ex-ink)">🏆 অনলাইন এক্সাম লিডারবোর্ড</h4>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <button id="btnOpenLeaderboardFilterModal" onclick="window.openLeaderboardFilterModal && window.openLeaderboardFilterModal()" class="btn-back-subjects" style="padding:5px 12px;font-size:12.5px;background:rgba(59,130,246,0.15);border:1.5px solid #3b82f6;color:var(--ex-accent);display:inline-flex;align-items:center;gap:6px;border-radius:10px;cursor:pointer" type="button">🔍 ফিল্টার</button>
                  <span id="activeFilterBadge" style="display:none;font-size:12px;padding:4px 10px;border-radius:8px;background:rgba(16,185,129,0.2);color:var(--rev-correct);font-weight:600"></span>
                  <button id="btnClearFilter" class="btn-back-subjects" style="display:none;padding:4px 8px;font-size:11.5px;color:#ef4444;border:1px solid #ef4444;border-radius:8px" type="button">✕ রিসেট</button>
                  <select id="examFilterSelect" style="display:none"><option value="all">সকল পরীক্ষা</option></select>
                  <button id="btnRefreshLeaderboard" class="btn-back-subjects" style="padding:5px 12px;font-size:12px;border-radius:10px" type="button">🔄 রিফ্রেশ</button>
                </div>
              </div>
              <div class="leaderboard-table-wrapper">
                <table class="leaderboard-table">
                  <thead>
                    <tr>
                      <th style="width:60px">র‍্যাংক</th>
                      <th>শিক্ষার্থী (রুম)</th>
                      <th>বিষয় / পরীক্ষা</th>
                      <th>নম্বর</th>
                      <th>শতাংশ</th>
                      <th>সময়</th>
                      <th>তারিখ</th>
                    </tr>
                  </thead>
                  <tbody id="examLeaderboardTableBody">
                    <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="7"><div class="sr-skeleton-line md" style="width:92%"></div></td></tr>
                    <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="7"><div class="sr-skeleton-line md" style="width:84%"></div></td></tr>
                    <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="7"><div class="sr-skeleton-line md" style="width:88%"></div></td></tr>
                    <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="7"><div class="sr-skeleton-line md" style="width:78%"></div></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- View 6: Recent Exams Personal History -->
            <div class="exam-view-panel" id="viewHistory">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
                <div>
                  <h4 style="margin:0 0 4px 0;font-size:18px;font-weight:700;color:var(--ex-ink)">🕒 আমার বিগত পরীক্ষার রেকর্ড (Recent Exams)</h4>
                  <p style="margin:0;font-size:12.5px;color:var(--ex-muted)">আপনার দেওয়া সর্বশেষ ২৫টি পরীক্ষার ফলাফল ও সমাধান পর্যালোচনা</p>
                </div>
                <button id="btnRefreshHistory" class="btn-back-subjects" style="padding:4px 10px;font-size:12px" type="button">🔄 রিফ্রেশ</button>
              </div>

              <div class="leaderboard-table-wrapper">
                <table class="leaderboard-table">
                  <thead>
                    <tr>
                      <th>পরীক্ষার নাম</th>
                      <th>প্রাপ্ত নম্বর</th>
                      <th>শতকরা হার</th>
                      <th>ব্যয়িত সময়</th>
                      <th>তারিখ</th>
                      <th style="width:110px;text-align:center">উত্তরপত্র</th>
                    </tr>
                  </thead>
                  <tbody id="examHistoryTableBody">
                    <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="6"><div class="sr-skeleton-line md" style="width:90%"></div></td></tr>
                    <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="6"><div class="sr-skeleton-line md" style="width:82%"></div></td></tr>
                    <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="6"><div class="sr-skeleton-line md" style="width:86%"></div></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- View 4: Smart Active Exam Arena -->
            <div class="exam-view-panel" id="viewActiveExam">

              <!-- Sticky Mobile Timer Bar (visible on <= 860px) -->
              <div class="mobile-exam-timer-bar" id="mobileExamTimerBar">
                <div class="mobile-exam-timer-left">
                  <span id="mobileExamProgressLabel">প্রশ্ন ১ / ১০</span>
                </div>
                <div class="mobile-exam-timer-right">
                  <div class="mobile-circular-badge" id="mobileCircularBadge">
                    <svg viewBox="0 0 36 36">
                      <circle class="mobile-circular-bg" cx="18" cy="18" r="15"></circle>
                      <circle class="mobile-circular-bar timer-green" id="mobileCircularProgress" cx="18" cy="18" r="15" stroke-dasharray="94.25" stroke-dashoffset="0"></circle>
                    </svg>
                  </div>
                  <span class="mobile-exam-timer-clock timer-green" id="mobileExamTimerDisplay">০০:০০</span>
                  <button id="btnExamSoundToggleMobile" class="btn-sound-toggle" type="button" title="শব্দ চালু (মিউট করতে চাপুন)" aria-label="শব্দ চালু বা বন্ধ">🔔</button>
                </div>
              </div>

              <!-- Horizontal Question Stepper Progress Rail -->
              <div class="exam-step-progress-card" id="examStepProgressCard">
                <div class="exam-step-top-row">
                  <div class="exam-step-counter-group">
                    <span class="exam-step-counter" id="examStepCounter">প্রশ্ন ১ / ১০</span>
                    <span class="exam-step-subject-title" id="activeExamSubjectTitle"></span>
                    <span class="exam-step-meta" id="activeExamBadge"></span>
                  </div>
                  <div class="exam-step-right-meta">
                    <div id="examPdfToggleWrapper" style="display:none">
                      <a id="examPdfLink" href="#" target="_blank" rel="noopener noreferrer" class="btn-view-pdf">
                        📄 প্রশ্নপত্র PDF
                      </a>
                    </div>
                    <span class="exam-step-answered-stat" id="examStepAnsweredStat">উত্তর ০ · বাকি ০</span>
                  </div>
                </div>
                <div class="exam-step-rail-scroll" id="examStepRailScroll">
                  <div class="exam-step-rail" id="examStepRail"></div>
                </div>
              </div>

              <div class="active-exam-container">
                
                <!-- Left: Focused Question Card -->
                <div class="exam-main-panel">
                  <div class="exam-question-card">
                    <div class="exam-q-header">
                      <div class="exam-q-index">
                        প্রশ্ন <strong id="currentQNum">১</strong> / <span id="totalQNum">১০</span>
                      </div>
                      <button class="btn-flag-toggle" id="btnFlagQuestion" type="button">
                        <span id="flagIcon">🔖</span>
                        <span id="flagText">পরে দেখার জন্য চিহ্নিত করুন</span>
                      </button>
                    </div>

                    <div class="exam-question-title" id="activeQuestionText">প্রশ্ন লোড হচ্ছে...</div>
                    <div class="exam-question-image-wrap" id="activeQuestionImageWrap" style="display:none">
                      <img id="activeQuestionImage" class="exam-question-image" alt="প্রশ্নের ছবি" loading="lazy" decoding="async" />
                    </div>

                    <!-- 2x2 Responsive MCQ Options (ক, খ, গ, ঘ) -->
                    <div class="exam-options-list" id="activeOptionsContainer"></div>

                    <!-- Bottom Prev / Next Nav -->
                    <div class="exam-nav-actions">
                      <button class="btn-exam-nav prev" id="btnPrevQuestion" type="button">← পূর্ববর্তী</button>
                      <span class="exam-kbd-hint">Shortcut: 1–4 Option · ← → প্রশ্ন · F Flag</span>
                      <button class="btn-exam-nav next" id="btnNextQuestion" type="button">পরবর্তী →</button>
                    </div>
                  </div>
                </div>

                <!-- Right: Smart Control Sidebar (Timer + Palette + Submit CTA) -->
                <div class="exam-sidebar-card">
                  <div class="exam-sidebar-timer-block">
                    <button id="btnExamSoundToggle" class="btn-sound-toggle" type="button" title="শব্দ চালু (মিউট করতে চাপুন)" aria-label="শব্দ চালু বা বন্ধ">🔔</button>
                    <div class="circular-timer-container" id="circularTimerContainer">
                      <svg class="circular-timer-svg" viewBox="0 0 120 120">
                        <circle class="circular-timer-bg" cx="60" cy="60" r="50" />
                        <circle class="circular-timer-bar timer-green" id="circularTimerProgress" cx="60" cy="60" r="50" stroke-dasharray="314.16" stroke-dashoffset="0" />
                      </svg>
                      <div class="circular-timer-center">
                        <span class="circular-timer-digits timer-green" id="examTimerDisplay">০০:০০</span>
                      </div>
                    </div>
                    <div class="exam-sidebar-submeta" id="examSidebarSubMeta">অবশিষ্ট সময়</div>
                  </div>

                  <div class="question-palette-grid" id="questionPaletteGrid"></div>

                  <div class="palette-status-legend">
                    <div class="palette-legend-item">
                      <span class="palette-legend-left"><span class="legend-dot answered"></span><span>উত্তর দেওয়া হয়েছে</span></span>
                      <span class="palette-legend-count" id="palCountAnswered">০</span>
                    </div>
                    <div class="palette-legend-item">
                      <span class="palette-legend-left"><span class="legend-dot flagged"></span><span>চিহ্নিত করা হয়েছে</span></span>
                      <span class="palette-legend-count" id="palCountFlagged">০</span>
                    </div>
                    <div class="palette-legend-item">
                      <span class="palette-legend-left"><span class="legend-dot unanswered"></span><span>অনুত্তরিত</span></span>
                      <span class="palette-legend-count" id="palCountSkipped">০</span>
                    </div>
                  </div>

                  <button class="btn-submit-exam-finish" id="btnConfirmSubmitExam" type="button">
                    <span>পরীক্ষা জমা দিন</span>
                    <span>📤</span>
                  </button>
                </div>

              </div>
            </div>

            <!-- View 5: Result & Solutions -->
            <div class="exam-view-panel" id="viewResult">
              <div class="result-container">
                <div class="result-hero-card success" id="resultHeroCard">
                  <div style="font-size:42px;line-height:1;margin-bottom:8px" id="resultHeroIcon">🏆</div>
                  <h3 style="margin:0 0 6px 0;font-size:24px;font-weight:800" id="resultHeroTitle">পরীক্ষা সম্পন্ন হয়েছে!</h3>
                  <p style="margin:0;font-size:14px;opacity:0.9" id="resultHeroSub">আপনার উত্তরপত্র স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে।</p>

                  <div class="result-stat-grid">
                    <div class="result-stat-card">
                      <div class="result-stat-val" id="resScore">0/0</div>
                      <div class="result-stat-lbl">প্রাপ্ত নম্বর</div>
                    </div>
                    <div class="result-stat-card">
                      <div class="result-stat-val" id="resPercentage">0%</div>
                      <div class="result-stat-lbl">শতকরা হার</div>
                    </div>
                    <div class="result-stat-card">
                      <div class="result-stat-val" id="resCorrect" style="color:#34d399">0</div>
                      <div class="result-stat-lbl">সঠিক উত্তর (+১)</div>
                    </div>
                    <div class="result-stat-card">
                      <div class="result-stat-val" id="resWrong" style="color:#f87171">0</div>
                      <div class="result-stat-lbl" id="resWrongLabel">ভুল উত্তর (-০.২৫)</div>
                    </div>
                    <div class="result-stat-card">
                      <div class="result-stat-val" id="resSkipped" style="color:#94a3b8">0</div>
                      <div class="result-stat-lbl">অনুত্তর (০)</div>
                    </div>
                    <div class="result-stat-card">
                      <div class="result-stat-val" id="resTime">00:00</div>
                      <div class="result-stat-lbl">ব্যয়িত সময়</div>
                    </div>
                  </div>
                </div>

                <div id="examResultSyncBanner" style="display:none;margin:12px 0;padding:12px 16px;border-radius:12px;font-size:13.5px;line-height:1.5"></div>

                <div style="display:flex;justify-content:center;gap:12px;margin:8px 0">
                  <button class="btn-back-subjects" id="btnResultBackPortal" type="button" style="background:#3b82f6;color:#fff;border:none">
                    ← এক্সাম পোর্টালে ফিরে যান
                  </button>
                  <button class="btn-back-subjects" id="btnResultRetake" type="button">
                    🔄 পুনরায় পরীক্ষা দিন
                  </button>
                </div>

                <!-- Detailed Question Review & Solutions -->
                <div style="margin-top:14px">
                  <div class="solution-review-header">
                    <h4 class="solution-review-heading">
                      <span>📝</span> উত্তরপত্র ও বিস্তারিত বিশ্লেষণ
                    </h4>
                    <!-- Result solution filtering buttons -->
                    <div class="solution-filter-bar">
                      <button type="button" class="sol-filter-btn all active" data-filter="all" id="btnFilterAllQ">
                        📋 সকল প্রশ্ন (<span id="countAllQ">0</span>)
                      </button>
                      <button type="button" class="sol-filter-btn correct" data-filter="correct" id="btnFilterCorrectQ">
                        ✅ সঠিক উত্তর (<span id="countCorrectQ">0</span>)
                      </button>
                      <button type="button" class="sol-filter-btn wrong" data-filter="wrong" id="btnFilterWrongQ">
                        ❌ ভুল উত্তর (<span id="countWrongQ">0</span>)
                      </button>
                      <button type="button" class="sol-filter-btn skipped" data-filter="skipped" id="btnFilterSkippedQ">
                        ⚪ অনুত্তর (<span id="countSkippedQ">0</span>)
                      </button>
                    </div>
                  </div>
                  <div id="solutionReviewContainer"></div>
                </div>
              </div>
            </div>

          </div>
          <!-- Persistent Bottom-Left Floating Back Button -->
          <button class="exam-portal-back-btn" id="btnExamBottomLeftBack" type="button">
            ← ফিরে যান
          </button>
        </div>
      </div>

      <!-- Strict Proctoring Warning Overlay with 20s Return Timer -->
      <div id="strictWarningOverlay" class="strict-warning-overlay" role="alertdialog">
        <div class="strict-warning-box">
          <div class="warning-alert-icon">⚠️</div>
          <h3 style="margin:0 0 8px 0;font-size:21px;font-weight:800;color:#f87171">ট্যাব পরিবর্তন বা স্ক্রিন ছাড়ার চেষ্টা সনাক্ত হয়েছে!</h3>
          <p style="margin:0 0 14px 0;font-size:13.5px;color:#fca5a5;line-height:1.5">
            পরীক্ষার গোপনীয়তা ও নিয়ম বজায় রাখতে স্ক্রিন বা ট্যাব পরিবর্তন কঠোরভাবে নিষিদ্ধ। 
            <strong>২০ সেকেন্ডের</strong> মধ্যে পরীক্ষায় ফিরে না এলে আপনার পরীক্ষা ০ নম্বরে বাতিল হয়ে যাবে!
          </p>
          
          <div>
            <span style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#f87171;font-weight:700">ফিরে আসার জরুরি সময়:</span>
            <br>
            <div class="warning-countdown-badge" id="warningCountdownDisplay">20 সেকেন্ড</div>
          </div>

          <button class="btn-return-exam" id="btnReturnToExamPrompt" type="button">
            🚨 আমি অবিলম্বে পরীক্ষায় ফিরে যাচ্ছি
          </button>
        </div>
      </div>

      <!-- Submission Confirmation Dialog -->
      <div id="confirmSubmitOverlay" class="strict-warning-overlay" style="background:rgba(15,23,42,0.72)">
        <div class="strict-warning-box confirm-submit-box">
          <div class="warning-alert-icon" style="background:rgba(59,130,246,0.15);border-color:#3b82f6;color:#3b82f6">❓</div>
          <h3 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:var(--ex-ink)">পরীক্ষা জমা দিতে চান?</h3>
          <p id="confirmSubmitMessage" style="margin:0 0 18px 0;font-size:14px;color:var(--ex-muted-bright);line-height:1.5">
            আপনি কি নিশ্চিত যে আপনার উত্তরপত্র জমা দিতে চান?
          </p>
          <div style="display:flex;gap:12px">
            <button id="btnCancelSubmitModal" type="button" class="btn-back-subjects" style="flex:1;justify-content:center;padding:10px">না, চালিয়ে যাই</button>
            <button id="btnFinalSubmitModal" type="button" class="btn-submit-exam-finish" style="flex:1;margin:0;padding:10px">হ্যাঁ, জমা দিন</button>
          </div>
        </div>
      </div>

      <!-- Pre-Exam Settings, Custom Practice & Negative Marking Selection Modal -->
      <div id="preExamSettingsOverlay" class="strict-warning-overlay" style="background:rgba(15,23,42,0.75);backdrop-filter:blur(6px);z-index:100000">
        <div class="strict-warning-box pre-exam-modal-box">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;border-bottom:1px solid var(--ex-border);padding-bottom:11px">
            <span style="font-size:28px">📝</span>
            <div>
              <h3 style="margin:0;font-size:19px;font-weight:800;color:var(--ex-ink)">পরীক্ষার প্রস্তুতি ও সেটিংস</h3>
              <p id="preExamTitle" style="margin:2px 0 0;font-size:13.5px;color:var(--ex-accent);font-weight:600">অনলাইন পরীক্ষা</p>
            </div>
          </div>

          <div id="preExamDetails" class="pre-exam-details-bar">
            <span>মোট প্রশ্ন: <strong id="preExamQCount" style="color:var(--ex-ink)">৫০টি</strong></span>
            <span>বাকি (Unmastered): <strong id="preExamUnmastered" style="color:#f59e0b">৫০টি</strong></span>
            <span>সময়সীমা: <strong id="preExamDuration" style="color:var(--ex-ink)">১৫ মিনিট</strong></span>
          </div>

          <div class="pre-exam-progress-strip" id="preExamMasteryStrip">
            <div class="pre-exam-progress-head">
              <span id="preExamMasteryLabel">সফল অগ্রগতি (Completed): ০% (০/০)</span>
              <span id="preExamCategoryPill" style="font-size:11px;padding:2px 8px;border-radius:99px;background:rgba(56,189,248,0.14);color:var(--ex-accent);font-weight:700">HSC</span>
            </div>
            <div class="set-mastery-bar-track">
              <div class="set-mastery-bar-fill" id="preExamMasteryBar" style="width:0%"></div>
            </div>
          </div>

          <div class="pre-exam-custom-section" id="preExamCustomSection">
            <label style="display:block;font-size:13.5px;font-weight:700;color:var(--ex-ink)">
              কাস্টম অনুশীলন সেটআপ (Custom Practice Setup):
            </label>
            <div class="pre-exam-mode-grid">
              <button type="button" id="optPracticeModeAll" class="pre-exam-mode-card active">
                <input type="radio" name="practiceModeRadio" id="radioModeAll" value="all" checked style="margin-top:3px;accent-color:#10b981;cursor:pointer">
                <div>
                  <div style="font-weight:700;font-size:13px;color:var(--rev-correct)" id="preExamAllLabel">সকল প্রশ্ন (All Questions)</div>
                  <div style="font-size:11.5px;color:var(--ex-muted);margin-top:2px" id="preExamAllSub">সম্পূর্ণ সেট · মূল সময়সীমা</div>
                </div>
              </button>
              <button type="button" id="optPracticeModeCustom" class="pre-exam-mode-card">
                <input type="radio" name="practiceModeRadio" id="radioModeCustom" value="custom" style="margin-top:3px;accent-color:#10b981;cursor:pointer">
                <div>
                  <div style="font-weight:700;font-size:13px;color:var(--ex-ink-soft)">কাস্টম সংখ্যা বেছে নিন</div>
                  <div style="font-size:11.5px;color:var(--ex-muted);margin-top:2px" id="preExamCustomRangeSub">Unmastered অগ্রাধিকার</div>
                </div>
              </button>
            </div>

            <div class="pre-exam-custom-inputs" id="preExamCustomInputs" style="display:none">
              <div class="pre-exam-num-field">
                <label for="inpCustomQCount">প্রশ্নের সংখ্যা (Custom Questions)</label>
                <input type="number" id="inpCustomQCount" min="3" max="49" placeholder="Type 3 - 49" />
                <div class="pre-exam-field-hint" id="customQRangeHint">৩ থেকে সর্বোচ্চ (মোট - ১) পর্যন্ত লিখুন</div>
              </div>
              <div class="pre-exam-num-field">
                <label for="inpCustomMinutes">কাস্টম সময়সীমা (মিনিট · ঐচ্ছিক)</label>
                <input type="number" id="inpCustomMinutes" min="1" placeholder="যেমন: ১০" />
                <div class="pre-exam-field-hint" id="customTimeRuleHint">প্রতি প্রশ্নে সর্বোচ্চ ১ মিনিট</div>
              </div>
            </div>
            <div class="pre-exam-custom-warn" id="preExamCustomWarn" style="display:none"></div>
          </div>

          <label style="display:block;margin-bottom:8px;font-size:14px;font-weight:700;color:var(--ex-ink)">
            মাইনাস মার্কিং (নেগেটিভ মার্কিং) নির্ধারণ করুন:
          </label>

          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px">
            <!-- Option 1: Negative Marking Enabled -->
            <div id="optNegativeEnabled" class="pre-exam-opt-card selected">
              <input type="radio" name="negMarkingRadio" id="radioNegYes" value="yes" checked style="margin-top:3px;accent-color:#10b981;cursor:pointer">
              <div style="flex-grow:1">
                <div class="pre-exam-opt-title" style="color:var(--rev-correct)">মাইনাস মার্কিং চালু রাখুন (ভুল হলে -০.২৫)</div>
                <div class="pre-exam-opt-desc">
                  প্রতি সঠিক উত্তরে <strong style="color:var(--rev-correct)">+১</strong>, ভুল উত্তরের জন্য <strong style="color:var(--rev-wrong)">-০.২৫</strong> নম্বর কাটা যাবে (৪টি ভুল = -১ নম্বর)। কোনো প্রশ্ন <strong style="color:var(--ex-muted-bright)">অনুত্তর রাখলে কোনো নম্বর কাটা যাবে না</strong>।
                </div>
              </div>
            </div>

            <!-- Option 2: Negative Marking Disabled -->
            <div id="optNegativeDisabled" class="pre-exam-opt-card">
              <input type="radio" name="negMarkingRadio" id="radioNegNo" value="no" style="margin-top:3px;accent-color:#10b981;cursor:pointer">
              <div style="flex-grow:1">
                <div class="pre-exam-opt-title">মাইনাস মার্কিং বন্ধ রাখুন (সাধারণ মোড)</div>
                <div class="pre-exam-opt-desc">
                  ভুল উত্তরের জন্য কোনো নম্বর কাটা যাবে না। শুধুমাত্র সঠিক উত্তরের পূর্ণ মান (<strong style="color:var(--rev-correct)">+১</strong>) যোগ হবে।
                </div>
              </div>
            </div>
          </div>

          <div style="display:flex;gap:12px">
            <button id="btnCancelPreExam" type="button" class="btn-back-subjects pre-exam-cancel-btn">
              বাতিল করুন
            </button>
            <button id="btnStartPreExam" type="button" style="flex:1.4;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:10px;padding:11px;font-size:14.5px;font-weight:700;box-shadow:0 4px 14px rgba(16,185,129,0.35);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px">
              পরীক্ষা শুরু করুন ➔
            </button>
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalMarkup;
    document.body.appendChild(wrapper);
    applyPortalTheme(getPortalTheme());
  }

  // 4. Cache DOM references
  function cacheDOMElements() {
    elements = {
      portalOverlay: document.getElementById('examPortalOverlay'),
      btnThemeToggle: document.getElementById('btnExamThemeToggle'),
      btnClose: document.getElementById('btnExamClose'),
      tabBtns: document.querySelectorAll('.exam-tab-btn'),
      panels: {
        assigned: document.getElementById('viewAssigned'),
        subjects: document.getElementById('viewSubjects'),
        leaderboard: document.getElementById('viewLeaderboard'),
        history: document.getElementById('viewHistory'),
        activeExam: document.getElementById('viewActiveExam'),
        result: document.getElementById('viewResult')
      },
      assignedList: document.getElementById('assignedExamsListContainer'),
      subjectsListing: document.getElementById('subjectsListingContainer'),
      subjectGrid: document.getElementById('subjectGridContainer'),
      chaptersListing: document.getElementById('chaptersListingContainer'),
      chaptersGrid: document.getElementById('chaptersGridContainer'),
      btnBackToSubjects: document.getElementById('btnBackToSubjects'),
      selectedSubjectTitle: document.getElementById('selectedSubjectTitle'),
      // Step 3: Chapter Exams
      chapterExamsListing: document.getElementById('chapterExamsListingContainer'),
      chapterExamsGrid: document.getElementById('chapterExamsGridContainer'),
      btnBackToChapters: document.getElementById('btnBackToChapters'),
      selectedChapterExamTitle: document.getElementById('selectedChapterExamTitle'),
      chapterPrevScoreText: document.getElementById('chapterPrevScoreText'),
      chapterPrevScoreBadge: document.getElementById('chapterPrevScoreBadge'),
      // Personal Wrong & Skipped Question Bank
      wrongBankListing: document.getElementById('wrongBankListingContainer'),
      wrongBankQuestionsList: document.getElementById('wrongBankQuestionsList'),
      wrongBankTodayNotice: document.getElementById('wrongBankTodayNotice'),
      btnBackFromWrongBank: document.getElementById('btnBackFromWrongBank'),
      btnStartWrongBankExam: document.getElementById('btnStartWrongBankExam'),
      // Active exam
      activeBadge: document.getElementById('activeExamBadge'),
      activeSubTitle: document.getElementById('activeExamSubjectTitle'),
      pdfToggle: document.getElementById('examPdfToggleWrapper'),
      pdfLink: document.getElementById('examPdfLink'),
      timerDisplay: document.getElementById('examTimerDisplay'),
      circularTimerProgress: document.getElementById('circularTimerProgress'),
      circularTimerContainer: document.getElementById('circularTimerContainer'),
      btnExamSoundToggle: document.getElementById('btnExamSoundToggle'),
      btnExamSoundToggleMobile: document.getElementById('btnExamSoundToggleMobile'),
      mobileTimerDisplay: document.getElementById('mobileExamTimerDisplay'),
      mobileCircularProgress: document.getElementById('mobileCircularProgress'),
      mobileCircularBadge: document.getElementById('mobileCircularBadge'),
      mobileProgressLabel: document.getElementById('mobileExamProgressLabel'),
      stepCounter: document.getElementById('examStepCounter'),
      stepRail: document.getElementById('examStepRail'),
      stepRailScroll: document.getElementById('examStepRailScroll'),
      stepAnsweredStat: document.getElementById('examStepAnsweredStat'),
      sidebarSubMeta: document.getElementById('examSidebarSubMeta'),
      palCountAnswered: document.getElementById('palCountAnswered'),
      palCountFlagged: document.getElementById('palCountFlagged'),
      palCountSkipped: document.getElementById('palCountSkipped'),
      timerBox: document.getElementById('examTimerBox'),
      currentQNum: document.getElementById('currentQNum'),
      totalQNum: document.getElementById('totalQNum'),
      flagBtn: document.getElementById('btnFlagQuestion'),
      flagText: document.getElementById('flagText'),
      qText: document.getElementById('activeQuestionText'),
      qImageWrap: document.getElementById('activeQuestionImageWrap'),
      qImage: document.getElementById('activeQuestionImage'),
      optionsContainer: document.getElementById('activeOptionsContainer'),
      prevBtn: document.getElementById('btnPrevQuestion'),
      nextBtn: document.getElementById('btnNextQuestion'),
      paletteGrid: document.getElementById('questionPaletteGrid'),
      btnConfirmSubmit: document.getElementById('btnConfirmSubmitExam'),
      // Proctoring
      strictOverlay: document.getElementById('strictWarningOverlay'),
      countdownDisplay: document.getElementById('warningCountdownDisplay'),
      btnReturnExam: document.getElementById('btnReturnToExamPrompt'),
      // Submission
      confirmOverlay: document.getElementById('confirmSubmitOverlay'),
      confirmMsg: document.getElementById('confirmSubmitMessage'),
      btnCancelSubmit: document.getElementById('btnCancelSubmitModal'),
      btnFinalSubmit: document.getElementById('btnFinalSubmitModal'),
      // Result
      resultHeroCard: document.getElementById('resultHeroCard'),
      resultHeroIcon: document.getElementById('resultHeroIcon'),
      resultHeroTitle: document.getElementById('resultHeroTitle'),
      resultHeroSub: document.getElementById('resultHeroSub'),
      resScore: document.getElementById('resScore'),
      resPercentage: document.getElementById('resPercentage'),
      resCorrect: document.getElementById('resCorrect'),
      resWrong: document.getElementById('resWrong'),
      resSkipped: document.getElementById('resSkipped'),
      resWrongLabel: document.getElementById('resWrongLabel'),
      resTime: document.getElementById('resTime'),
      btnResultBack: document.getElementById('btnResultBackPortal'),
      btnResultRetake: document.getElementById('btnResultRetake'),
      solutionContainer: document.getElementById('solutionReviewContainer'),
      // Pre-exam Settings
      preExamOverlay: document.getElementById('preExamSettingsOverlay'),
      optNegativeEnabled: document.getElementById('optNegativeEnabled'),
      optNegativeDisabled: document.getElementById('optNegativeDisabled'),
      radioNegYes: document.getElementById('radioNegYes'),
      radioNegNo: document.getElementById('radioNegNo'),
      btnStartPreExam: document.getElementById('btnStartPreExam'),
      btnCancelPreExam: document.getElementById('btnCancelPreExam'),
      // Leaderboard
      leaderboardBody: document.getElementById('examLeaderboardTableBody'),
      btnRefreshLeaderboard: document.getElementById('btnRefreshLeaderboard'),
      // History
      historyBody: document.getElementById('examHistoryTableBody'),
      btnRefreshHistory: document.getElementById('btnRefreshHistory'),
      btnRequestClassChange: document.getElementById('btnRequestClassChange'),
      btnExamBottomLeftBack: document.getElementById('btnExamBottomLeftBack')
    };
  }

  // 5. Global Event Listeners
  function bindGlobalListeners() {
    if (elements.btnThemeToggle) {
      elements.btnThemeToggle.addEventListener('click', () => {
        applyPortalTheme(getPortalTheme() === 'light' ? 'dark' : 'light');
      });
    }
    if (elements.portalOverlay) {
      elements.portalOverlay.addEventListener('click', (e) => {
        const toggleBtn = e.target && e.target.closest ? e.target.closest('.review-breakdown-toggle') : null;
        if (!toggleBtn) return;
        const box = toggleBtn.closest('.review-breakdown-box');
        if (!box) return;
        const isOpen = box.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        const panel = box.querySelector('.review-breakdown-panel');
        if (panel) panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      });
    }
    if (elements.btnClose) elements.btnClose.addEventListener('click', closePortal);

    // Escape & Smart Active Exam Keyboard Navigation
    document.addEventListener('keydown', (e) => {
      if (!elements.portalOverlay || !elements.portalOverlay.classList.contains('active')) return;
      if (e.key === 'Escape') {
        if (!State.isExamRunning) {
          closePortal();
        }
        return;
      }
      if (!State.isExamRunning) return;
      if (elements.confirmOverlay && elements.confirmOverlay.classList.contains('active')) return;
      if (elements.strictOverlay && elements.strictOverlay.classList.contains('active')) return;
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateQuestion(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateQuestion(1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFlag();
      } else {
        const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'ক': 0, 'খ': 1, 'গ': 2, 'ঘ': 3 };
        if (keyMap[e.key] !== undefined) {
          const curQ = State.activeQuestions[State.currentQIndex];
          if (curQ && Array.isArray(curQ.options) && keyMap[e.key] < curQ.options.length) {
            e.preventDefault();
            selectOption(keyMap[e.key]);
          }
        }
      }
    });

    // Tab buttons
    if (elements.tabBtns) {
      elements.tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.tab;
          switchTab(tab);
        });
      });
    }

    // Subjects Back Button
    if (elements.btnBackToSubjects) {
      elements.btnBackToSubjects.addEventListener('click', () => {
        if (elements.chaptersListing) elements.chaptersListing.style.display = 'none';
        if (elements.chapterExamsListing) elements.chapterExamsListing.style.display = 'none';
        if (elements.wrongBankListing) elements.wrongBankListing.style.display = 'none';
        if (elements.subjectsListing) elements.subjectsListing.style.display = 'block';
        State.currentSubject = null;
      });
    }

    // Wrong Bank Chapter Back Button & Exam Trigger
    if (elements.btnBackFromWrongBank) {
      elements.btnBackFromWrongBank.addEventListener('click', () => {
        if (elements.wrongBankListing) elements.wrongBankListing.style.display = 'none';
        if (elements.chaptersListing) elements.chaptersListing.style.display = 'none';
        if (elements.chapterExamsListing) elements.chapterExamsListing.style.display = 'none';
        if (elements.subjectsListing) elements.subjectsListing.style.display = 'block';
        State.currentSubject = null;
        renderSubjectsGrid();
      });
    }

    if (elements.btnStartWrongBankExam) {
      elements.btnStartWrongBankExam.addEventListener('click', () => {
        startWrongBankPracticeExam('archived');
      });
    }

    document.querySelectorAll('.wb-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const f = btn.getAttribute('data-wb-filter') || 'all';
        activeWrongBankFilter = f;
        renderWrongBankChapterView();
      });
    });

    // Step 3 Back to Chapters Button
    if (elements.btnBackToChapters) {
      elements.btnBackToChapters.addEventListener('click', () => {
        if (elements.chapterExamsListing) elements.chapterExamsListing.style.display = 'none';
        if (elements.wrongBankListing) elements.wrongBankListing.style.display = 'none';
        if (elements.chaptersListing) elements.chaptersListing.style.display = 'block';
      });
    }

    // Active Exam Navigation
    if (elements.prevBtn) elements.prevBtn.addEventListener('click', () => navigateQuestion(-1));
    if (elements.nextBtn) {
      elements.nextBtn.addEventListener('click', () => {
        if (State.currentQIndex >= State.activeQuestions.length - 1) {
          showConfirmSubmitModal();
        } else {
          navigateQuestion(1);
        }
      });
    }
    if (elements.flagBtn) elements.flagBtn.addEventListener('click', toggleFlag);
    if (elements.btnConfirmSubmit) elements.btnConfirmSubmit.addEventListener('click', showConfirmSubmitModal);

    // Proctoring Return
    if (elements.btnReturnExam) elements.btnReturnExam.addEventListener('click', closeStrictWarning);

    // Confirm Submission
    if (elements.btnCancelSubmit) {
      elements.btnCancelSubmit.addEventListener('click', () => {
        if (elements.confirmOverlay) elements.confirmOverlay.classList.remove('active');
      });
    }
    if (elements.btnFinalSubmit) {
      elements.btnFinalSubmit.addEventListener('click', () => {
        if (elements.confirmOverlay) elements.confirmOverlay.classList.remove('active');
        finalizeExam(false);
      });
    }

    // Result actions
    if (elements.btnResultBack) {
      elements.btnResultBack.addEventListener('click', () => {
        switchTab('subjects');
      });
    }
    if (elements.btnResultRetake) {
      elements.btnResultRetake.addEventListener('click', () => {
        if (State.activeExam) {
          startExam(State.activeExam);
        }
      });
    }

    // Leaderboard refresh
    if (elements.btnRefreshLeaderboard) {
      elements.btnRefreshLeaderboard.addEventListener('click', loadLeaderboardFromDB);
    }

    // History refresh
    if (elements.btnRefreshHistory) {
      elements.btnRefreshHistory.addEventListener('click', loadUserHistoryFromDB);
    }

    // Add Subject and Chapter buttons
    const btnAddSub = document.getElementById('btnAddNewSubjectModal');
    if (btnAddSub) {
      btnAddSub.addEventListener('click', promptAddNewSubject);
    }
    const btnAddCh = document.getElementById('btnAddNewChapterModal');
    if (btnAddCh) {
      btnAddCh.addEventListener('click', promptAddNewChapter);
    }

    // Class change request button
    if (elements.btnRequestClassChange) {
      elements.btnRequestClassChange.addEventListener('click', promptClassChangeRequest);
    }

    // VIP instant class switcher in Exam Portal
    const vipClassSwitcher = document.getElementById('examPortalVipClassSwitcher');
    if (vipClassSwitcher) {
      vipClassSwitcher.querySelectorAll('.vip-portal-cls-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!isVipPortalUser()) return;
          const targetCls = btn.getAttribute('data-cls');
          if (targetCls) applyVipClassImmediately(targetCls);
        });
      });
    }

    // Solution Review Filters
    document.querySelectorAll('.sol-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sol-filter-btn').forEach((b) => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        renderSolutionReview(false, btn.dataset.filter);
      });
    });

    // Persistent Bottom-Left Back Button
    if (elements.btnExamBottomLeftBack) {
      elements.btnExamBottomLeftBack.addEventListener('click', () => {
        if (elements.wrongBankListing && elements.wrongBankListing.style.display !== 'none') {
          elements.wrongBankListing.style.display = 'none';
          if (elements.subjectsListing) elements.subjectsListing.style.display = 'block';
          State.currentSubject = null;
          renderSubjectsGrid();
        } else if (elements.chapterExamsListing && elements.chapterExamsListing.style.display !== 'none') {
          elements.chapterExamsListing.style.display = 'none';
          elements.chaptersListing.style.display = 'block';
        } else if (elements.chaptersListing && elements.chaptersListing.style.display !== 'none') {
          elements.chaptersListing.style.display = 'none';
          elements.subjectsListing.style.display = 'block';
          State.currentSubject = null;
        } else {
          closePortal();
        }
      });
    }

    // Sound Mute / Unmute Toggle Buttons (Desktop Sidebar + Mobile Header)
    const toggleExamSound = () => {
      State.soundMuted = !State.soundMuted;
      const icon = State.soundMuted ? '🔕' : '🔔';
      const title = State.soundMuted ? 'শব্দ বন্ধ (আনমিউট করতে চাপুন)' : 'শব্দ চালু (মিউট করতে চাপুন)';
      if (elements.btnExamSoundToggle) {
        elements.btnExamSoundToggle.innerText = icon;
        elements.btnExamSoundToggle.title = title;
      }
      if (elements.btnExamSoundToggleMobile) {
        elements.btnExamSoundToggleMobile.innerText = icon;
        elements.btnExamSoundToggleMobile.title = title;
      }
    };
    if (elements.btnExamSoundToggle) {
      elements.btnExamSoundToggle.addEventListener('click', toggleExamSound);
    }
    if (elements.btnExamSoundToggleMobile) {
      elements.btnExamSoundToggleMobile.addEventListener('click', toggleExamSound);
    }

    // Pre-Exam Settings (Negative Marking Choice) Listeners
    if (elements.optNegativeEnabled && elements.optNegativeDisabled && elements.radioNegYes && elements.radioNegNo) {
      elements.optNegativeEnabled.addEventListener('click', () => {
        elements.radioNegYes.checked = true;
        elements.optNegativeEnabled.classList.add('selected');
        elements.optNegativeDisabled.classList.remove('selected');
      });
      elements.optNegativeDisabled.addEventListener('click', () => {
        elements.radioNegNo.checked = true;
        elements.optNegativeDisabled.classList.add('selected');
        elements.optNegativeEnabled.classList.remove('selected');
      });
    }

    if (elements.btnCancelPreExam) {
      elements.btnCancelPreExam.addEventListener('click', () => {
        if (elements.preExamOverlay) elements.preExamOverlay.classList.remove('active');
        pendingExamToStart = null;
      });
    }

    // Custom Practice Setup Mode & Validation Listeners
    const modeAllBtn = document.getElementById('optPracticeModeAll');
    const modeCustomBtn = document.getElementById('optPracticeModeCustom');
    const radioAll = document.getElementById('radioModeAll');
    const radioCustom = document.getElementById('radioModeCustom');
    const inpCustomQ = document.getElementById('inpCustomQCount');
    const inpCustomMin = document.getElementById('inpCustomMinutes');

    if (modeAllBtn && radioAll) {
      modeAllBtn.addEventListener('click', () => {
        radioAll.checked = true;
        if (radioCustom) radioCustom.checked = false;
        syncPreExamCustomPracticeUI(false);
      });
    }
    if (modeCustomBtn && radioCustom) {
      modeCustomBtn.addEventListener('click', () => {
        if (modeCustomBtn.classList.contains('disabled')) return;
        radioCustom.checked = true;
        if (radioAll) radioAll.checked = false;
        syncPreExamCustomPracticeUI(true);
      });
    }
    if (inpCustomQ) {
      inpCustomQ.addEventListener('input', () => syncPreExamCustomPracticeUI(false));
      inpCustomQ.addEventListener('blur', () => syncPreExamCustomPracticeUI(true));
    }
    if (inpCustomMin) {
      inpCustomMin.addEventListener('input', () => syncPreExamCustomPracticeUI(false));
      inpCustomMin.addEventListener('blur', () => syncPreExamCustomPracticeUI(true));
    }

    if (elements.btnStartPreExam) {
      elements.btnStartPreExam.addEventListener('click', () => {
        if (!pendingExamToStart) return;
        const resolved = resolvePreExamStartConfig(pendingExamToStart);
        if (!resolved.valid) {
          return;
        }
        if (elements.preExamOverlay) elements.preExamOverlay.classList.remove('active');
        const isNegative = elements.radioNegYes ? elements.radioNegYes.checked : true;
        executeStartExam(resolved.examConfig, isNegative);
      });
    }

    // Leaderboard filter button & modal (Point 7)
    const btnOpenLbFilter = document.getElementById('btnOpenLeaderboardFilterModal');
    if (btnOpenLbFilter) {
      btnOpenLbFilter.addEventListener('click', (e) => {
        e.preventDefault();
        openLeaderboardFilterModal();
      });
    }

    // Global capture delegation for Filter, Add Chapter, and Add Test Set
    document.addEventListener('click', (e) => {
      const lbBtn = e.target && e.target.closest('#btnOpenLeaderboardFilterModal, .btn-leaderboard-filter, [data-action="open-lb-filter"]');
      if (lbBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openLeaderboardFilterModal === 'function') {
          window.openLeaderboardFilterModal();
        }
      }
    }, true);

    const btnClearFilter = document.getElementById('btnClearFilter');
    if (btnClearFilter) {
      btnClearFilter.addEventListener('click', () => {
        filterAndRenderLeaderboard('all');
      });
    }

    // Leaderboard filter change
    const filterSel = document.getElementById('examFilterSelect');
    if (filterSel) {
      filterSel.addEventListener('change', () => {
        filterAndRenderLeaderboard(filterSel.value);
      });
    }

    // Strict tab switch listeners (20s warning kept intact for tab switching)
    document.addEventListener('visibilitychange', handleVisibilityOrBlur);
    window.addEventListener('blur', handleVisibilityOrBlur);
    // Drift-free timer catch-up listeners when foregrounding from background sleep/tab switch
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && State.isExamRunning) syncExamCountdownTick();
    });
    window.addEventListener('focus', () => {
      if (State.isExamRunning) syncExamCountdownTick();
    });
    window.addEventListener('pageshow', () => {
      if (State.isExamRunning) syncExamCountdownTick();
    });
  }

  function extractBaseExamClass(raw) {
    const s = String(raw || '').toLowerCase();
    if (
      s.includes('bcs') ||
      s.includes('job') ||
      s.includes('graduate') ||
      s.includes('bachelor') ||
      s.includes('honours') ||
      s.includes('hons') ||
      s.includes('masters') ||
      s.includes('degree') ||
      s.includes('বিসিএস') ||
      s.includes('চাকরি') ||
      s.includes('চাকুরী') ||
      s.includes('অনার্স') ||
      s.includes('স্নাতক') ||
      s.includes('মাস্টার্স')
    ) return 'BCS';
    if (s.includes('ssc')) return 'SSC';
    if (s.includes('admission')) return 'Admission';
    if (s.includes('hsc')) return 'HSC';
    return '';
  }

  function isVipPortalUser() {
    const slot = window.me || localStorage.getItem('sr-me') || '';
    return slot === 'p1' || slot === 'p2';
  }

  function getStudentClass() {
    const slot = window.me || localStorage.getItem('sr-me') || '';
    if (window.P && slot && window.P[slot]) {
      const liveRaw = window.P[slot].classBase || window.P[slot].cls || '';
      const liveCls = extractBaseExamClass(liveRaw);
      if (liveCls) {
        try { localStorage.setItem('sr_class', liveCls); } catch (e) {}
        return liveCls;
      }
    }
    const cachedCls = extractBaseExamClass(localStorage.getItem('sr_class'));
    return cachedCls || 'HSC';
  }

  function syncPortalClassUI() {
    activePortalClass = getStudentClass();
    const badge = document.getElementById('userPortalClassBadge');
    if (badge) {
      let label = '🎓 এইচএসসি (HSC)';
      if (activePortalClass === 'SSC') label = '📖 এসএসসি (SSC)';
      else if (activePortalClass === 'Admission') label = '🎯 ভর্তি পরীক্ষা (Admission)';
      else if (activePortalClass === 'BCS') label = '💼 বিসিএস ও চাকরি (BCS / Job)';
      badge.textContent = label;
    }
    const catBadge = document.getElementById('subjectCategoryTitleBadge');
    if (catBadge) {
      catBadge.textContent = activePortalClass === 'BCS' ? 'BCS / Job' : activePortalClass;
    }
    const isVip = isVipPortalUser();
    const regularNote = document.getElementById('examPortalRegularClassNote');
    const vipSwitcher = document.getElementById('examPortalVipClassSwitcher');
    if (regularNote) regularNote.style.display = isVip ? 'none' : 'flex';
    if (vipSwitcher) {
      vipSwitcher.style.display = isVip ? 'flex' : 'none';
      vipSwitcher.querySelectorAll('.vip-portal-cls-btn').forEach((btn) => {
        const isSelected = btn.getAttribute('data-cls') === activePortalClass;
        btn.style.borderColor = isSelected ? '#10b981' : 'rgba(255,255,255,0.18)';
        btn.style.background = isSelected ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.06)';
        btn.style.color = isSelected ? '#34d399' : '#e2e8f0';
      });
    }
  }

  function refreshExamPortalClass() {
    syncPortalClassUI();
    if (elements.portalOverlay && elements.portalOverlay.classList.contains('active')) {
      if (elements.chapterExamsListing) elements.chapterExamsListing.style.display = 'none';
      if (elements.chaptersListing) elements.chaptersListing.style.display = 'none';
      if (elements.wrongBankListing) elements.wrongBankListing.style.display = 'none';
      if (elements.subjectsListing) elements.subjectsListing.style.display = 'block';
      State.currentSubject = null;
      renderSubjectsGrid();
      loadAssignedExamsFromDB();
    }
  }
  window.refreshExamPortalClass = refreshExamPortalClass;

  function applyVipClassImmediately(targetCls, yearOptional) {
    const cleanCls = extractBaseExamClass(targetCls) || 'HSC';
    const slot = window.me || localStorage.getItem('sr-me') || '';
    const roomCode = window.CODE || localStorage.getItem('sr-code') || '';
    if (!slot || (slot !== 'p1' && slot !== 'p2')) return;

    const curObj = (window.P && window.P[slot]) ? window.P[slot] : {};
    let passingYear = yearOptional !== undefined ? String(yearOptional || '').trim() : (curObj.passingYear || '');
    if (!passingYear && curObj.cls) {
      const m = String(curObj.cls).match(/\b(20\d{2})\b/);
      if (m) passingYear = m[1];
    }
    const fullCls = cleanCls + (passingYear ? ` (${passingYear})` : '');

    try { localStorage.setItem('sr_class', cleanCls); } catch (e) {}
    if (window.P && window.P[slot]) {
      window.P[slot].cls = fullCls;
      window.P[slot].classBase = cleanCls;
      if (passingYear) window.P[slot].passingYear = passingYear;
    }

    const REST = getREST();
    if (REST) {
      const patch = { cls: fullCls, classBase: cleanCls };
      if (passingYear) patch.passingYear = passingYear;
      REST.update(`vip_users/${slot}`, patch).catch(() => {});
      REST.update(`rooms/1432014310/${slot}`, patch).catch(() => {});
      if (roomCode && roomCode !== '1432014310') {
        REST.update(`rooms_v2/${roomCode}/members/${slot}`, patch).catch(() => {});
        REST.update(`rooms_v2/${roomCode}/${slot}`, patch).catch(() => {});
      }
    }

    refreshExamPortalClass();
  }

  // 6. Navigation & Tab Switcher
  function openPortal(initialTab = 'assigned', opts = {}) {
    // পরীক্ষার পেজে অপ্রয়োজনীয় ব্যাকগ্রাউন্ড সকেট বন্ধ রাখা (goOfflineDB)
    if (typeof window.enterExamOfflineMode === 'function') {
      window.enterExamOfflineMode();
    } else if (typeof window.goOfflineDB === 'function') {
      window.goOfflineDB();
    }
    elements.portalOverlay.classList.add('active');
    syncPortalClassUI();
    renderPendingExamQueueBar();
    checkStaleOrCancelledExamSessionNotice();
    Promise.all([
      syncWrongBankFromDB().catch(() => []),
      syncSetProgressFromDB().catch(() => ({}))
    ]).then(() => {
      if (State.currentTab === 'subjects' && elements.wrongBankListing && elements.wrongBankListing.style.display !== 'none') {
        renderWrongBankChapterView();
      } else if (State.currentTab === 'subjects' && elements.subjectsListing && elements.subjectsListing.style.display !== 'none') {
        renderSubjectsGrid();
      } else if (State.currentTab === 'assigned') {
        loadAssignedExamsFromDB();
      }
    });
    if (opts && opts.openWrongBank) {
      switchTab('subjects', { keepSubView: true });
      openWrongBankChapterView();
      return;
    }
    switchTab(initialTab);
  }

  function syncFloatingBackButtonVisibility() {
    if (!elements.btnExamBottomLeftBack) return;
    const isActiveExamView = !!(elements.panels.activeExam && elements.panels.activeExam.classList.contains('active'));
    elements.btnExamBottomLeftBack.style.display = isActiveExamView ? 'none' : 'inline-flex';
  }

  function closePortal() {
    if (State.isExamRunning) {
      showConfirmSubmitModal();
      return;
    }
    setActiveExamViewportLock(false);
    detachActiveExamExitGuards();
    elements.portalOverlay.classList.remove('active');
    if (typeof window.exitExamOfflineMode === 'function') {
      window.exitExamOfflineMode();
    }
  }

  function switchTab(tabKey, opts = {}) {
    if (State.isExamRunning) {
      showExamNotice('পরীক্ষা চলাকালীন ট্যাব পরিবর্তন করা যাবে না। শেষ করতে "পরীক্ষা জমা দিন" চাপুন।');
      return;
    }
    State.currentTab = tabKey;
    elements.tabBtns.forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tabKey);
    });

    Object.keys(elements.panels).forEach((k) => {
      if (elements.panels[k]) elements.panels[k].classList.remove('active');
    });

    if (elements.panels[tabKey]) {
      elements.panels[tabKey].classList.add('active');
    }
    syncFloatingBackButtonVisibility();

    if (tabKey === 'subjects') {
      if (!opts.keepSubView) {
        if (elements.wrongBankListing) elements.wrongBankListing.style.display = 'none';
        if (elements.chaptersListing) elements.chaptersListing.style.display = 'none';
        if (elements.chapterExamsListing) elements.chapterExamsListing.style.display = 'none';
        if (elements.subjectsListing) elements.subjectsListing.style.display = 'block';
        State.currentSubject = null;
        renderSubjectsGrid();
      }
    } else if (tabKey === 'assigned') {
      loadAssignedExamsFromDB();
    } else if (tabKey === 'leaderboard') {
      loadLeaderboardFromDB();
    } else if (tabKey === 'history') {
      loadUserHistoryFromDB();
    }
  }

  // Per-User Wrong & Skipped Question Bank Helpers (Isolated by Active User)
  let activeWrongBankFilter = 'all';
  const WRONG_BANK_MAX_ITEMS = 400;

  function getLocalDateKey(ts) {
    const d = new Date(Number(ts) || Date.now());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getActiveUserSlot() {
    return (typeof window.me === 'string' && window.me) ? window.me : (localStorage.getItem('sr-me') || '');
  }

  function getActiveUserUid() {
    const slot = getActiveUserSlot();
    const roomCode = window.CODE || localStorage.getItem('sr-code') || 'room';
    if (window.P && slot && window.P[slot] && window.P[slot].uid) {
      return String(window.P[slot].uid).trim();
    }
    if (window.P && window.P.members && slot && window.P.members[slot] && window.P.members[slot].uid) {
      return String(window.P.members[slot].uid).trim();
    }
    if (slot === 'p1' || slot === 'p2') {
      const scopedVip = localStorage.getItem('sr_uid_vip_' + slot);
      if (scopedVip) return String(scopedVip).trim();
    } else if (slot) {
      const scoped = localStorage.getItem(`sr_uid_${roomCode}_${slot}`);
      if (scoped) return String(scoped).trim();
    }
    return String(localStorage.getItem('sr_uid') || '').trim();
  }

  function getUserWrongBankKey() {
    const slot = getActiveUserSlot();
    const roomCode = (window.CODE || localStorage.getItem('sr-code') || 'room');
    const uid = getActiveUserUid();
    let raw = '';
    if (uid && /^\d{4,10}$/.test(uid)) {
      raw = uid;
    } else if (slot) {
      raw = `${roomCode}_${slot}`;
    } else {
      raw = `${roomCode}_guest`;
    }
    return String(raw).replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  function getUserHistoryStorageKey() {
    return 'sr_exam_history_' + getUserWrongBankKey();
  }

  function getActiveUserDisplayName() {
    const slot = getActiveUserSlot();
    if (window.P && slot && window.P[slot] && window.P[slot].name) {
      return String(window.P[slot].name).trim();
    }
    return (localStorage.getItem('sr-name') || '').trim() || 'শিক্ষার্থী';
  }

  function sanitizeQuestionImageUrl(raw) {
    if (!raw || typeof raw !== 'string') return '';
    const s = raw.trim();
    if (!s || s === 'null' || s === 'undefined') return '';
    if (/^https?:\/\//i.test(s) || /^\/(?!\/)/.test(s) || /^(?:img|assets)\//i.test(s)) {
      return s;
    }
    if (/^data:image\/(?:png|jpeg|jpg|gif|webp|svg\+xml|bmp|avif);base64,[a-z0-9+/=]+$/i.test(s)) {
      return s;
    }
    return '';
  }

  function formatQuestionExtraBlockHTML(label, val, boxClass) {
    if (val === null || val === undefined) return '';
    let contentHtml = '';
    if (Array.isArray(val)) {
      const items = val.map((x) => (x === null || x === undefined ? '' : String(x).trim())).filter(Boolean);
      if (!items.length) return '';
      contentHtml = `<ul class="review-extra-list">${items.map((x) => `<li>${escHtml(x)}</li>`).join('')}</ul>`;
    } else if (typeof val === 'object') {
      const entries = Object.keys(val)
        .map((k) => {
          const v = val[k];
          if (v === null || v === undefined || String(v).trim() === '') return '';
          return `<li><strong>${escHtml(k)}:</strong> ${escHtml(String(v).trim())}</li>`;
        })
        .filter(Boolean);
      if (!entries.length) return '';
      contentHtml = `<ul class="review-extra-list">${entries.join('')}</ul>`;
    } else {
      const txt = String(val).trim();
      if (!txt) return '';
      contentHtml = `<span>${escHtml(txt).replace(/\r?\n/g, '<br>')}</span>`;
    }
    if (boxClass === 'review-breakdown-box') {
      return `
        <div class="${boxClass} review-breakdown-accordion">
          <button type="button" class="review-breakdown-toggle" aria-expanded="false">
            <span class="review-breakdown-title">${escHtml(label)}</span>
            <span class="review-breakdown-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </button>
          <div class="review-breakdown-panel" aria-hidden="true">
            <div class="review-breakdown-panel-inner">
              <div class="review-breakdown-panel-body">${contentHtml}</div>
            </div>
          </div>
        </div>
      `;
    }
    return `<div class="${boxClass}"><strong>${escHtml(label)}:</strong> ${contentHtml}</div>`;
  }

  function formatQuestionExtrasHTML(q) {
    if (!q || typeof q !== 'object') return '';
    const expHtml = formatQuestionExtraBlockHTML('ব্যাখ্যা', q.explanation, 'review-explanation-box');
    const tricksVal = (q.tricks !== undefined && q.tricks !== null) ? q.tricks : q.trics;
    const tricksHtml = formatQuestionExtraBlockHTML('Trics.', tricksVal, 'review-tricks-box');
    const breakdownHtml = formatQuestionExtraBlockHTML('Option Breakdown', q.optionBreakdown, 'review-breakdown-box');
    return expHtml + tricksHtml + breakdownHtml;
  }

  function makeWrongQuestionKey(q) {
    const baseQ = String((q && q.question) || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const opts = Array.isArray(q && q.options)
      ? q.options.slice(0, 2).map((o) => String(o || '').trim().toLowerCase().replace(/\s+/g, ' ')).join('|')
      : '';
    return `${baseQ}__${opts}`;
  }

  function encodeSetQuestionKey(q) {
    const raw = makeWrongQuestionKey(q);
    let h1 = 0x811c9dc5;
    let h2 = 0x01000193;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw.charCodeAt(i);
      h1 ^= ch;
      h1 = Math.imul(h1, 0x01000193);
      h2 = Math.imul(h2 + ch, 31) >>> 0;
    }
    return 'q_' + (h1 >>> 0).toString(36) + '_' + (h2 >>> 0).toString(36) + '_' + raw.length;
  }

  function normalizeSafeSetId(rawId) {
    const clean = String(rawId || 'default_set').trim().replace(/[.$#\[\]\/]/g, '_');
    return clean || 'default_set';
  }

  function readLocalSetProgressAll(userKey) {
    const uKey = userKey || getUserWrongBankKey();
    try {
      const obj = JSON.parse(localStorage.getItem('sr_set_progress_' + uKey) || '{}');
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (e) {
      return {};
    }
  }

  function writeLocalSetProgressAll(userKey, allObj) {
    const uKey = userKey || getUserWrongBankKey();
    try {
      localStorage.setItem('sr_set_progress_' + uKey, JSON.stringify(allObj || {}));
    } catch (e) {}
  }

  function mergeSetProgressEntry(localEntry, remoteEntry) {
    const l = (localEntry && typeof localEntry === 'object') ? localEntry : {};
    const r = (remoteEntry && typeof remoteEntry === 'object') ? remoteEntry : {};
    const lSt = (l.statuses && typeof l.statuses === 'object') ? l.statuses : {};
    const rSt = (r.statuses && typeof r.statuses === 'object') ? r.statuses : {};
    const lTs = Number(l.updatedAt) || 0;
    const rTs = Number(r.updatedAt) || 0;
    const statuses = (lTs >= rTs) ? Object.assign({}, rSt, lSt) : Object.assign({}, lSt, rSt);
    return { updatedAt: Math.max(lTs, rTs, Date.now()), statuses };
  }

  function syncSetProgressFromDB(userKey) {
    const REST = getREST();
    const uKey = userKey || getUserWrongBankKey();
    const localAll = readLocalSetProgressAll(uKey);
    if (!REST || !uKey) return Promise.resolve(localAll);
    return REST.get(`user_exam_history/set_progress/${uKey}`).then((remoteAll) => {
      if (!remoteAll || typeof remoteAll !== 'object') return localAll;
      const merged = Object.assign({}, localAll);
      Object.keys(remoteAll).forEach((sid) => {
        if (remoteAll[sid] && typeof remoteAll[sid] === 'object') {
          merged[sid] = mergeSetProgressEntry(localAll[sid], remoteAll[sid]);
        }
      });
      writeLocalSetProgressAll(uKey, merged);
      return merged;
    }).catch(() => localAll);
  }

  function getSetProgressStatuses(setId, userKey) {
    const sid = normalizeSafeSetId(setId);
    const all = readLocalSetProgressAll(userKey);
    const entry = all[sid];
    return (entry && entry.statuses && typeof entry.statuses === 'object') ? entry.statuses : {};
  }

  function computeSetProgressStats(setId, questions, userKey) {
    const list = Array.isArray(questions) ? questions : [];
    const total = list.length;
    const statuses = getSetProgressStatuses(setId, userKey);
    const masteredList = [];
    const unmasteredList = [];
    let wrongCount = 0;
    let skippedCount = 0;
    let unattemptedCount = 0;

    list.forEach((q) => {
      const st = statuses[encodeSetQuestionKey(q)];
      if (st === 'correct') {
        masteredList.push(q);
      } else {
        unmasteredList.push(q);
        if (st === 'wrong') wrongCount++;
        else if (st === 'skipped') skippedCount++;
        else unattemptedCount++;
      }
    });

    const masteredCount = masteredList.length;
    const remainingUnmastered = unmasteredList.length;
    const pct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
    return {
      total,
      masteredCount,
      remainingUnmastered,
      wrongCount,
      skippedCount,
      unattemptedCount,
      pct,
      masteredList,
      unmasteredList
    };
  }

  function recordSetQuestionProgress(setId, questions, userAnswers, userKey) {
    if (!setId || !Array.isArray(questions) || !questions.length) return Promise.resolve();
    const uKey = userKey || getUserWrongBankKey();
    const sid = normalizeSafeSetId(setId);
    const all = readLocalSetProgressAll(uKey);
    const cur = (all[sid] && typeof all[sid] === 'object') ? all[sid] : { updatedAt: 0, statuses: {} };
    const nextStatuses = Object.assign({}, cur.statuses || {});

    questions.forEach((q, idx) => {
      const qKey = encodeSetQuestionKey(q);
      const isAnswered = userAnswers && Object.prototype.hasOwnProperty.call(userAnswers, idx) &&
                         userAnswers[idx] !== undefined && userAnswers[idx] !== null && userAnswers[idx] !== '';
      const correctIdx = getQuestionCorrectIndex(q);
      if (!isAnswered) {
        nextStatuses[qKey] = 'skipped';
      } else if (Number(userAnswers[idx]) === correctIdx) {
        nextStatuses[qKey] = 'correct';
      } else {
        nextStatuses[qKey] = 'wrong';
      }
    });

    const entry = { updatedAt: Date.now(), statuses: nextStatuses };
    all[sid] = entry;
    writeLocalSetProgressAll(uKey, all);

    const REST = getREST();
    if (REST && uKey) {
      return REST.set(`user_exam_history/set_progress/${uKey}/${sid}`, entry).catch(() => null);
    }
    return Promise.resolve();
  }

  function shuffleArrayCopy(arr) {
    const copy = (arr || []).slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function buildCustomExamSelection(allQuestions, setId, customCount) {
    const list = Array.isArray(allQuestions) ? allQuestions.slice() : [];
    const targetN = Math.max(1, Math.min(list.length, Number(customCount) || list.length));
    if (targetN >= list.length) {
      return list;
    }
    const { unmasteredList, masteredList } = computeSetProgressStats(setId, list);
    const shuffledUnmastered = shuffleArrayCopy(unmasteredList);
    if (targetN <= shuffledUnmastered.length) {
      return shuffledUnmastered.slice(0, targetN);
    }
    const neededBackfill = targetN - shuffledUnmastered.length;
    const shuffledMastered = shuffleArrayCopy(masteredList).slice(0, neededBackfill);
    return shuffledUnmastered.concat(shuffledMastered);
  }

  function normalizeWrongBankItem(it) {
    if (!it || typeof it !== 'object' || !it.question) return null;
    const ts = Number(it.timestamp) || Date.now();
    const fp = it.fingerprint || makeWrongQuestionKey(it);
    const out = {
      fingerprint: fp,
      question: String(it.question),
      options: Array.isArray(it.options) ? it.options.map((o) => String(o == null ? '' : o)) : [],
      correct: Number.isFinite(Number(it.correct)) ? Number(it.correct) : 0,
      explanation: it.explanation ? String(it.explanation) : '',
      userAnswer: (it.userAnswer === null || it.userAnswer === undefined) ? null : Number(it.userAnswer),
      status: it.status === 'skipped' ? 'skipped' : 'wrong',
      examTitle: String(it.examTitle || 'অনুশীলন পরীক্ষা'),
      subjectName: String(it.subjectName || ''),
      classCategory: String(it.classCategory || ''),
      timestamp: ts,
      dateKey: it.dateKey || getLocalDateKey(ts)
    };
    const imgUrl = sanitizeQuestionImageUrl(it.image);
    if (imgUrl) out.image = imgUrl;
    if (it.tricks !== undefined && it.tricks !== null && it.tricks !== '') out.tricks = it.tricks;
    if (it.optionBreakdown !== undefined && it.optionBreakdown !== null && it.optionBreakdown !== '') out.optionBreakdown = it.optionBreakdown;
    return out;
  }

  function mergeWrongBankLists(listA, listB) {
    const map = new Map();
    const pushItem = (raw) => {
      const item = normalizeWrongBankItem(raw);
      if (!item) return;
      const prev = map.get(item.fingerprint);
      if (!prev || item.timestamp >= prev.timestamp) {
        map.set(item.fingerprint, item);
      }
    };
    (Array.isArray(listA) ? listA : []).forEach(pushItem);
    (Array.isArray(listB) ? listB : []).forEach(pushItem);
    return Array.from(map.values())
      .sort((a, b) => (b.timestamp - a.timestamp))
      .slice(0, WRONG_BANK_MAX_ITEMS);
  }

  function readLocalWrongBank(userKey) {
    const key = userKey || getUserWrongBankKey();
    try {
      const raw = JSON.parse(localStorage.getItem('sr_wrong_qns_' + key) || '[]');
      const slot = getActiveUserSlot();
      const roomCode = (window.CODE || localStorage.getItem('sr-code') || 'room');
      const legacySlotKey = slot ? `${roomCode}_${slot}`.replace(/[^a-zA-Z0-9_-]/g, '_') : '';
      if (legacySlotKey && legacySlotKey !== key) {
        const legacyRaw = JSON.parse(localStorage.getItem('sr_wrong_qns_' + legacySlotKey) || '[]');
        if (Array.isArray(legacyRaw) && legacyRaw.length > 0) {
          const combined = mergeWrongBankLists(raw, legacyRaw);
          localStorage.setItem('sr_wrong_qns_' + key, JSON.stringify(combined));
          localStorage.removeItem('sr_wrong_qns_' + legacySlotKey);
          localStorage.setItem('sr_wrong_qns_dirty_' + key, '1');
          return combined;
        }
      }
      return mergeWrongBankLists(raw, []);
    } catch (e) {
      return [];
    }
  }

  function writeLocalWrongBank(userKey, list) {
    const key = userKey || getUserWrongBankKey();
    const cleaned = mergeWrongBankLists(list, []);
    try {
      localStorage.setItem('sr_wrong_qns_' + key, JSON.stringify(cleaned));
    } catch (e) {}
    return cleaned;
  }

  function getPartitionedWrongBank(userKey) {
    const key = userKey || getUserWrongBankKey();
    const all = readLocalWrongBank(key);
    const todayKey = getLocalDateKey(Date.now());
    const todayItems = [];
    const archivedItems = [];
    all.forEach((item) => {
      const dKey = item.dateKey || getLocalDateKey(item.timestamp);
      if (dKey === todayKey) {
        todayItems.push(item);
      } else {
        archivedItems.push(item);
      }
    });
    todayItems.sort((a, b) => b.timestamp - a.timestamp);
    archivedItems.sort((a, b) => b.timestamp - a.timestamp);
    return { all, todayItems, archivedItems, todayKey, userKey: key };
  }

  function getUserWrongBankStats() {
    const part = getPartitionedWrongBank();
    return {
      userKey: part.userKey,
      totalCount: part.all.length,
      todayCount: part.todayItems.length,
      archivedCount: part.archivedItems.length
    };
  }
  window.getUserWrongBankStats = getUserWrongBankStats;

  function readWrongBankDeletedMap(userKey) {
    try {
      const obj = JSON.parse(localStorage.getItem('sr_wrong_qns_del_' + userKey) || '{}');
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (e) {
      return {};
    }
  }

  function writeWrongBankDeletedMap(userKey, map) {
    try {
      if (!map || Object.keys(map).length === 0) {
        localStorage.removeItem('sr_wrong_qns_del_' + userKey);
      } else {
        localStorage.setItem('sr_wrong_qns_del_' + userKey, JSON.stringify(map));
      }
    } catch (e) {}
  }

  function syncWrongBankFromDB() {
    const REST = getREST();
    const userKey = getUserWrongBankKey();
    const localList = readLocalWrongBank(userKey);
    if (!REST || !userKey) {
      return Promise.resolve(localList);
    }
    return REST.get(`user_exam_history/wrong_bank/${userKey}`).then((remoteRaw) => {
      const delMap = readWrongBankDeletedMap(userKey);
      const rawItems = Array.isArray(remoteRaw)
        ? remoteRaw
        : (remoteRaw && Array.isArray(remoteRaw.items)
          ? remoteRaw.items
          : (remoteRaw && typeof remoteRaw === 'object' ? Object.values(remoteRaw) : []));
      const filteredRemote = rawItems.filter((it) => {
        const norm = normalizeWrongBankItem(it);
        if (!norm) return false;
        const delTs = Number(delMap[norm.fingerprint] || 0);
        return !(delTs && delTs >= norm.timestamp);
      });
      const merged = writeLocalWrongBank(userKey, mergeWrongBankLists(localList, filteredRemote));
      let isDirty = false;
      try { isDirty = localStorage.getItem('sr_wrong_qns_dirty_' + userKey) === '1'; } catch (e) {}
      if (isDirty || merged.length !== rawItems.length) {
        REST.set(`user_exam_history/wrong_bank/${userKey}`, {
          updatedAt: Date.now(),
          items: merged
        }).then(() => {
          try { localStorage.removeItem('sr_wrong_qns_dirty_' + userKey); } catch (e) {}
          writeWrongBankDeletedMap(userKey, {});
        }).catch(() => {});
      }
      return merged;
    }).catch(() => localList);
  }

  function recordWrongBankItems(newWrongSkippedItems, targetUserKey) {
    const userKey = targetUserKey || getUserWrongBankKey();
    if (!Array.isArray(newWrongSkippedItems) || newWrongSkippedItems.length === 0) {
      return Promise.resolve(readLocalWrongBank(userKey));
    }
    const delMap = readWrongBankDeletedMap(userKey);
    newWrongSkippedItems.forEach((it) => {
      if (it && it.fingerprint && delMap[it.fingerprint]) {
        delete delMap[it.fingerprint];
      }
    });
    writeWrongBankDeletedMap(userKey, delMap);

    const localList = readLocalWrongBank(userKey);
    const merged = writeLocalWrongBank(userKey, mergeWrongBankLists(newWrongSkippedItems, localList));
    const REST = getREST();
    if (!REST) {
      try { localStorage.setItem('sr_wrong_qns_dirty_' + userKey, '1'); } catch (e) {}
      return Promise.resolve(merged);
    }
    return REST.set(`user_exam_history/wrong_bank/${userKey}`, {
      updatedAt: Date.now(),
      items: merged
    }).then(() => {
      try { localStorage.removeItem('sr_wrong_qns_dirty_' + userKey); } catch (e) {}
      writeWrongBankDeletedMap(userKey, {});
      return merged;
    }).catch(() => {
      try { localStorage.setItem('sr_wrong_qns_dirty_' + userKey, '1'); } catch (e) {}
      return merged;
    });
  }

  function removeWrongBankItem(fingerprint) {
    const userKey = getUserWrongBankKey();
    const delMap = readWrongBankDeletedMap(userKey);
    delMap[fingerprint] = Date.now();
    writeWrongBankDeletedMap(userKey, delMap);

    const remaining = readLocalWrongBank(userKey).filter((x) => x.fingerprint !== fingerprint);
    writeLocalWrongBank(userKey, remaining);
    const REST = getREST();
    if (REST) {
      REST.set(`user_exam_history/wrong_bank/${userKey}`, {
        updatedAt: Date.now(),
        items: remaining
      }).then(() => {
        try { localStorage.removeItem('sr_wrong_qns_dirty_' + userKey); } catch (e) {}
        writeWrongBankDeletedMap(userKey, {});
      }).catch(() => {
        try { localStorage.setItem('sr_wrong_qns_dirty_' + userKey, '1'); } catch (e) {}
      });
    } else {
      try { localStorage.setItem('sr_wrong_qns_dirty_' + userKey, '1'); } catch (e) {}
    }
    return remaining;
  }

  function startWrongBankPracticeExam(scope) {
    const { todayItems, archivedItems } = getPartitionedWrongBank();
    const sourceItems = scope === 'today' ? todayItems : archivedItems;
    if (!sourceItems.length) {
      showExamNotice(scope === 'today'
        ? 'আজকের কোনো ভুল বা স্কিপ করা প্রশ্ন নেই।'
        : '"আমার ভুল করা প্রশ্ন" অধ্যায়ে এখনো কোনো ১+ দিন আগের প্রশ্ন জমা হয়নি।');
      return;
    }
    const questions = sourceItems.map((item) => {
      const qObj = {
        question: item.question,
        options: Array.isArray(item.options) ? item.options.slice() : [],
        correct: item.correct,
        explanation: item.explanation || ''
      };
      if (item.image) qObj.image = item.image;
      if (item.tricks !== undefined && item.tricks !== null && item.tricks !== '') qObj.tricks = item.tricks;
      if (item.optionBreakdown !== undefined && item.optionBreakdown !== null && item.optionBreakdown !== '') qObj.optionBreakdown = item.optionBreakdown;
      return qObj;
    });
    const durMin = Math.max(5, Math.min(60, Math.ceil(questions.length * 0.6)));
    verifyNotBlocked(() => {
      startExam({
        id: `wrong_bank_${scope}_${Date.now()}`,
        title: scope === 'today'
          ? `আজকের ভুল ও স্কিপ করা প্রশ্ন (${toBn(questions.length)}টি)`
          : `আমার ভুল করা প্রশ্ন (${toBn(questions.length)}টি)`,
        subjectName: 'আমার ভুল করা প্রশ্ন',
        durationMinutes: durMin,
        questions: questions,
        isWrongBankExam: true
      });
    });
  }

  function formatWrongItemDate(ts) {
    try {
      return new Date(ts).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function createWrongBankReviewCard(item, idx, opts = {}) {
    const letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
    const isSkipped = item.status === 'skipped';
    const userChoiceText = (!isSkipped && item.userAnswer !== null && item.options && item.options[item.userAnswer] !== undefined)
      ? escHtml(`${letters[item.userAnswer] || (item.userAnswer + 1)}. ${item.userAnswer >= 0 ? item.options[item.userAnswer] : ''}`)
      : '<span class="wb-skipped-note">স্কিপ করা হয়েছিল (কোনো উত্তর দেওয়া হয়নি)</span>';
    const correctChoiceText = (item.options && item.options[item.correct] !== undefined)
      ? escHtml(`${letters[item.correct] || (item.correct + 1)}. ${item.options[item.correct]}`)
      : '';
    const statusBadge = isSkipped
      ? '<span class="wb-status-badge is-skipped">⚪ স্কিপ করা</span>'
      : '<span class="wb-status-badge is-wrong">✕ ভুল উত্তর</span>';
    const safeImg = sanitizeQuestionImageUrl(item.image);

    const card = document.createElement('div');
    card.className = 'wb-review-card';
    card.innerHTML = `
      <div class="wb-card-top">
        <div class="wb-card-meta">
          <span class="wb-q-num">#${toBn(idx + 1)}</span>
          ${statusBadge}
          <span class="wb-card-date">${escHtml(item.examTitle)}${item.timestamp ? ' · ' + escHtml(formatWrongItemDate(item.timestamp)) : ''}</span>
        </div>
        <button type="button" class="btn-wb-mastered">✓ শিখেছি (সরান)</button>
      </div>
      <div class="wb-q-title">${escHtml(item.question)}</div>
      ${safeImg ? `<div class="review-question-image-wrap"><img src="${escHtml(safeImg)}" class="review-question-image" alt="প্রশ্নের ছবি" loading="lazy" onerror="this.parentNode.style.display='none'" /></div>` : ''}
      <div class="wb-ans-summary">
        <div class="${isSkipped ? 'wb-ans-skipped' : 'wb-ans-wrong'}"><strong>আপনার উত্তর:</strong> ${userChoiceText}</div>
        <div class="wb-ans-correct"><strong>সঠিক উত্তর:</strong> ${correctChoiceText}</div>
      </div>
      ${formatQuestionExtrasHTML(item)}
    `;
    const delBtn = card.querySelector('.btn-wb-mastered');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        removeWrongBankItem(item.fingerprint);
        showExamNotice('✓ প্রশ্নটি "আমার ভুল করা প্রশ্ন" থেকে সরানো হয়েছে।');
        if (typeof opts.onRemoved === 'function') opts.onRemoved();
      });
    }
    return card;
  }

  function openWrongBankChapterView() {
    if (!elements.wrongBankListing) return;
    if (elements.subjectsListing) elements.subjectsListing.style.display = 'none';
    if (elements.chaptersListing) elements.chaptersListing.style.display = 'none';
    if (elements.chapterExamsListing) elements.chapterExamsListing.style.display = 'none';
    elements.wrongBankListing.style.display = 'block';
    renderWrongBankChapterView();
  }

  function renderWrongBankChapterView() {
    if (!elements.wrongBankListing) return;
    const { todayItems, archivedItems } = getPartitionedWrongBank();
    const userName = getActiveUserDisplayName();

    const subEl = document.getElementById('wrongBankUserSub');
    if (subEl) {
      subEl.textContent = `${userName}-এর ব্যক্তিগত অধ্যায় · ১+ দিন আগের ভুল ও স্কিপ করা প্রশ্ন (সর্বশেষ আগে)`;
    }

    const wrongCount = archivedItems.filter((x) => x.status !== 'skipped').length;
    const skippedCount = archivedItems.filter((x) => x.status === 'skipped').length;
    const cAll = document.getElementById('wbCountAll');
    const cWrong = document.getElementById('wbCountWrong');
    const cSkipped = document.getElementById('wbCountSkipped');
    if (cAll) cAll.textContent = toBn(archivedItems.length);
    if (cWrong) cWrong.textContent = toBn(wrongCount);
    if (cSkipped) cSkipped.textContent = toBn(skippedCount);

    document.querySelectorAll('.wb-filter-btn').forEach((btn) => {
      const f = btn.getAttribute('data-wb-filter') || 'all';
      const isAct = f === activeWrongBankFilter;
      btn.classList.toggle('active', isAct);
    });

    if (elements.btnStartWrongBankExam) {
      elements.btnStartWrongBankExam.style.display = archivedItems.length > 0 ? 'inline-flex' : 'none';
    }

    if (elements.wrongBankTodayNotice) {
      if (todayItems.length > 0) {
        elements.wrongBankTodayNotice.style.display = 'flex';
        elements.wrongBankTodayNotice.innerHTML = `
          <div style="font-size:13px;line-height:1.45">
            <strong>📅 আজকের পরীক্ষায় ভুল/স্কিপ করা ${toBn(todayItems.length)}টি প্রশ্ন</strong> আজকের জন্য
            <strong>"আজকের ও নির্ধারিত পরীক্ষা সমূহ"</strong> ট্যাবে রাখা হয়েছে। ১ দিন পর সেগুলো স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।
          </div>
          <button type="button" id="btnGoToTodayWrongExams" style="padding:7px 13px;border-radius:9px;border:none;background:#0284c7;color:#fff;font-weight:700;font-size:12.5px;cursor:pointer;white-space:nowrap">আজকের প্রশ্ন দেখুন →</button>
        `;
        const goBtn = document.getElementById('btnGoToTodayWrongExams');
        if (goBtn) {
          goBtn.onclick = () => switchTab('assigned');
        }
      } else {
        elements.wrongBankTodayNotice.style.display = 'none';
        elements.wrongBankTodayNotice.innerHTML = '';
      }
    }

    if (!elements.wrongBankQuestionsList) return;
    elements.wrongBankQuestionsList.innerHTML = '';

    const visibleList = archivedItems.filter((item) => {
      if (activeWrongBankFilter === 'wrong') return item.status !== 'skipped';
      if (activeWrongBankFilter === 'skipped') return item.status === 'skipped';
      return true;
    });

    if (archivedItems.length === 0) {
      elements.wrongBankQuestionsList.innerHTML = `
        <div style="text-align:center;padding:38px 20px;background:rgba(15,23,42,0.72);border:1.5px dashed rgba(148,163,184,0.28);border-radius:16px;color:#cbd5e1">
          <div style="font-size:34px;margin-bottom:8px">📘</div>
          <h4 style="margin:0 0 6px;font-size:16px;color:#f8fafc">"আমার ভুল করা প্রশ্ন" অধ্যায়টি এখন খালি</h4>
          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.55">
            ${todayItems.length > 0
              ? `আজকে করা পরীক্ষার ${toBn(todayItems.length)}টি ভুল/স্কিপ করা প্রশ্ন আজকের জন্য "আজকের ও নির্ধারিত পরীক্ষা সমূহ" ট্যাবে রয়েছে — ১ দিন পর সেগুলো এখানে যুক্ত হবে।`
              : 'যেকোনো পরীক্ষায় ভুল উত্তর দিলে বা স্কিপ করলে সঠিক প্রশ্ন বাদে বাকিগুলো আজকের দিন "আজকের ও নির্ধারিত পরীক্ষা সমূহ" ট্যাবে থাকবে এবং ১ দিন পর এখানে জমা হবে।'}
          </p>
        </div>
      `;
      return;
    }

    if (visibleList.length === 0) {
      elements.wrongBankQuestionsList.innerHTML = `
        <div style="text-align:center;padding:28px 18px;background:rgba(15,23,42,0.72);border:1px dashed rgba(148,163,184,0.28);border-radius:14px;color:#94a3b8">
          এই ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি।
        </div>
      `;
      return;
    }

    visibleList.forEach((item, idx) => {
      const card = createWrongBankReviewCard(item, idx, {
        onRemoved: () => {
          renderWrongBankChapterView();
        }
      });
      elements.wrongBankQuestionsList.appendChild(card);
    });
  }

  // 7. Firebase REST API Client Accessor (Zero WebSocket Slot Usage)
  function getREST() {
    return window.FB_REST || null;
  }

  function getLocalDeletedSubjectIds() {
    try {
      const arr = JSON.parse(localStorage.getItem('sr_deleted_subjects') || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function loadSubjectsFromDB() {
    const initialDeleted = new Set(getLocalDeletedSubjectIds());
    if (!State.subjects || State.subjects.length === 0) {
      State.subjects = DEFAULT_SUBJECTS.filter((s) => !initialDeleted.has(s.id));
    }
    renderSubjectsGrid();

    const REST = getREST();
    if (!REST) {
      return;
    }

    Promise.all([
      REST.get('exam_subjects').catch(() => null),
      REST.get('exam_deleted_subjects').catch(() => null)
    ]).then(([val, delRaw]) => {
      const delVal = delRaw || {};
      const deletedIds = new Set(getLocalDeletedSubjectIds());
      if (delVal && typeof delVal === 'object') {
        Object.keys(delVal).forEach((dk) => {
          if (delVal[dk]) deletedIds.add(dk);
        });
      }

      const merged = DEFAULT_SUBJECTS
        .filter((s) => !deletedIds.has(s.id))
        .map((s) => ({ ...s, chapters: (s.chapters || []).slice() }));

      if (val && typeof val === 'object') {
        const loaded = Object.keys(val).map((k) => ({
          id: k,
          ...val[k]
        }));
        loaded.forEach((ls) => {
          if (deletedIds.has(ls.id)) return;
          const idx = merged.findIndex((m) => m.id === ls.id);
          if (idx > -1) {
            merged[idx] = { ...merged[idx], ...ls };
            if (ls.noChapters === true) {
              merged[idx].chapters = [];
            } else if (ls.chapters && Array.isArray(ls.chapters) && ls.chapters.length) {
              merged[idx].chapters = ls.chapters;
            }
          } else {
            if (ls.noChapters === true) ls.chapters = [];
            merged.push(ls);
          }
        });
      }

      // Also merge locally created/edited subjects from localStorage
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('sr_custom_subject_')) {
            const cObj = JSON.parse(localStorage.getItem(k));
            if (cObj && cObj.id && !deletedIds.has(cObj.id)) {
              const mIdx = merged.findIndex(x => x.id === cObj.id);
              if (mIdx > -1) {
                merged[mIdx] = { ...merged[mIdx], ...cObj };
                if (cObj.noChapters === true) merged[mIdx].chapters = [];
              } else {
                if (cObj.noChapters === true) cObj.chapters = [];
                merged.push(cObj);
              }
            }
          }
        }
      } catch(e) {}

      State.subjects = merged;
      renderSubjectsGrid();
    }).catch(() => {
      // Local fallback
      try {
        const deletedIds = new Set(getLocalDeletedSubjectIds());
        const merged = DEFAULT_SUBJECTS
          .filter((s) => !deletedIds.has(s.id))
          .map((s) => ({ ...s, chapters: (s.chapters || []).slice() }));
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('sr_custom_subject_')) {
            const cObj = JSON.parse(localStorage.getItem(k));
            if (cObj && cObj.id && !deletedIds.has(cObj.id)) {
              const mIdx = merged.findIndex(x => x.id === cObj.id);
              if (mIdx > -1) {
                merged[mIdx] = { ...merged[mIdx], ...cObj };
                if (cObj.noChapters === true) merged[mIdx].chapters = [];
              } else {
                if (cObj.noChapters === true) cObj.chapters = [];
                merged.push(cObj);
              }
            }
          }
        }
        State.subjects = merged;
      } catch(e) {
        if (!State.subjects || !State.subjects.length) {
          State.subjects = DEFAULT_SUBJECTS;
        }
      }
      renderSubjectsGrid();
    });
  }

  // 3D Vector SVG Icons and Dynamic Palette Themes for Subjects & Chapters
  const SUBJECT_THEME_MAP = {
    chem: {
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 45%, #4c1d95 100%)',
      borderGlow: 'rgba(168, 85, 247, 0.65)',
      neonGlow: 'rgba(147, 51, 234, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="chemGrad" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
            <stop stop-color="#c084fc"/>
            <stop offset="0.6" stop-color="#9333ea"/>
            <stop offset="1" stop-color="#581c87"/>
          </linearGradient>
          <filter id="chemGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#a855f7" flood-opacity="0.5"/>
          </filter>
        </defs>
        <path d="M26 10h12v10l12 28a4 4 0 0 1-3.7 5.6H17.7A4 4 0 0 1 14 48l12-28V10z" fill="url(#chemGrad)" stroke="#f3e8ff" stroke-width="2.5" filter="url(#chemGlow)"/>
        <line x1="22" y1="10" x2="42" y2="10" stroke="#f3e8ff" stroke-width="3" stroke-linecap="round"/>
        <path d="M19 44c4-3 10-3 14 0s10 3 14 0v4a4 4 0 0 1-3.7 5.6H17.7A4 4 0 0 1 14 48v-4z" fill="#f43f5e" opacity="0.85"/>
        <circle cx="28" cy="38" r="3" fill="#ffffff" opacity="0.9"/>
        <circle cx="36" cy="32" r="2" fill="#ffffff" opacity="0.75"/>
        <circle cx="25" cy="27" r="1.5" fill="#ffffff" opacity="0.6"/>
      </svg>`
    },
    math: {
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 45%, #9a3412 100%)',
      borderGlow: 'rgba(251, 191, 36, 0.75)',
      neonGlow: 'rgba(245, 158, 11, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mathGrad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
            <stop stop-color="#fde047"/>
            <stop offset="0.5" stop-color="#f59e0b"/>
            <stop offset="1" stop-color="#b45309"/>
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="44" height="44" rx="12" fill="url(#mathGrad)" stroke="#fef3c7" stroke-width="2.5"/>
        <path d="M22 24h6M25 21v6M36 24h8M22 40h20M22 45h20" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
        <circle cx="32" cy="32" r="3" fill="#ffffff"/>
      </svg>`
    },
    bio: {
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 45%, #064e3b 100%)',
      borderGlow: 'rgba(52, 211, 153, 0.7)',
      neonGlow: 'rgba(16, 185, 129, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bioGrad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6ee7b7"/>
            <stop offset="0.6" stop-color="#059669"/>
            <stop offset="1" stop-color="#064e3b"/>
          </linearGradient>
        </defs>
        <path d="M32 10c14 4 22 18 16 32-4 10-16 12-16 12s-12-2-16-12c-6-14 2-28 16-32z" fill="url(#bioGrad)" stroke="#ecfdf5" stroke-width="2.5"/>
        <path d="M32 12v38M24 24c4 4 8 4 8 4M40 28c-4 3-8 3-8 3M24 38c4 3 8 3 8 3" stroke="#a7f3d0" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`
    },
    phy: {
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 45%, #1e40af 100%)',
      borderGlow: 'rgba(56, 189, 248, 0.75)',
      neonGlow: 'rgba(14, 165, 233, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="phyGrad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
            <stop stop-color="#7dd3fc"/>
            <stop offset="0.5" stop-color="#0284c7"/>
            <stop offset="1" stop-color="#1e3a8a"/>
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#38bdf8" stroke-width="2.5" transform="rotate(-30 32 32)"/>
        <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#38bdf8" stroke-width="2.5" transform="rotate(30 32 32)"/>
        <circle cx="32" cy="32" r="6" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
        <circle cx="48" cy="22" r="3" fill="#38bdf8"/>
        <circle cx="16" cy="42" r="3" fill="#38bdf8"/>
      </svg>`
    },
    eng: {
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 45%, #312e81 100%)',
      borderGlow: 'rgba(129, 140, 248, 0.75)',
      neonGlow: 'rgba(99, 102, 241, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="engGrad" x1="10" y1="12" x2="54" y2="52" gradientUnits="userSpaceOnUse">
            <stop stop-color="#a5b4fc"/>
            <stop offset="0.5" stop-color="#6366f1"/>
            <stop offset="1" stop-color="#312e81"/>
          </linearGradient>
        </defs>
        <path d="M12 18a4 4 0 0 1 4-4h14v36H16a4 4 0 0 0-4 4V18z" fill="url(#engGrad)" stroke="#e0e7ff" stroke-width="2"/>
        <path d="M52 18a4 4 0 0 0-4-4H34v36h14a4 4 0 0 1 4 4V18z" fill="url(#engGrad)" stroke="#e0e7ff" stroke-width="2"/>
        <path d="M18 22h8M18 28h8M18 34h8M38 22h8M38 28h8M38 34h8" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    gk: {
      gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 45%, #134e4a 100%)',
      borderGlow: 'rgba(45, 212, 191, 0.75)',
      neonGlow: 'rgba(20, 184, 166, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gkGrad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5eead4"/>
            <stop offset="0.6" stop-color="#0d9488"/>
            <stop offset="1" stop-color="#134e4a"/>
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="20" fill="url(#gkGrad)" stroke="#ccfbf1" stroke-width="2.5"/>
        <ellipse cx="32" cy="32" rx="10" ry="20" stroke="#ccfbf1" stroke-width="1.8"/>
        <line x1="12" y1="32" x2="52" y2="32" stroke="#ccfbf1" stroke-width="1.8"/>
        <path d="M16 22c5 4 11 4 16 0s11-4 16 0M16 42c5-4 11-4 16 0s11 4 16 0" stroke="#ccfbf1" stroke-width="1.8"/>
      </svg>`
    },
    ict: {
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 40%, #0369a1 70%, #0f172a 100%)',
      borderGlow: 'rgba(56, 189, 248, 0.9)',
      neonGlow: 'rgba(14, 165, 233, 0.55)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ictLidGrad" x1="8" y1="8" x2="56" y2="40" gradientUnits="userSpaceOnUse">
            <stop stop-color="#38bdf8"/>
            <stop offset="0.4" stop-color="#0284c7"/>
            <stop offset="1" stop-color="#0369a1"/>
          </linearGradient>
          <linearGradient id="ictScreenGrad" x1="14" y1="12" x2="50" y2="36" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0f172a"/>
            <stop offset="1" stop-color="#020617"/>
          </linearGradient>
          <linearGradient id="ictChipGrad" x1="26" y1="18" x2="38" y2="30" gradientUnits="userSpaceOnUse">
            <stop stop-color="#38bdf8"/>
            <stop offset="1" stop-color="#0284c7"/>
          </linearGradient>
          <filter id="ictDropGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#38bdf8" flood-opacity="0.65"/>
          </filter>
        </defs>
        <!-- 3D Laptop Display Lid with Top Glow -->
        <rect x="10" y="8" width="44" height="30" rx="4" fill="url(#ictLidGrad)" stroke="#7dd3fc" stroke-width="1.8" filter="url(#ictDropGlow)"/>
        <!-- Inner Display Bezel & Screen -->
        <rect x="13" y="11" width="38" height="24" rx="2.5" fill="url(#ictScreenGrad)"/>
        <!-- Microprocessor / Silicon Chip on Screen -->
        <rect x="25" y="16" width="14" height="14" rx="2.5" fill="url(#ictChipGrad)" stroke="#7dd3fc" stroke-width="1.2"/>
        <rect x="28" y="19" width="8" height="8" rx="1.5" fill="#0f172a"/>
        <!-- Chip Circuit Trace Pins (Top, Bottom, Left, Right) -->
        <line x1="28" y1="13" x2="28" y2="16" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="32" y1="13" x2="32" y2="16" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="36" y1="13" x2="36" y2="16" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="28" y1="30" x2="28" y2="33" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="32" y1="30" x2="32" y2="33" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="36" y1="30" x2="36" y2="33" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="22" y1="19" x2="25" y2="19" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="22" y1="23" x2="25" y2="23" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="22" y1="27" x2="25" y2="27" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="39" y1="19" x2="42" y2="19" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="39" y1="23" x2="42" y2="23" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="39" y1="27" x2="42" y2="27" stroke="#38bdf8" stroke-width="1.2"/>
        <!-- Glowing Core Indicator in Chip -->
        <circle cx="32" cy="23" r="1.8" fill="#34d399"/>
        <!-- 3D Laptop Base & Keyboard Platform -->
        <path d="M4 40h56l-6 11a3 3 0 0 1-2.6 1.5H12.6A3 3 0 0 1 10 51L4 40z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
        <path d="M8 41h48l-4 5H12l-4-5z" fill="#0f172a" opacity="0.7"/>
        <!-- Trackpad -->
        <rect x="25" y="47" width="14" height="3.5" rx="1" fill="#334155" stroke="#64748b" stroke-width="0.8"/>
      </svg>`
    },
    bangla: {
      gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 45%, #9f1239 70%, #4c0519 100%)',
      borderGlow: 'rgba(251, 113, 133, 0.85)',
      neonGlow: 'rgba(225, 29, 72, 0.55)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="banCoverGrad" x1="10" y1="14" x2="54" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#fda4af"/>
            <stop offset="0.4" stop-color="#e11d48"/>
            <stop offset="1" stop-color="#881337"/>
          </linearGradient>
          <linearGradient id="banPageGrad" x1="12" y1="16" x2="52" y2="46" gradientUnits="userSpaceOnUse">
            <stop stop-color="#ffffff"/>
            <stop offset="1" stop-color="#ffe4e6"/>
          </linearGradient>
          <filter id="banBookGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#f43f5e" flood-opacity="0.6"/>
          </filter>
        </defs>
        <!-- Clean Open Book: Symmetrical Open Book Cover -->
        <path d="M8 20c7-4 15-4 24 2 9-6 17-6 24-2v26c-7-4-15-4-24 2-9-6-17-6-24-2V20z" fill="url(#banCoverGrad)" stroke="#ffe4e6" stroke-width="2" filter="url(#banBookGlow)"/>
        <!-- Inner Book Pages Spread (Left & Right Pages) -->
        <path d="M10 22c6-3.5 14-3.5 22 1.5v24c-8-5-16-5-22-1.5V22z" fill="url(#banPageGrad)" opacity="0.95"/>
        <path d="M54 22c-6-3.5-14-3.5-22 1.5v24c8-5 16-5 22-1.5V22z" fill="url(#banPageGrad)" opacity="0.95"/>
        <!-- Center Book Spine Line -->
        <line x1="32" y1="23" x2="32" y2="48" stroke="#be123c" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Bookmark Ribbon -->
        <path d="M30 20h4v10l-2-2-2 2V20z" fill="#facc15"/>
        <!-- Clean Ruled Straight Text Lines (Pristine, no letters/characters inside) -->
        <!-- Left Page Straight Lines -->
        <line x1="14" y1="27" x2="28" y2="27" stroke="#9f1239" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
        <line x1="14" y1="32" x2="28" y2="32" stroke="#9f1239" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
        <line x1="14" y1="37" x2="28" y2="37" stroke="#9f1239" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
        <line x1="14" y1="42" x2="24" y2="42" stroke="#9f1239" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
        <!-- Right Page Straight Lines -->
        <line x1="36" y1="27" x2="50" y2="27" stroke="#9f1239" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
        <line x1="36" y1="32" x2="50" y2="32" stroke="#9f1239" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
        <line x1="36" y1="37" x2="50" y2="37" stroke="#9f1239" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
        <line x1="36" y1="42" x2="46" y2="42" stroke="#9f1239" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
      </svg>`
    },
    general: {
      gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 35%, #059669 70%, #10b981 100%)',
      borderGlow: 'rgba(52, 211, 153, 0.9)',
      neonGlow: 'rgba(16, 185, 129, 0.6)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="glossyGreenGrad" x1="12" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse">
            <stop stop-color="#34d399"/>
            <stop offset="0.45" stop-color="#059669"/>
            <stop offset="1" stop-color="#022c22"/>
          </linearGradient>
          <filter id="glossyNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#10b981" flood-opacity="0.6"/>
          </filter>
        </defs>
        <!-- Glossy Open Knowledge Book in Emerald & Neon Green -->
        <path d="M10 24a4 4 0 0 1 4-4h16v32H14a4 4 0 0 0-4 4V24z" fill="url(#glossyGreenGrad)" stroke="#a7f3d0" stroke-width="2.2" filter="url(#glossyNeonGlow)"/>
        <path d="M54 24a4 4 0 0 0-4-4H34v32h16a4 4 0 0 1 4 4V24z" fill="url(#glossyGreenGrad)" stroke="#a7f3d0" stroke-width="2.2" filter="url(#glossyNeonGlow)"/>
        <line x1="16" y1="28" x2="26" y2="28" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="16" y1="33" x2="26" y2="33" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="16" y1="38" x2="22" y2="38" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="38" y1="28" x2="48" y2="28" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="38" y1="33" x2="48" y2="33" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="38" y1="38" x2="44" y2="38" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M32 16l3 5 6 .9-4.3 4.2 1 6-5.7-3-5.7 3 1-6L23 21.9l6-.9 3-5z" fill="#facc15" stroke="#ffffff" stroke-width="1.2"/>
      </svg>`
    }
  };

  function getSubjectTheme(subj) {
    if (!subj) return SUBJECT_THEME_MAP.general;
    const sId = (subj.id || '').toLowerCase();
    const sTitle = [
      subj.titleBn || '',
      subj.titleEn || '',
      subj.name || ''
    ].join(' ').toLowerCase();
    const sName = [
      sTitle,
      subj.tag || '',
      subj.category || ''
    ].join(' ').toLowerCase();

    // 1. General Knowledge / Bangladesh & International Affairs (Check before Bangla so 'বাংলাদেশ' doesn't match 'বাংলা')
    if (
      sId.includes('gk') ||
      sId.includes('bcs_bd') ||
      sId.includes('bcs_intl') ||
      sTitle.includes('বাংলাদেশ') ||
      sTitle.includes('আন্তর্জাতিক') ||
      sTitle.includes('সাধারণ জ্ঞান') ||
      sTitle.includes('জিকে') ||
      sTitle.includes('bangladesh') ||
      sTitle.includes('international') ||
      sName.includes('সাধারণ জ্ঞান') ||
      sName.includes('জিকে')
    ) {
      return SUBJECT_THEME_MAP.gk;
    }

    // 2. ICT (তথ্য ও যোগাযোগ প্রযুক্তি, Computer, Laptop, Programming)
    if (
      sId.includes('ict') ||
      sId.includes('comp') ||
      sId.includes('tech') ||
      sTitle.includes('তথ্য') ||
      sTitle.includes('যোগাযোগ') ||
      sTitle.includes('প্রযুক্তি') ||
      sTitle.includes('কম্পিউটার') ||
      sTitle.includes('আইসিটি') ||
      sTitle.includes('ict') ||
      sTitle.includes('comp') ||
      sTitle.includes('comput') ||
      sTitle.includes('laptop') ||
      sTitle.includes('tech')
    ) {
      return SUBJECT_THEME_MAP.ict;
    }

    // 3. Bangla (বাংলা ১ম ও ২য় পত্র, সাহিত্য, ব্যাকরণ)
    if (
      sId.includes('ban') ||
      sId.includes('beng') ||
      sTitle.includes('বাংলা') ||
      sName.includes('বাং') ||
      sName.includes('বাঙলা') ||
      sTitle.includes('bangla') ||
      sName.includes('bengali') ||
      sName.includes('sahitya') ||
      sName.includes('সাহিত্য') ||
      sName.includes('ব্যাকরণ')
    ) {
      return SUBJECT_THEME_MAP.bangla;
    }

    // 4. Chemistry (রসায়ন / রসায়ন)
    if (
      sId.includes('chem') ||
      sName.includes('রসায়ন') ||
      sName.includes('রসায়ন') ||
      sName.includes('chemistry') ||
      sName.includes('chem')
    ) {
      return SUBJECT_THEME_MAP.chem;
    }

    // 5. Mathematics / Higher Math / Mental Ability (উচ্চতর গণিত / সাধারণ গণিত / গাণিতিক যুক্তি)
    if (
      sId.includes('math') ||
      sName.includes('গণিত') ||
      sName.includes('গাণিতিক') ||
      sName.includes('মানসিক') ||
      sName.includes('উচ্চতর') ||
      sName.includes('ম্যাথ') ||
      sName.includes('math')
    ) {
      return SUBJECT_THEME_MAP.math;
    }

    // 6. Biology (জীববিজ্ঞান, উদ্ভিদবিজ্ঞান, প্রাণিবিজ্ঞান)
    if (
      sId.includes('bio') ||
      sName.includes('জীব') ||
      sName.includes('উদ্ভিদ') ||
      sName.includes('প্রাণী') ||
      sName.includes('প্রাণি') ||
      sName.includes('bio') ||
      sName.includes('biology')
    ) {
      return SUBJECT_THEME_MAP.bio;
    }

    // 7. Physics (পদার্থবিজ্ঞান)
    if (
      sId.includes('phy') ||
      sName.includes('পদার্থ') ||
      sName.includes('physics')
    ) {
      return SUBJECT_THEME_MAP.phy;
    }

    // 8. English (ইংরেজি)
    if (
      sId.includes('eng') ||
      sName.includes('ইংরেজি') ||
      sName.includes('english')
    ) {
      return SUBJECT_THEME_MAP.eng;
    }

    return SUBJECT_THEME_MAP.general;
  }

  function getSubjectCategory(subj) {
    if (!subj) return 'HSC';
    if (subj.category) {
      return extractBaseExamClass(subj.category) || String(subj.category).trim();
    }
    const idL = String(subj.id || '').toLowerCase();
    if (idL.startsWith('ssc_') || idL.startsWith('subj_ssc_')) return 'SSC';
    if (idL.startsWith('adm_') || idL.startsWith('admission_') || idL.startsWith('subj_admission_')) return 'Admission';
    if (idL.startsWith('bcs_') || idL.startsWith('subj_bcs_')) return 'BCS';
    return 'HSC';
  }

  function getSubjectExamProgress(subj) {
    try {
      const hist = JSON.parse(localStorage.getItem(getUserHistoryStorageKey()) || '[]');
      if (!hist.length || !subj.chapters || !subj.chapters.length) return 0;
      const chNames = subj.chapters.map(c => c.name);
      let completedChs = 0;
      subj.chapters.forEach(ch => {
        const participated = hist.some(h => (h.examTitle || '').includes(ch.name));
        if (participated) completedChs++;
      });
      return Math.round((completedChs / subj.chapters.length) * 100);
    } catch(e) {
      return 0;
    }
  }

  function renderSubjectsGrid() {
    elements.subjectGrid.innerHTML = '';
    const catBadge = document.getElementById('subjectCategoryTitleBadge');
    if (catBadge) {
      catBadge.textContent = activePortalClass === 'BCS' ? 'BCS / Job' : activePortalClass;
    }

    // Always show active user's personal chapter card: "আমার ভুল করা প্রশ্ন"
    const wbStats = getUserWrongBankStats();
    const wbCard = document.createElement('div');
    wbCard.className = 'subject-card';
    wbCard.style.setProperty('--card-border-glow', 'rgba(251, 113, 133, 0.85)');
    wbCard.style.setProperty('--card-neon-glow', 'rgba(225, 29, 72, 0.45)');
    wbCard.innerHTML = `
      <div class="subject-card-banner" style="background:linear-gradient(135deg, #be123c 0%, #9f1239 50%, #4c0519 100%)">
        <div class="subject-3d-icon-wrap">
          <svg width="46" height="46" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="12" y="10" width="40" height="44" rx="8" fill="#ffe4e6" stroke="#fda4af" stroke-width="2.5"/>
            <line x1="20" y1="22" x2="44" y2="22" stroke="#9f1239" stroke-width="3" stroke-linecap="round"/>
            <line x1="20" y1="31" x2="40" y2="31" stroke="#9f1239" stroke-width="3" stroke-linecap="round"/>
            <circle cx="46" cy="44" r="10" fill="#e11d48" stroke="#fff" stroke-width="2"/>
            <path d="M42.5 40.5l7 7M49.5 40.5l-7 7" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="subject-banner-title">আমার ভুল করা প্রশ্ন</div>
        <div class="subject-banner-tag" style="color:#881337">ব্যক্তিগত ভুল ও স্কিপ প্রশ্নব্যাংক</div>
      </div>
      <div class="subject-card-footer">
        <div class="subject-footer-top">
          <span class="subject-english-name">${escHtml(getActiveUserDisplayName())} · ব্যক্তিগত অধ্যায়</span>
          <span class="subject-count-pill" style="background:rgba(225,29,72,0.18);color:#fda4af">📝 ${toBn(wbStats.archivedCount)}টি সংরক্ষিত</span>
        </div>
        <div style="font-size:12px;color:#94a3b8;margin-top:6px;line-height:1.4">
          ${wbStats.todayCount > 0
            ? `আজকের ${toBn(wbStats.todayCount)}টি প্রশ্ন "আজকের ও নির্ধারিত পরীক্ষা সমূহ"-তে আছে (১ দিন পর এখানে যুক্ত হবে)`
            : '১+ দিন আগের সকল ভুল ও স্কিপ করা প্রশ্ন (নতুনগুলো উপরে)'}
        </div>
      </div>
    `;
    wbCard.addEventListener('click', () => {
      openWrongBankChapterView();
    });
    elements.subjectGrid.appendChild(wbCard);

    const filtered = State.subjects.filter((subj) => {
      return getSubjectCategory(subj).toLowerCase() === String(activePortalClass || 'HSC').toLowerCase();
    });
    if (filtered.length === 0) {
      const emptyNote = document.createElement('div');
      emptyNote.style.cssText = 'grid-column:1/-1;text-align:center;padding:28px 20px;color:#94a3b8;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.12);border-radius:14px';
      emptyNote.textContent = 'এই ক্যাটাগরিতে এখনো কোনো বিষয় পাওয়া যায়নি। নতুন বিষয় যোগ করতে পারেন।';
      elements.subjectGrid.appendChild(emptyNote);
      return;
    }
    const displayList = filtered;
    displayList.forEach((subj) => {
      const theme = getSubjectTheme(subj);
      const card = document.createElement('div');
      card.className = 'subject-card';
      card.style.setProperty('--card-border-glow', theme.borderGlow);
      card.style.setProperty('--card-neon-glow', theme.neonGlow);

      const chCount = subj.chapters ? subj.chapters.length : 0;
      const prog = getSubjectExamProgress(subj);

      card.innerHTML = `
        <div class="subject-card-banner" style="background:${theme.gradient}">
          <div class="subject-3d-icon-wrap">${theme.icon}</div>
          <div class="subject-banner-title">${escHtml(subj.titleBn)}</div>
          <div class="subject-banner-tag">${escHtml(subj.tag || 'পরীক্ষা ও অনুশীলন')}</div>
        </div>
        <div class="subject-card-footer">
          <div class="subject-footer-top">
            <span class="subject-english-name">${escHtml(subj.titleEn || subj.titleBn)}</span>
            <span class="subject-count-pill">📚 ${chCount}টি অধ্যায়</span>
          </div>
          <div class="subject-progress-wrap">
            <div class="subject-progress-track">
              <div class="subject-progress-bar" style="width:${prog}%;background:${theme.borderGlow}"></div>
            </div>
            <div class="subject-progress-info">
              <span>অগ্রগতি</span>
              <span>${prog}% সম্পন্ন</span>
            </div>
          </div>
        </div>
      `;

      // Subject click -> opens chapters
      card.addEventListener('click', () => {
        openSubjectChapters(subj);
      });

      elements.subjectGrid.appendChild(card);
    });
  }

  function verifyNotBlocked(onProceed) {
    if (window.P && window.P.meta && window.P.meta.examEnabled === false) {
      showExamNotice('🚫 অ্যাডমিন এই রুমের জন্য পরীক্ষা দেওয়া সাময়িকভাবে বন্ধ রেখেছেন।');
      return;
    }
    const REST = getREST();
    if (!REST) { onProceed(); return; }
    const myUid = getActiveUserUid();
    const mySlot = getActiveUserSlot();
    const myRoom = window.CODE || localStorage.getItem('sr-code') || '';
    const safeRoom = myRoom.replace(/[.$#\[\]\/]/g, '_');
    const roomLivePath = (myRoom === '1432014310' ? 'rooms/' : 'rooms_v2/') + myRoom + '/meta/examEnabled';

    Promise.all([
      REST.get('exam_blocked_targets').catch(() => null),
      safeRoom ? REST.get('room_meta/' + safeRoom + '/examEnabled').catch(() => null) : Promise.resolve(null),
      myRoom ? REST.get(roomLivePath).catch(() => null) : Promise.resolve(null)
    ]).then(([blockedRaw, roomMetaExamFlag, roomLiveExamFlag]) => {
      if (roomMetaExamFlag === false || roomLiveExamFlag === false) {
        showExamNotice('🚫 অ্যাডমিন এই রুমের জন্য পরীক্ষা দেওয়া সাময়িকভাবে বন্ধ রেখেছেন।');
        return;
      }
      const blockedData = blockedRaw || {};
      const isUidBlocked = myUid && blockedData[myUid] && blockedData[myUid].blocked;
      const isSlotBlocked = mySlot && mySlot !== 'mon' && blockedData[mySlot] && blockedData[mySlot].blocked;
      const isRoomBlocked = (myRoom && blockedData[myRoom] && blockedData[myRoom].blocked) ||
        (safeRoom && blockedData[safeRoom] && blockedData[safeRoom].blocked);

      if (isUidBlocked || isSlotBlocked || isRoomBlocked) {
        const hit = isUidBlocked ? blockedData[myUid] : (isSlotBlocked ? blockedData[mySlot] : (blockedData[myRoom] || blockedData[safeRoom]));
        const rsn = (hit && hit.reason) || 'অ্যাডমিন কর্তৃক পরীক্ষা সাময়িক স্থগিত';
        showExamNotice(`🚫 পরীক্ষা স্থগিত: ${rsn}`);
        return;
      }
      onProceed();
    }).catch(() => {
      onProceed();
    });
  }

  function promptClassChangeRequest() {
    const REST = getREST();
    const myUid = getActiveUserUid();
    const myName = getActiveUserDisplayName();
    const myRoom = window.CODE || localStorage.getItem('sr-code') || '';
    const mySlot = getActiveUserSlot() || 'p1';
    const curCls = getStudentClass();

    const newCls = prompt(`বর্তমান ক্লাস: ${curCls}\nকোন ক্লাসে পরিবর্তন করতে চান? লিখুন (HSC, SSC, Admission বা BCS):`, curCls === 'HSC' ? 'Admission' : 'HSC');
    if (!newCls) return;
    const cleanCls = newCls.trim().toUpperCase();
    const parsedCls = extractBaseExamClass(newCls);
    if (!['HSC', 'SSC', 'ADMISSION', 'BCS'].includes(cleanCls) && !parsedCls) {
      showExamNotice('সঠিক ক্লাস নির্বাচন করুন: HSC, SSC, Admission অথবা BCS');
      return;
    }
    const targetCls = parsedCls || (cleanCls === 'ADMISSION' ? 'Admission' : cleanCls);

    if (mySlot === 'p1' || mySlot === 'p2') {
      applyVipClassImmediately(targetCls);
      return;
    }

    const year = prompt('পাসের সাল লিখুন (যেমন: 2026):', '2026') || '2026';
    const reason = prompt('ক্লাস পরিবর্তনের কারণ (ঐচ্ছিক):', '') || 'কোর্স পরিবর্তন';

    if (REST) {
      REST.push('class_change_requests', {
        uid: myUid,
        name: myName,
        room: myRoom,
        memberId: mySlot,
        currentClass: curCls,
        requestedClass: targetCls,
        passingYear: year,
        reason: reason,
        status: 'pending',
        createdAt: Date.now()
      }).then(() => {
        showExamNotice('✓ আপনার ক্লাস পরিবর্তনের আবেদন অ্যাডমিনের নিকট সফলভাবে পাঠানো হয়েছে।');
      }).catch((err) => {
        showExamNotice('আবেদন পাঠাতে সমস্যা হয়েছে: ' + (err && err.message ? err.message : 'সংযোগ ত্রুটি'));
      });
    } else {
      localStorage.setItem('sr_class', targetCls);
      showExamNotice('ক্লাস সফলভাবে পরিবর্তন করা হয়েছে ✓');
      openPortal('subjects');
    }
  }

  function openSubjectChapters(subject) {
    State.currentSubject = subject;
    const theme = getSubjectTheme(subject);
    elements.selectedSubjectTitle.innerText = `${subject.titleBn} (${subject.titleEn || ''})`;
    elements.subjectsListing.style.display = 'none';
    if (elements.chapterExamsListing) elements.chapterExamsListing.style.display = 'none';
    elements.chaptersListing.style.display = 'block';

    elements.chaptersGrid.innerHTML = '';
    elements.chaptersGrid.className = 'chapters-grid-container';
    const chapters = subject.chapters || [];

    if (chapters.length === 0) {
      elements.chaptersGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:30px;color:#94a3b8">
          এই বিষয়ের অধীনে এখনও কোনো চ্যাপ্টার যোগ করা হয়নি।
        </div>
      `;
      return;
    }

    chapters.forEach((ch) => {
      const card = document.createElement('div');
      card.className = 'chapter-graphical-card';
      card.style.setProperty('--card-neon-glow', theme.neonGlow);
      card.innerHTML = `
        <div class="chapter-graphical-banner" style="background:${theme.gradient}">
          <div class="chapter-banner-title">
            <span style="display:inline-flex;align-items:center;margin-right:4px">${theme.icon.replace('width="48" height="48"', 'width="28" height="28"')}</span>
            <span>অধ্যায় ${escHtml(ch.num)}</span>
          </div>
          <span class="chapter-banner-tag">${escHtml(subject.titleEn || subject.tag || (activePortalClass === 'BCS' ? 'BCS / Job' : activePortalClass))}</span>
        </div>
        <div class="chapter-graphical-body">
          <div class="chapter-graphical-name">${escHtml(ch.name)}</div>
          <div class="chapter-graphical-footer">
            <span style="font-size:12px;color:#94a3b8">মক ও অধ্যায় টেস্ট</span>
            <span class="chapter-graphical-action">
              পরীক্ষা সমূহ ›
            </span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openChapterExamsList(subject, ch);
      });

      elements.chaptersGrid.appendChild(card);
    });
  }

  // Step 3: Chapter Exams List with Dynamic Test Sets Sync
  function openChapterExamsList(subject, chapter) {
    State.currentSubject = subject;
    State.currentChapter = chapter;

    elements.chaptersListing.style.display = 'none';
    elements.chapterExamsListing.style.display = 'block';
    elements.selectedChapterExamTitle.innerText = `${subject.titleBn} — অধ্যায় ${chapter.num}: ${chapter.name}`;

    // Load previous score preview from history
    let prevBest = null;
    try {
      const hist = JSON.parse(localStorage.getItem(getUserHistoryStorageKey()) || '[]');
      const match = hist.find(h => (h.examTitle || '').includes(chapter.name));
      if (match) prevBest = match;
    } catch(e) {}

    if (prevBest) {
      elements.chapterPrevScoreText.innerText = `প্রাপ্ত স্কোর: ${prevBest.score}/${prevBest.total} (${prevBest.percentage}%)`;
      elements.chapterPrevScoreBadge.innerText = prevBest.percentage >= 80 ? '🌟 চমৎকার প্রস্তুতি' : '🔄 স্কোর উন্নয়নের সুযোগ';
      elements.chapterPrevScoreBadge.style.color = prevBest.percentage >= 80 ? '#34d399' : '#38bdf8';
    } else {
      elements.chapterPrevScoreText.innerText = 'কোনো পূর্ববর্তী রেকর্ড নেই (প্রথম প্রচেষ্টা)';
      elements.chapterPrevScoreBadge.innerText = '✨ নতুন প্রস্তুতি';
      elements.chapterPrevScoreBadge.style.color = '#38bdf8';
    }

    elements.chapterExamsGrid.innerHTML = `
      <div class="sr-skeleton-stack" aria-hidden="true">
        <div class="sr-skeleton-card"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div></div>
        <div class="sr-skeleton-card"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div></div>
        <div class="sr-skeleton-card"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div></div>
      </div>
    `;

    function normalizeQuestionList(raw) {
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === 'object') return Object.values(raw);
      return [];
    }

    function renderEmptyChapterExamsState() {
      elements.chapterExamsGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px 20px;background:rgba(15,23,42,0.65);border:1.5px dashed rgba(148,163,184,0.28);border-radius:16px;color:#cbd5e1">
          <div style="font-size:32px;margin-bottom:8px">📝</div>
          <h4 style="margin:0 0 6px;font-size:16px;color:#f8fafc">এই অধ্যায়ে এখনো কোনো পরীক্ষা বা প্রশ্ন যোগ করা হয়নি</h4>
          <p style="margin:0;font-size:13px;color:#94a3b8">অ্যাডমিন প্যানেল থেকে টেস্ট সেট ও প্রশ্ন যোগ করা হলে এখানে দেখা যাবে।</p>
        </div>
      `;
    }

    const REST = getREST();
    if (!REST) {
      const builtinQs = normalizeQuestionList(BUILTIN_QUESTION_BANKS[chapter.id]);
      if (builtinQs.length > 0) {
        renderSystemChapterTests(subject, chapter, 15, builtinQs);
      } else {
        renderEmptyChapterExamsState();
      }
      return;
    }

    // REST API দিয়ে প্রশ্ন ও টেস্ট সেট লোড (ডাটা আসার সাথে সাথে কানেকশন ক্লোজ)
    Promise.all([
      REST.get('exam_chapter_tests/' + chapter.id).catch(() => null),
      REST.get('examSets/' + chapter.id).catch(() => null),
      REST.get('chapter_exams/' + chapter.id).catch(() => null),
      REST.get('exam_chapter_durations/' + chapter.id).catch(() => 15),
      REST.get('exam_questions/' + chapter.id).catch(() => [])
    ]).then(([testsRaw, setsRaw, chExamsRaw, durRaw, qRaw]) => {
      elements.chapterExamsGrid.innerHTML = '';
      const customTests = testsRaw || {};
      const customSets = setsRaw || {};
      const chExams = chExamsRaw || {};
      const mergedTests = Object.assign({}, chExams, customTests, customSets);
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const lk = localStorage.key(i);
          if (lk && lk.indexOf('sr_local_ts_' + chapter.id + '_') === 0) {
            const cached = JSON.parse(localStorage.getItem(lk));
            if (cached && cached.id && !mergedTests[cached.id]) {
              mergedTests[cached.id] = cached;
            }
          }
        }
      } catch (e) {}
      const customDur = Number(durRaw) || 15;
      const qArr = normalizeQuestionList(qRaw);
      const builtinQs = normalizeQuestionList(BUILTIN_QUESTION_BANKS[chapter.id]);
      const realChapterQs = qArr.length > 0 ? qArr : builtinQs;

      let testList = [];
      if (mergedTests && typeof mergedTests === 'object') {
        testList = Object.keys(mergedTests)
          .filter(k => !k.startsWith('_') && mergedTests[k] && typeof mergedTests[k] === 'object' && (mergedTests[k].title || mergedTests[k].name || normalizeQuestionList(mergedTests[k].questions).length > 0))
          .map(k => ({
            id: k,
            ...mergedTests[k],
            questions: normalizeQuestionList(mergedTests[k].questions),
            title: mergedTests[k].title || mergedTests[k].name || `${chapter.name} টেস্ট সেট`
          }));
      }

      if (testList.length > 0) {
        testList.forEach((testSet) => {
          renderTestSetCard(subject, chapter, testSet);
        });
      } else if (realChapterQs.length > 0) {
        renderSystemChapterTests(subject, chapter, customDur, realChapterQs);
      } else {
        renderEmptyChapterExamsState();
      }
    }).catch(() => {
      elements.chapterExamsGrid.innerHTML = '';
      const builtinQs = normalizeQuestionList(BUILTIN_QUESTION_BANKS[chapter.id]);
      if (builtinQs.length > 0) {
        renderSystemChapterTests(subject, chapter, 15, builtinQs);
      } else {
        renderEmptyChapterExamsState();
      }
    });
  }

  function showExamNotice(message) {
    try {
      const prev = document.getElementById('srExamNoticeToast');
      if (prev) prev.remove();
      const box = document.createElement('div');
      box.id = 'srExamNoticeToast';
      box.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:100500;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(52,211,153,0.45);border-radius:12px;padding:12px 18px;box-shadow:0 14px 36px rgba(0,0,0,0.6);display:flex;align-items:center;gap:12px;max-width:92vw;font-size:13.5px;font-weight:600';
      const txt = document.createElement('span');
      txt.textContent = message;
      const cls = document.createElement('button');
      cls.type = 'button';
      cls.textContent = '✕';
      cls.style.cssText = 'background:transparent;border:none;color:#94a3b8;font-size:15px;cursor:pointer;padding:0 4px';
      cls.onclick = () => box.remove();
      box.appendChild(txt);
      box.appendChild(cls);
      document.body.appendChild(box);
      setTimeout(() => { if (box.parentNode) box.remove(); }, 4200);
    } catch (e) {}
  }

  function renderTestSetCard(subject, chapter, testSet) {
    const qArr = Array.isArray(testSet.questions)
      ? testSet.questions
      : (Array.isArray(testSet.customQuestions)
        ? testSet.customQuestions
        : (testSet.questions && typeof testSet.questions === 'object' ? Object.values(testSet.questions) : []));
    const qCount = qArr.length > 0 ? qArr.length : (Number(testSet.qCount) || 0);
    const dur = Number(testSet.durationMinutes || testSet.timeLimit) || 15;
    const cardTitle = testSet.title || testSet.name || `${chapter.name} টেস্ট সেট`;
    const cardTag = testSet.tag || testSet.badge || 'মক টেস্ট';
    const cardDesc = testSet.desc || 'স্ট্যান্ডার্ড টাইমিং ও পূর্ণাঙ্গ চ্যাপ্টার টেস্ট';
    const setId = testSet.sourceSetId || testSet.id || chapter.id;
    const progStats = qArr.length > 0 ? computeSetProgressStats(setId, qArr) : { total: qCount, masteredCount: 0, remainingUnmastered: qCount, pct: 0 };
    const masteryHtml = qCount > 0 ? `
      <div class="set-mastery-wrap">
        <div class="set-mastery-bar-track">
          <div class="set-mastery-bar-fill" style="width:${progStats.pct}%"></div>
        </div>
        <div class="set-mastery-meta">
          <span>Completed: ${toBn(progStats.pct)}% (${toBn(progStats.masteredCount)}/${toBn(progStats.total)})</span>
          <span>বাকি Unmastered: ${toBn(progStats.remainingUnmastered)}টি</span>
        </div>
      </div>
    ` : '';
    const card = document.createElement('div');
    card.className = 'q-glass-card student-exam-set-card';
    card.innerHTML = `
      <div style="flex:1;min-width:220px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span class="student-exam-set-tag">${escHtml(cardTag)}</span>
          <span style="font-size:12.5px;color:var(--ex-muted)">${dur} মিনিট · ${qCount}টি প্রশ্ন</span>
        </div>
        <h4 style="margin:0 0 4px;font-size:16px;font-weight:700;color:var(--ex-ink)">${escHtml(cardTitle)}</h4>
        <p style="margin:0;font-size:12.5px;color:var(--ex-muted)">${escHtml(cardDesc)}</p>
        ${masteryHtml}
      </div>
      <button class="btn btn-start-chapter-exam" type="button" style="background:#059669;color:#fff;border:none;padding:10px 18px;border-radius:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
        পরীক্ষা শুরু (Exam Start)
      </button>
    `;

    card.querySelector('.btn-start-chapter-exam').addEventListener('click', () => {
      verifyNotBlocked(() => {
        startChapterPracticeExam(subject, chapter, testSet);
      });
    });

    elements.chapterExamsGrid.appendChild(card);
  }

  function renderSystemChapterTests(subject, chapter, customDur, chapterQuestions) {
    if (!chapterQuestions || !chapterQuestions.length) return;
    const total = chapterQuestions.length;
    const systemTest = {
      id: `sys_${chapter.id}`,
      type: 'system',
      title: `অধ্যায়ভিত্তিক অনুশীলন পরীক্ষা — ${chapter.name}`,
      desc: 'পাঠ্যবই ও সিস্টেম প্রশ্নব্যাংকের ওপর ভিত্তি করে তৈরি পরীক্ষা',
      qCount: total,
      durationMinutes: customDur || 15,
      badge: 'অধ্যায় টেস্ট',
      customQuestions: chapterQuestions
    };
    renderTestSetCard(subject, chapter, systemTest);
  }

  // 8. Start Practice Exam by Chapter
  function startChapterPracticeExam(subject, chapter, preset) {
    preset = preset || {
      title: `${subject.titleBn} - অধ্যায় ${chapter.num}: ${chapter.name}`,
      durationMinutes: 15,
      qCount: 0
    };

    const setId = preset.sourceSetId || preset.id || chapter.id;
    const examConfig = {
      id: preset.id || `practice_${chapter.id}_${Date.now()}`,
      sourceSetId: setId,
      title: preset.title,
      subjectId: subject.id,
      subjectName: subject.titleBn || '',
      category: getSubjectCategory(subject),
      chapterId: chapter.id,
      durationMinutes: preset.durationMinutes || preset.timeLimit || 15,
      pdfUrl: preset.pdfUrl || null
    };

    const directQs = Array.isArray(preset.questions)
      ? preset.questions
      : (preset.questions && typeof preset.questions === 'object' ? Object.values(preset.questions) : []);
    if (directQs.length > 0) {
      examConfig.questions = directQs;
      startExam(examConfig);
      return;
    }
    const customQs = Array.isArray(preset.customQuestions)
      ? preset.customQuestions
      : (preset.customQuestions && typeof preset.customQuestions === 'object' ? Object.values(preset.customQuestions) : []);
    if (customQs.length > 0) {
      examConfig.questions = customQs;
      startExam(examConfig);
      return;
    }

    // Load real questions via REST API or built-in system bank
    const REST = getREST();
    if (REST) {
      REST.get(`exam_questions/${chapter.id}`).then((raw) => {
        const qList = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? Object.values(raw) : []);
        if (qList.length > 0) {
          examConfig.questions = qList;
          startExam(examConfig);
        } else if (Array.isArray(BUILTIN_QUESTION_BANKS[chapter.id]) && BUILTIN_QUESTION_BANKS[chapter.id].length > 0) {
          examConfig.questions = BUILTIN_QUESTION_BANKS[chapter.id];
          startExam(examConfig);
        } else {
          showExamNotice('এই টেস্ট সেটে এখনো কোনো প্রশ্ন যোগ করা হয়নি। অ্যাডমিন প্রশ্ন যোগ করলে পরীক্ষা দিতে পারবেন।');
        }
      }).catch(() => {
        const bQs = BUILTIN_QUESTION_BANKS[chapter.id];
        if (Array.isArray(bQs) && bQs.length > 0) {
          examConfig.questions = bQs;
          startExam(examConfig);
        } else {
          showExamNotice('প্রশ্ন লোড করতে সংযোগ সমস্যা হয়েছে। ইন্টারনেট চেক করে আবার চেষ্টা করুন।');
        }
      });
    } else {
      const bQs = BUILTIN_QUESTION_BANKS[chapter.id];
      if (Array.isArray(bQs) && bQs.length > 0) {
        examConfig.questions = bQs;
        startExam(examConfig);
      } else {
        showExamNotice('এই টেস্ট সেটে এখনো কোনো প্রশ্ন যোগ করা হয়নি।');
      }
    }
  }

  // 9. Load Assigned Exams + Today-only Per-User Wrong/Skipped Card via REST API
  function loadAssignedExamsFromDB() {
    const REST = getREST();

    if (elements.assignedList && !elements.assignedList.querySelector('.assigned-exam-card')) {
      elements.assignedList.innerHTML = `
        <div class="sr-skeleton-stack" aria-hidden="true">
          <div class="sr-skeleton-card"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div><div class="sr-skeleton-line sr-skeleton-bar"></div></div>
          <div class="sr-skeleton-card"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div><div class="sr-skeleton-line sr-skeleton-bar"></div></div>
          <div class="sr-skeleton-card"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div><div class="sr-skeleton-line sr-skeleton-bar"></div></div>
        </div>
      `;
    }

    if (!REST) {
      renderAssignedExamsList([]);
      return;
    }

    Promise.all([
      REST.get('assigned_exams').catch(() => null),
      syncWrongBankFromDB().catch(() => [])
    ]).then(([val]) => {
      const list = (val && typeof val === 'object')
        ? Object.keys(val).map((k) => ({ id: k, ...val[k] }))
        : [];

      // Filter for this class category
      const filtered = list.filter((ex) => {
        if (ex.category && ex.category !== 'all') {
          const exCat = extractBaseExamClass(ex.category) || String(ex.category).trim();
          if (exCat.toLowerCase() !== String(activePortalClass || 'HSC').toLowerCase()) {
            return false;
          }
        }
        return true;
      });

      renderAssignedExamsList(filtered);
    }).catch(() => {
      renderAssignedExamsList([]);
    });
  }

  function checkExamAccess(ex) {
    if (!ex.target || ex.target === 'all') return true;
    const myUid = getActiveUserUid();
    const mySlot = getActiveUserSlot();
    const myRoom = window.CODE || localStorage.getItem('sr-code') || '';
    if (ex.target === 'room') {
      return !ex.targetValue || ex.targetValue === 'all' || ex.targetValue === myRoom;
    }
    if (ex.target === 'uid') {
      return !ex.targetValue || ex.targetValue === 'all' || ex.targetValue === myUid || (mySlot && ex.targetValue === mySlot);
    }
    return true;
  }

  function renderEmptyAssignedState() {
    elements.assignedList.innerHTML = `
      <div style="text-align:center;padding:48px 20px;color:var(--ex-muted);background:var(--ex-surface);border:1.5px dashed var(--ex-border);border-radius:16px">
        <div style="font-size:36px;margin-bottom:10px">📅</div>
        <h4 style="margin:0 0 6px 0;font-size:17px;color:var(--ex-ink);font-weight:600">বর্তমানে কোনো নির্ধারিত পরীক্ষা নেই</h4>
        <p style="margin:0;font-size:13px;color:#64748b">অ্যাডমিন প্যানেল থেকে নতুন পরীক্ষা শিডিউল বা অ্যাসাইন করা হলে এখানে প্রদর্শিত হবে।</p>
      </div>
    `;
  }

  function renderPersonalTodayWrongCard() {
    const { todayItems } = getPartitionedWrongBank();
    if (!todayItems || todayItems.length === 0) return null;

    const card = document.createElement('div');
    card.className = 'assigned-exam-card';
    card.style.cssText = 'border:1.5px solid rgba(251,113,133,0.45);background:linear-gradient(135deg, rgba(136,19,55,0.24), rgba(15,23,42,0.9));flex-direction:column;align-items:stretch;gap:12px';

    const wrongC = todayItems.filter((x) => x.status !== 'skipped').length;
    const skipC = todayItems.filter((x) => x.status === 'skipped').length;
    const userName = getActiveUserDisplayName();

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div class="assigned-exam-info" style="flex:1;min-width:220px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
            <span style="font-size:11px;padding:3px 9px;border-radius:16px;background:rgba(244,63,94,0.22);color:#fda4af;font-weight:700">শুধু আপনার জন্য · আজ (${escHtml(userName)})</span>
            <span style="font-size:11px;color:#94a3b8">১ দিন পর "আমার ভুল করা প্রশ্ন"-তে যুক্ত হবে</span>
          </div>
          <h4 style="margin:0 0 6px">📌 আজকের ভুল ও স্কিপ করা প্রশ্ন (${toBn(todayItems.length)}টি)</h4>
          <div class="assigned-exam-meta">
            <span>✕ ভুল উত্তর: ${toBn(wrongC)}টি</span>
            <span>⚪ স্কিপ: ${toBn(skipC)}টি</span>
            <span>⬆ সর্বশেষ পরীক্ষা সবার উপরে</span>
          </div>
        </div>
        <div class="assigned-exam-actions" style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-view-today-wrong" type="button" style="background:rgba(56,189,248,0.16);border:1px solid rgba(56,189,248,0.45);color:#7dd3fc;padding:9px 14px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer">
            👁 প্রশ্নগুলো দেখুন
          </button>
          <button class="btn-start-assigned btn-start-today-wrong" type="button" style="background:linear-gradient(135deg,#e11d48,#be123c)">
            <span>▶</span> এগুলো দিয়ে পরীক্ষা দিন
          </button>
        </div>
      </div>
      <div class="today-wrong-preview-list" style="display:none;grid-template-columns:1fr;gap:10px;padding-top:10px;border-top:1px dashed rgba(255,255,255,0.14)"></div>
    `;

    const previewWrap = card.querySelector('.today-wrong-preview-list');
    const toggleBtn = card.querySelector('.btn-view-today-wrong');
    const startBtn = card.querySelector('.btn-start-today-wrong');

    const populatePreview = () => {
      previewWrap.innerHTML = '';
      const freshToday = getPartitionedWrongBank().todayItems;
      if (!freshToday.length) {
        loadAssignedExamsFromDB();
        return;
      }
      freshToday.forEach((item, idx) => {
        const qCard = createWrongBankReviewCard(item, idx, {
          onRemoved: () => {
            loadAssignedExamsFromDB();
          }
        });
        previewWrap.appendChild(qCard);
      });
    };

    if (toggleBtn && previewWrap) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = previewWrap.style.display === 'grid';
        if (isOpen) {
          previewWrap.style.display = 'none';
          toggleBtn.textContent = '👁 প্রশ্নগুলো দেখুন';
        } else {
          populatePreview();
          previewWrap.style.display = 'grid';
          toggleBtn.textContent = '▲ লুকান';
        }
      });
    }

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        startWrongBankPracticeExam('today');
      });
    }

    return card;
  }

  function renderAssignedExamsList(exams) {
    elements.assignedList.innerHTML = '';
    const list = Array.isArray(exams) ? exams : [];
    const todayWrongCard = renderPersonalTodayWrongCard();
    if (todayWrongCard) {
      elements.assignedList.appendChild(todayWrongCard);
    }

    if (list.length === 0) {
      if (!todayWrongCard) {
        renderEmptyAssignedState();
      }
      return;
    }

    list.forEach((ex) => {
      const card = document.createElement('div');
      card.className = 'assigned-exam-card';
      const qCount = Array.isArray(ex.questions) ? ex.questions.length : (Number(ex.totalQuestions) || 0);
      const isAllowed = checkExamAccess(ex);

      const safePdfUrl = (ex.pdfUrl && /^https?:\/\//i.test(String(ex.pdfUrl).trim())) ? String(ex.pdfUrl).trim() : '';
      card.innerHTML = `
        <div class="assigned-exam-info">
          <h4>${escHtml(ex.title)}</h4>
          <div class="assigned-exam-meta">
            <span>📚 ${escHtml(ex.subjectName || 'পূর্ণাঙ্গ পরীক্ষা')}</span>
            <span>⏱ ${Number(ex.durationMinutes) || 15} মিনিট</span>
            <span>📝 ${qCount}টি প্রশ্ন</span>
            <span>📅 ${escHtml(ex.scheduledDate || 'আজকে')}</span>
          </div>
          ${!isAllowed ? `
            <div style="background:rgba(239,68,68,0.12);border:1px dashed #ef4444;border-radius:8px;padding:6px 10px;margin-top:8px;display:inline-flex;align-items:center;gap:6px">
              <span style="font-size:14px">🔒</span>
              <span style="font-size:12px;color:#fca5a5;font-weight:600">অ্যাডমিন এখনও এই পরীক্ষার অ্যাক্সেস দেননি</span>
            </div>
          ` : ''}
        </div>
        <div class="assigned-exam-actions">
          ${safePdfUrl ? `<a href="${escHtml(safePdfUrl)}" target="_blank" rel="noopener noreferrer" class="btn-view-pdf">📄 প্রশ্ন PDF</a>` : ''}
          ${isAllowed ? `
            <button class="btn-start-assigned" type="button">
              <span>▶</span> পরীক্ষা শুরু করুন
            </button>
          ` : `
            <button class="btn-start-assigned" type="button" disabled style="background:#334155;color:#94a3b8;cursor:not-allowed;opacity:0.8">
              <span>🔒</span> লক করা
            </button>
          `}
        </div>
      `;

      if (isAllowed) {
        card.querySelector('.btn-start-assigned').addEventListener('click', () => {
          startExam(ex);
        });
      }

      elements.assignedList.appendChild(card);
    });
  }

  // Correct Answer Normalizer: Handles numbers, Bengali letters ('ক'-'ঘ'), English letters, and option strings
  function getQuestionCorrectIndex(q) {
    if (!q) return 0;
    let val = q.correct;
    if (val === undefined || val === null) val = q.answer;
    if (val === undefined || val === null) val = q.ans;
    if (val === undefined || val === null) val = q.correctAnswer;
    if (val === undefined || val === null) val = q.correct_answer;
    if (val === undefined || val === null) val = q.rightAnswer;

    if (typeof val === 'number') {
      return Math.max(0, Math.floor(val));
    }
    if (typeof val === 'string') {
      val = val.trim();
      if (/^\d+$/.test(val)) {
        return parseInt(val, 10);
      }
      const bnLetters = { 'ক': 0, 'খ': 1, 'গ': 2, 'ঘ': 3, 'ঙ': 4 };
      if (bnLetters[val] !== undefined) return bnLetters[val];
      const enLetters = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
      if (enLetters[val] !== undefined) return enLetters[val];

      if (Array.isArray(q.options)) {
        const idx = q.options.findIndex(opt => String(opt).trim().toLowerCase() === val.toLowerCase());
        if (idx !== -1) return idx;
      }
    }
    return 0;
  }

  let pendingExamToStart = null;
  let originalViewportMetaContent = null;

  function setActiveExamViewportLock(locked) {
    try {
      const meta = document.querySelector('meta[name="viewport"]');
      if (!meta) return;
      if (originalViewportMetaContent === null) {
        originalViewportMetaContent = meta.getAttribute('content') || 'width=device-width, initial-scale=1, viewport-fit=cover';
      }
      if (locked) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
      } else if (originalViewportMetaContent) {
        meta.setAttribute('content', originalViewportMetaContent);
      }
    } catch (e) {}
  }

  function requestExamNotificationPerm() {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch (e) {}
  }

  function sendExamTimerExpiredNotification(examTitle) {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('⏰ পরীক্ষার সময় শেষ!', {
          body: `${examTitle || 'অনলাইন পরীক্ষা'}-এর সময়সীমা শেষ হয়েছে। উত্তরপত্র স্বয়ংক্রিয়ভাবে জমা নেওয়া হয়েছে।`,
          icon: '/icon-192.png'
        });
      }
    } catch (e) {}
  }

  function handleExamBeforeUnload(e) {
    if (!State.isExamRunning) return;
    e.preventDefault();
    e.returnValue = '';
    return '';
  }

  function writeCancelledNoticeLocal(examTitle) {
    try {
      localStorage.setItem('sr_cancelled_exam_notice', JSON.stringify({
        examTitle: examTitle || 'অনুশীলন পরীক্ষা',
        at: Date.now()
      }));
    } catch (e) {}
  }

  function markSessionStatusKeepaliveSync(sessionId, examTitle, status, reason) {
    try {
      const REST = getREST();
      const userKey = getUserWrongBankKey();
      if (!REST || typeof REST.buildUrl !== 'function' || !userKey || !sessionId) return;
      const url = REST.buildUrl(`exam_sessions/${userKey}/${sessionId}`, null, null);
      fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          examTitle: examTitle || 'অনুশীলন পরীক্ষা',
          status: status || 'cancelled',
          reason: reason || 'page_unload',
          updatedAt: Date.now()
        }),
        keepalive: true,
        cache: 'no-store'
      }).catch(() => {});
    } catch (e) {}
  }

  function handleExamPageHide(e) {
    if (!State.isExamRunning) return;
    if (e && e.persisted) return;
    const sId = State.activeSessionId;
    const exTitle = State.activeExam ? State.activeExam.title : 'অনুশীলন পরীক্ষা';
    State.isExamRunning = false;
    clearInterval(State.timerInterval);
    clearInterval(State.leaveCountdownInterval);
    clearTimeout(State.autoSubmitTimer);
    State.timerInterval = null;
    State.leaveCountdownInterval = null;
    State.autoSubmitTimer = null;
    setActiveExamViewportLock(false);
    detachActiveExamExitGuards();
    try { localStorage.removeItem('sr_active_exam_session'); } catch (err) {}
    writeCancelledNoticeLocal(exTitle);
    if (sId) markSessionStatusKeepaliveSync(sId, exTitle, 'cancelled', 'page_unload');
  }

  function attachActiveExamExitGuards() {
    window.removeEventListener('beforeunload', handleExamBeforeUnload);
    window.removeEventListener('pagehide', handleExamPageHide);
    window.addEventListener('beforeunload', handleExamBeforeUnload);
    window.addEventListener('pagehide', handleExamPageHide);
  }

  function detachActiveExamExitGuards() {
    window.removeEventListener('beforeunload', handleExamBeforeUnload);
    window.removeEventListener('pagehide', handleExamPageHide);
  }

  function checkStaleOrCancelledExamSessionNotice() {
    const box = document.getElementById('examCancelledSessionNotice');
    let noticeTitle = '';
    try {
      const activeRaw = localStorage.getItem('sr_active_exam_session');
      if (activeRaw && !State.isExamRunning) {
        const stale = JSON.parse(activeRaw);
        localStorage.removeItem('sr_active_exam_session');
        if (stale && stale.sessionId) {
          noticeTitle = stale.examTitle || '';
          const REST = getREST();
          const uKey = stale.uid || getUserWrongBankKey();
          if (REST && uKey) {
            REST.set(`exam_sessions/${uKey}/${stale.sessionId}`, {
              sessionId: stale.sessionId,
              examTitle: noticeTitle || 'অনুশীলন পরীক্ষা',
              status: 'cancelled',
              reason: 'aborted_exit',
              updatedAt: Date.now()
            }).catch(() => {});
          }
        }
      }
      const cancRaw = localStorage.getItem('sr_cancelled_exam_notice');
      if (cancRaw) {
        const canc = JSON.parse(cancRaw);
        localStorage.removeItem('sr_cancelled_exam_notice');
        if (canc && canc.examTitle) noticeTitle = canc.examTitle;
      }
    } catch (e) {}

    if (box) {
      if (noticeTitle) {
        box.style.display = 'flex';
        box.innerHTML = `
          <span><strong>${escHtml(noticeTitle)}</strong> পরীক্ষাটি চলমান অবস্থায় পেজ বন্ধ/রিফ্রেশ করায় বাতিল হয়েছে (স্কোর সংরক্ষিত হয়নি)।</span>
          <button type="button" id="btnDismissCancelledNotice" style="background:transparent;border:none;color:#fca5a5;font-size:16px;cursor:pointer;padding:0 4px">✕</button>
        `;
        const dismissBtn = document.getElementById('btnDismissCancelledNotice');
        if (dismissBtn) dismissBtn.onclick = () => { box.style.display = 'none'; };
      } else {
        box.style.display = 'none';
      }
    }
  }

  function getExamCategoryForPractice(exam) {
    if (!exam) return getStudentClass();
    if (exam.category) return extractBaseExamClass(exam.category) || String(exam.category).trim();
    if (exam.classCategory) return extractBaseExamClass(exam.classCategory) || String(exam.classCategory).trim();
    if (State.currentSubject) return getSubjectCategory(State.currentSubject);
    return getStudentClass();
  }

  function isUncappedPracticeCategory(exam) {
    const cat = String(getExamCategoryForPractice(exam) || '').toLowerCase();
    return cat === 'admission' || cat === 'bcs' || cat.includes('job');
  }

  function syncPreExamCustomPracticeUI(shouldClampValues = false) {
    const exam = pendingExamToStart;
    if (!exam) return;
    const totalQ = (exam.questions || []).length;
    const defaultDur = Number(exam.durationMinutes) || 15;
    const maxCustomQ = Math.max(3, totalQ - 1);
    const canCustom = totalQ > 3;
    const isUncapped = isUncappedPracticeCategory(exam);

    const modeAllBtn = document.getElementById('optPracticeModeAll');
    const modeCustomBtn = document.getElementById('optPracticeModeCustom');
    const radioAll = document.getElementById('radioModeAll');
    const radioCustom = document.getElementById('radioModeCustom');
    const customInputs = document.getElementById('preExamCustomInputs');
    const inpQ = document.getElementById('inpCustomQCount');
    const inpMin = document.getElementById('inpCustomMinutes');
    const qHintEl = document.getElementById('customQRangeHint');
    const timeHintEl = document.getElementById('customTimeRuleHint');
    const warnEl = document.getElementById('preExamCustomWarn');

    if (modeAllBtn) modeAllBtn.classList.toggle('active', !radioCustom || !radioCustom.checked);
    if (modeCustomBtn) {
      modeCustomBtn.classList.toggle('disabled', !canCustom);
      modeCustomBtn.classList.toggle('active', !!(canCustom && radioCustom && radioCustom.checked));
    }
    if (!canCustom && radioAll && radioCustom) {
      radioAll.checked = true;
      radioCustom.checked = false;
    }

    const isCustom = !!(canCustom && radioCustom && radioCustom.checked);
    if (customInputs) customInputs.style.display = isCustom ? 'grid' : 'none';

    if (!isCustom) {
      if (warnEl) {
        if (!canCustom) {
          warnEl.style.display = 'block';
          warnEl.textContent = `এই সেটে মাত্র ${toBn(totalQ)}টি প্রশ্ন রয়েছে; কাস্টম অনুশীলনের জন্য কমপক্ষে ৪টি প্রশ্ন প্রয়োজন।`;
        } else {
          warnEl.style.display = 'none';
          warnEl.textContent = '';
        }
      }
      return;
    }

    let warnMsgs = [];
    let qVal = inpQ ? parseInt(inpQ.value, 10) : NaN;
    if (Number.isNaN(qVal)) {
      if (inpQ && !inpQ.value) {
        qVal = Math.min(10, maxCustomQ);
        inpQ.value = String(qVal);
      }
    }
    if (!Number.isNaN(qVal)) {
      if (qVal < 3) {
        warnMsgs.push('সর্বনিম্ন ৩টি প্রশ্ন নির্বাচন করতে হবে।');
        if (shouldClampValues && inpQ) { qVal = 3; inpQ.value = '3'; }
      } else if (qVal > maxCustomQ) {
        warnMsgs.push(`কাস্টম মোডে সর্বোচ্চ ${toBn(maxCustomQ)}টি প্রশ্ন নেওয়া যাবে (সম্পূর্ণ সেটের জন্য All Questions বেছে নিন)।`);
        if (shouldClampValues && inpQ) { qVal = maxCustomQ; inpQ.value = String(maxCustomQ); }
      }
    }
    const effectiveQ = (!Number.isNaN(qVal) && qVal >= 3 && qVal <= maxCustomQ) ? qVal : Math.min(10, maxCustomQ);

    if (qHintEl) {
      qHintEl.textContent = `Type 3 - ${maxCustomQ} (মোট ${toBn(totalQ)}টি থেকে সর্বোচ্চ ${toBn(maxCustomQ)}টি)`;
    }
    if (timeHintEl) {
      timeHintEl.textContent = isUncapped
        ? 'Admission / BCS মোড: যেকোনো কাস্টম মিনিট দিতে পারবেন (ক্যাপ নেই)'
        : `সর্বোচ্চ ${toBn(effectiveQ)} মিনিট (প্রশ্ন প্রতি সর্বোচ্চ ১ মিনিট)`;
    }
    if (inpMin) {
      if (!isUncapped) {
        inpMin.setAttribute('max', String(effectiveQ));
        inpMin.placeholder = `সর্বোচ্চ ${effectiveQ} মি.`;
      } else {
        inpMin.removeAttribute('max');
        inpMin.placeholder = `যেমন: ${Math.max(5, Math.min(defaultDur, effectiveQ))}`;
      }
      const mRaw = inpMin.value.trim();
      if (mRaw !== '') {
        let mVal = parseInt(mRaw, 10);
        if (Number.isNaN(mVal) || mVal < 1) {
          warnMsgs.push('সময়সীমা কমপক্ষে ১ মিনিট হতে হবে।');
          if (shouldClampValues) { mVal = 1; inpMin.value = '1'; }
        } else if (!isUncapped && mVal > effectiveQ) {
          warnMsgs.push(`এই ক্যাটাগরিতে ${toBn(effectiveQ)}টি প্রশ্নের জন্য সর্বোচ্চ ${toBn(effectiveQ)} মিনিট দেওয়া যাবে।`);
          if (shouldClampValues) { mVal = effectiveQ; inpMin.value = String(effectiveQ); }
        }
      }
    }

    if (warnEl) {
      if (warnMsgs.length > 0) {
        warnEl.style.display = 'block';
        warnEl.textContent = warnMsgs.join(' ');
      } else {
        warnEl.style.display = 'none';
        warnEl.textContent = '';
      }
    }
  }

  function resolvePreExamStartConfig(baseExam) {
    const totalQ = (baseExam.questions || []).length;
    const defaultDur = Number(baseExam.durationMinutes) || 15;
    const radioCustom = document.getElementById('radioModeCustom');
    const isCustom = !!(totalQ > 3 && radioCustom && radioCustom.checked);
    const setId = baseExam.sourceSetId || baseExam.id || baseExam.chapterId || 'default_set';

    if (!isCustom) {
      return {
        valid: true,
        examConfig: {
          ...baseExam,
          sourceSetId: setId,
          isCustomPractice: false,
          questions: (baseExam.questions || []).slice(),
          durationMinutes: defaultDur
        }
      };
    }

    const inpQ = document.getElementById('inpCustomQCount');
    const inpMin = document.getElementById('inpCustomMinutes');
    const warnEl = document.getElementById('preExamCustomWarn');
    const maxCustomQ = Math.max(3, totalQ - 1);
    const isUncapped = isUncappedPracticeCategory(baseExam);

    let qCount = inpQ ? parseInt(inpQ.value, 10) : NaN;
    if (Number.isNaN(qCount) || qCount < 3 || qCount > maxCustomQ) {
      syncPreExamCustomPracticeUI(true);
      if (warnEl) {
        warnEl.style.display = 'block';
        warnEl.textContent = `অনুগ্রহ করে ৩ থেকে ${toBn(maxCustomQ)} এর মধ্যে সঠিক প্রশ্ন সংখ্যা লিখুন।`;
      }
      if (inpQ) inpQ.focus();
      return { valid: false };
    }

    let customDur = qCount;
    const minStr = inpMin ? inpMin.value.trim() : '';
    if (minStr !== '') {
      const parsedMin = parseInt(minStr, 10);
      if (Number.isNaN(parsedMin) || parsedMin < 1) {
        if (warnEl) {
          warnEl.style.display = 'block';
          warnEl.textContent = 'কাস্টম সময় কমপক্ষে ১ মিনিট হতে হবে।';
        }
        if (inpMin) inpMin.focus();
        return { valid: false };
      }
      if (!isUncapped && parsedMin > qCount) {
        if (inpMin) inpMin.value = String(qCount);
        if (warnEl) {
          warnEl.style.display = 'block';
          warnEl.textContent = `${toBn(qCount)}টি প্রশ্নের জন্য সর্বোচ্চ ${toBn(qCount)} মিনিট দেওয়া যাবে (স্বয়ংক্রিয়ভাবে সমন্বয় করা হয়েছে)।`;
        }
        return { valid: false };
      }
      customDur = parsedMin;
    } else if (!isUncapped) {
      customDur = Math.min(qCount, defaultDur);
    } else {
      customDur = Math.min(qCount, defaultDur);
    }

    const selectedQs = buildCustomExamSelection(baseExam.questions, setId, qCount);
    return {
      valid: true,
      examConfig: {
        ...baseExam,
        sourceSetId: setId,
        isCustomPractice: true,
        customRequestedCount: qCount,
        originalTotalCount: totalQ,
        questions: selectedQs,
        durationMinutes: customDur
      }
    };
  }

  // 10. Start Exam Session (Opens Pre-Exam Settings for Custom Practice & Negative Marking)
  function startExam(exam) {
    if (!exam || !exam.questions || exam.questions.length === 0) {
      showExamNotice('এই টেস্ট সেটে এখনো কোনো প্রশ্ন পাওয়া যায়নি।');
      return;
    }
    const baseExam = {
      ...exam,
      sourceSetId: exam.sourceSetId || exam.id || exam.chapterId || 'default_set'
    };
    pendingExamToStart = baseExam;
    showPreExamSettingsModal(baseExam);
  }

  function showPreExamSettingsModal(exam) {
    const totalQ = (exam.questions || []).length;
    const durationMin = Number(exam.durationMinutes) || 15;
    const setId = exam.sourceSetId || exam.id || exam.chapterId || 'default_set';
    const progStats = computeSetProgressStats(setId, exam.questions || []);
    const catLabel = getExamCategoryForPractice(exam);

    const modalTitleEl = document.getElementById('preExamTitle');
    const qCountEl = document.getElementById('preExamQCount');
    const unmasteredEl = document.getElementById('preExamUnmastered');
    const durEl = document.getElementById('preExamDuration');
    const masteryLabel = document.getElementById('preExamMasteryLabel');
    const masteryBar = document.getElementById('preExamMasteryBar');
    const catPill = document.getElementById('preExamCategoryPill');
    const allSubEl = document.getElementById('preExamAllSub');
    const customRangeSub = document.getElementById('preExamCustomRangeSub');
    const radioAll = document.getElementById('radioModeAll');
    const radioCustom = document.getElementById('radioModeCustom');
    const inpQ = document.getElementById('inpCustomQCount');
    const inpMin = document.getElementById('inpCustomMinutes');
    const overlay = document.getElementById('preExamSettingsOverlay');

    if (modalTitleEl) modalTitleEl.innerText = exam.title || 'অনলাইন পরীক্ষা';
    if (qCountEl) qCountEl.innerText = `${toBn(totalQ)}টি`;
    if (unmasteredEl) unmasteredEl.innerText = `${toBn(progStats.remainingUnmastered)}টি`;
    if (durEl) durEl.innerText = `${toBn(durationMin)} মিনিট`;
    if (masteryLabel) masteryLabel.innerText = `Completed: ${toBn(progStats.pct)}% (${toBn(progStats.masteredCount)}/${toBn(progStats.total)})`;
    if (masteryBar) masteryBar.style.width = `${progStats.pct}%`;
    if (catPill) catPill.innerText = catLabel === 'BCS' ? 'BCS / Job' : catLabel;
    if (allSubEl) allSubEl.innerText = `${toBn(totalQ)}টি প্রশ্ন · ${toBn(durationMin)} মিনিট`;

    const maxCustomQ = Math.max(3, totalQ - 1);
    if (customRangeSub) {
      customRangeSub.innerText = totalQ > 3
        ? `Type 3 - ${maxCustomQ} (Unmastered আগে)`
        : 'কমপক্ষে ৪টি প্রশ্ন প্রয়োজন';
    }

    // Default state: "All Questions" pre-selected with original duration
    if (radioAll) radioAll.checked = true;
    if (radioCustom) radioCustom.checked = false;
    if (inpQ) {
      inpQ.min = '3';
      inpQ.max = String(maxCustomQ);
      inpQ.placeholder = `Type 3 - ${maxCustomQ}`;
      inpQ.value = String(Math.min(10, maxCustomQ));
    }
    if (inpMin) {
      inpMin.value = '';
    }
    syncPreExamCustomPracticeUI(false);

    // Refresh DB progress asynchronously in case another device updated it
    syncSetProgressFromDB().then(() => {
      if (!pendingExamToStart || pendingExamToStart !== exam) return;
      const freshStats = computeSetProgressStats(setId, exam.questions || []);
      if (unmasteredEl) unmasteredEl.innerText = `${toBn(freshStats.remainingUnmastered)}টি`;
      if (masteryLabel) masteryLabel.innerText = `Completed: ${toBn(freshStats.pct)}% (${toBn(freshStats.masteredCount)}/${toBn(freshStats.total)})`;
      if (masteryBar) masteryBar.style.width = `${freshStats.pct}%`;
    }).catch(() => {});

    // Default to Negative Marking Enabled (or user preference)
    const optYes = document.getElementById('optNegativeEnabled');
    const optNo = document.getElementById('optNegativeDisabled');
    const radYes = document.getElementById('radioNegYes');
    const radNo = document.getElementById('radioNegNo');

    if (radYes) radYes.checked = true;
    if (radNo) radNo.checked = false;
    if (optYes) optYes.classList.add('selected');
    if (optNo) optNo.classList.remove('selected');

    if (overlay) {
      overlay.classList.add('active');
    } else {
      executeStartExam(exam, true);
    }
  }

  function executeStartExam(exam, enableNegativeMarking = true) {
    State.negativeMarkingEnabled = !!enableNegativeMarking;
    State.activeExam = exam;
    State.activeQuestions = (exam.questions || []).slice();
    State.currentQIndex = 0;
    State.userAnswers = {};
    State.flaggedQuestions.clear();
    State.tabSwitchCount = 0;
    State.isExamRunning = true;
    State.penaltyApplied = false;
    State.startTime = Date.now();
    State.examExpiryHandled = false;
    State.activeSessionId = 'es_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);

    const durationMin = Number(exam.durationMinutes) || 15;
    State.totalDurationSeconds = durationMin * 60;
    State.timeRemainingSeconds = State.totalDurationSeconds;
    State.examEndTime = Date.now() + State.totalDurationSeconds * 1000;

    setActiveExamViewportLock(true);
    attachActiveExamExitGuards();
    requestExamNotificationPerm();

    try {
      const userKey = getUserWrongBankKey();
      localStorage.setItem('sr_active_exam_session', JSON.stringify({
        sessionId: State.activeSessionId,
        examId: exam.id || '',
        examTitle: exam.title || 'অনুশীলন পরীক্ষা',
        uid: userKey,
        status: 'in_progress',
        startedAt: State.startTime
      }));
      const REST = getREST();
      if (REST && userKey) {
        REST.set(`exam_sessions/${userKey}/${State.activeSessionId}`, {
          sessionId: State.activeSessionId,
          examId: exam.id || '',
          examTitle: exam.title || 'অনুশীলন পরীক্ষা',
          status: 'in_progress',
          startedAt: State.startTime
        }).catch(() => {});
      }
    } catch (e) {}

    // Header info
    const negTag = State.negativeMarkingEnabled ? 'মাইনাস মার্কিং: চালু (-০.২৫)' : 'সাধারণ মোড (নেগেটিভ নেই)';
    const customTag = exam.isCustomPractice ? ` · কাস্টম (${toBn(State.activeQuestions.length)}টি)` : '';
    if (elements.activeBadge) {
      elements.activeBadge.innerText = `· সময় ${toBn(durationMin)} মি.${customTag} · ${negTag}`;
    }
    if (elements.activeSubTitle) {
      elements.activeSubTitle.innerText = exam.title || '';
    }

    if (exam.pdfUrl) {
      elements.pdfToggle.style.display = 'block';
      elements.pdfLink.href = exam.pdfUrl;
    } else {
      elements.pdfToggle.style.display = 'none';
    }

    if (elements.totalQNum) {
      elements.totalQNum.innerText = toBn(State.activeQuestions.length);
    }

    // Show active exam panel & hide floating back button so it never overlaps
    Object.keys(elements.panels).forEach((k) => elements.panels[k] && elements.panels[k].classList.remove('active'));
    elements.panels.activeExam.classList.add('active');
    syncFloatingBackButtonVisibility();

    // Reset interaction states
    if (elements.optionsContainer) {
      elements.optionsContainer.style.pointerEvents = 'auto';
      elements.optionsContainer.style.opacity = '1';
    }
    if (elements.prevBtn) elements.prevBtn.disabled = false;
    if (elements.nextBtn) elements.nextBtn.disabled = false;
    if (elements.btnConfirmSubmit) elements.btnConfirmSubmit.disabled = false;

    // Load first question & timer
    loadQuestion(0);
    renderQuestionPalette();
    startCountdownTimer();
  }

  // 11. Load & Render Individual Question
  function loadQuestion(index) {
    if (index < 0 || index >= State.activeQuestions.length) return;
    State.currentQIndex = index;
    const total = State.activeQuestions.length;
    const q = State.activeQuestions[index];

    if (elements.currentQNum) elements.currentQNum.innerText = toBn(index + 1);
    if (elements.totalQNum) elements.totalQNum.innerText = toBn(total);
    if (elements.stepCounter) elements.stepCounter.innerText = `প্রশ্ন ${toBn(index + 1)} / ${toBn(total)}`;
    if (elements.mobileProgressLabel) elements.mobileProgressLabel.innerText = `প্রশ্ন ${toBn(index + 1)} / ${toBn(total)}`;
    elements.qText.innerText = `${toBn(index + 1)}. ${q.question}`;

    const safeImg = sanitizeQuestionImageUrl(q.image);
    if (elements.qImageWrap && elements.qImage) {
      if (safeImg) {
        elements.qImage.onerror = () => {
          if (elements.qImageWrap) elements.qImageWrap.style.display = 'none';
        };
        elements.qImage.src = safeImg;
        elements.qImageWrap.style.display = 'flex';
      } else {
        elements.qImageWrap.style.display = 'none';
        elements.qImage.removeAttribute('src');
      }
    }

    // Options rendering (2x2 Grid)
    elements.optionsContainer.innerHTML = '';
    const letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
    (q.options || []).forEach((opt, optIdx) => {
      const isSelected = State.userAnswers.hasOwnProperty(index) && State.userAnswers[index] === optIdx;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `exam-option-item ${isSelected ? 'selected' : ''}`;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      btn.innerHTML = `
        <span class="exam-option-letter">${letters[optIdx] || toBn(optIdx + 1)}</span>
        <span style="flex:1;min-width:0">${escHtml(opt)}</span>
      `;
      btn.addEventListener('click', () => {
        selectOption(optIdx);
      });
      elements.optionsContainer.appendChild(btn);
    });

    // Flag status
    const isFlagged = State.flaggedQuestions.has(index);
    elements.flagBtn.classList.toggle('flagged', isFlagged);
    elements.flagText.innerText = isFlagged ? 'চিহ্নিত করা হয়েছে' : 'পরে দেখার জন্য চিহ্নিত করুন';

    // Prev / Next button states
    elements.prevBtn.disabled = index === 0;
    const isLast = index === total - 1;
    elements.nextBtn.classList.toggle('finish-mode', isLast);
    if (isLast) {
      elements.nextBtn.innerText = 'পরীক্ষা জমা দিন ✓';
    } else {
      elements.nextBtn.innerText = 'পরবর্তী →';
    }

    renderQuestionPalette();
  }

  // Option selection with unselect/toggle capability
  function selectOption(optIdx) {
    // If student clicks on the already selected option, unselect / deselect it
    if (State.userAnswers.hasOwnProperty(State.currentQIndex) && State.userAnswers[State.currentQIndex] === optIdx) {
      delete State.userAnswers[State.currentQIndex];
    } else {
      State.userAnswers[State.currentQIndex] = optIdx;
    }
    loadQuestion(State.currentQIndex);
  }

  function navigateQuestion(step) {
    const nextIdx = State.currentQIndex + step;
    if (nextIdx >= 0 && nextIdx < State.activeQuestions.length) {
      loadQuestion(nextIdx);
    }
  }

  function toggleFlag() {
    const idx = State.currentQIndex;
    if (State.flaggedQuestions.has(idx)) {
      State.flaggedQuestions.delete(idx);
    } else {
      State.flaggedQuestions.add(idx);
    }
    loadQuestion(idx);
  }

  function renderStepProgressRail() {
    if (!elements.stepRail) return;
    elements.stepRail.innerHTML = '';
    const total = State.activeQuestions.length;
    let activeNodeEl = null;

    for (let idx = 0; idx < total; idx++) {
      const isAnswered = State.userAnswers.hasOwnProperty(idx) && State.userAnswers[idx] !== undefined && State.userAnswers[idx] !== null;
      const isFlagged = State.flaggedQuestions.has(idx);
      const isCurrent = idx === State.currentQIndex;

      if (idx > 0) {
        const line = document.createElement('span');
        const prevAnswered = State.userAnswers.hasOwnProperty(idx - 1) && State.userAnswers[idx - 1] !== undefined && State.userAnswers[idx - 1] !== null;
        line.className = `exam-step-line${(prevAnswered || idx <= State.currentQIndex) ? ' done' : ''}`;
        elements.stepRail.appendChild(line);
      }

      const node = document.createElement('button');
      node.type = 'button';
      let cls = 'exam-step-node';
      if (isCurrent) cls += ' current';
      else if (isFlagged) cls += ' flagged';
      else if (isAnswered) cls += ' answered';

      node.className = cls;
      node.title = `প্রশ্ন ${toBn(idx + 1)}`;
      node.setAttribute('aria-label', `প্রশ্ন ${toBn(idx + 1)}`);
      node.innerText = (isAnswered && !isCurrent) ? '✓' : toBn(idx + 1);
      node.addEventListener('click', () => loadQuestion(idx));
      if (isCurrent) activeNodeEl = node;
      elements.stepRail.appendChild(node);
    }

    if (activeNodeEl && elements.stepRailScroll && typeof activeNodeEl.scrollIntoView === 'function') {
      try {
        activeNodeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } catch (e) {}
    }
  }

  function renderQuestionPalette() {
    elements.paletteGrid.innerHTML = '';
    const total = State.activeQuestions.length;
    let countAnswered = 0;
    let countFlagged = 0;
    let countSkipped = 0;

    State.activeQuestions.forEach((_, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isAnswered = State.userAnswers.hasOwnProperty(idx) && State.userAnswers[idx] !== undefined && State.userAnswers[idx] !== null;
      const isFlagged = State.flaggedQuestions.has(idx);
      const isCurrent = idx === State.currentQIndex;

      if (isAnswered) countAnswered++;
      else countSkipped++;
      if (isFlagged) countFlagged++;

      let cls = 'palette-num-btn';
      if (isFlagged) cls += ' flagged';
      else if (isAnswered) cls += ' answered';

      if (isCurrent) cls += ' current';

      btn.className = cls;
      btn.innerText = idx + 1;
      btn.setAttribute('aria-label', `প্রশ্ন ${toBn(idx + 1)}`);
      btn.addEventListener('click', () => {
        loadQuestion(idx);
      });
      elements.paletteGrid.appendChild(btn);
    });

    if (elements.palCountAnswered) elements.palCountAnswered.innerText = toBn(countAnswered);
    if (elements.palCountFlagged) elements.palCountFlagged.innerText = toBn(countFlagged);
    if (elements.palCountSkipped) elements.palCountSkipped.innerText = toBn(countSkipped);
    if (elements.stepAnsweredStat) elements.stepAnsweredStat.innerText = `উত্তর ${toBn(countAnswered)} · বাকি ${toBn(countSkipped)}`;
    if (elements.sidebarSubMeta) {
      const minsTotal = Math.round((State.totalDurationSeconds || 900) / 60);
      elements.sidebarSubMeta.innerText = `মোট ${toBn(minsTotal)} মি. · উত্তর ${toBn(countAnswered)}/${toBn(total)}`;
    }

    renderStepProgressRail();
  }

  // 12. Traditional School Bell Audio Synthesizer (Web Audio API)
  function playSchoolBellSound() {
    if (State.soundMuted) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      // Traditional 4-strike school bell chime
      [0.0, 0.45, 0.9, 1.35].forEach((t) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(830, now + t); // Resonant chime frequency
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1660, now + t); // Octave harmonic

        gain.gain.setValueAtTime(0.35, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.42);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now + t);
        osc2.start(now + t);
        osc1.stop(now + t + 0.45);
        osc2.stop(now + t + 0.45);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // 12. Live Drift-Free Countdown Timer with Dynamic Green/Orange/Red Progress & Heartbeat Alert
  function getTimerColorPhase(remSeconds, totalDurationSeconds) {
    const totalMins = Math.round((totalDurationSeconds || 900) / 60);
    if (totalMins > 30) {
      if (remSeconds > 300) return 'green';
      if (remSeconds > 60) return 'orange';
      return 'red';
    }
    if (totalMins >= 10) {
      if (remSeconds > 180) return 'green';
      if (remSeconds > 60) return 'orange';
      return 'red';
    }
    if (remSeconds > 60) return 'green';
    if (remSeconds > 30) return 'orange';
    return 'red';
  }

  function syncExamCountdownTick() {
    if (!State.isExamRunning) return;
    if (!State.examEndTime) {
      State.examEndTime = Date.now() + (State.timeRemainingSeconds || 0) * 1000;
    }
    const rem = Math.max(0, Math.ceil((State.examEndTime - Date.now()) / 1000));
    State.timeRemainingSeconds = rem;
    updateTimerDisplay();

    if (rem <= 0 && !State.examExpiryHandled) {
      State.examExpiryHandled = true;
      clearInterval(State.timerInterval);
      State.timerInterval = null;

      // 1. Play school bell sound & background notification
      playSchoolBellSound();
      sendExamTimerExpiredNotification(State.activeExam ? State.activeExam.title : 'অনলাইন পরীক্ষা');

      // 2. Lock option clicks and actions immediately
      if (elements.optionsContainer) {
        elements.optionsContainer.style.pointerEvents = 'none';
        elements.optionsContainer.style.opacity = '0.65';
      }
      if (elements.prevBtn) elements.prevBtn.disabled = true;
      if (elements.nextBtn) elements.nextBtn.disabled = true;
      if (elements.btnConfirmSubmit) elements.btnConfirmSubmit.disabled = true;

      // 3. Wait 2.5 seconds before showing final result
      clearTimeout(State.autoSubmitTimer);
      State.autoSubmitTimer = setTimeout(() => {
        finalizeExam(false, 'সময় শেষ হয়ে গেছে! উত্তরপত্র স্বয়ংক্রিয়ভাবে জমা নেওয়া হলো।');
      }, 2500);
    }
  }

  function startCountdownTimer() {
    clearInterval(State.timerInterval);
    clearTimeout(State.autoSubmitTimer);
    State.autoSubmitTimer = null;
    State.examExpiryHandled = false;
    if (!State.examEndTime) {
      State.examEndTime = Date.now() + (State.timeRemainingSeconds || 0) * 1000;
    }
    syncExamCountdownTick();

    State.timerInterval = setInterval(syncExamCountdownTick, 500);
  }

  function updateTimerDisplay() {
    const rem = Math.max(0, State.timeRemainingSeconds);
    const mins = Math.floor(rem / 60);
    const secs = rem % 60;
    const timeFormatted = toBn(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

    if (elements.timerDisplay) {
      elements.timerDisplay.innerText = timeFormatted;
    }
    if (elements.mobileTimerDisplay) {
      elements.mobileTimerDisplay.innerText = timeFormatted;
    }

    // Circular progress calculation (r = 50 -> 2 * PI * 50 = 314.16; mobile r = 15 -> 94.25)
    const totalSecs = State.totalDurationSeconds || 900;
    const progressRatio = Math.max(0, Math.min(1, rem / totalSecs));

    if (elements.circularTimerProgress) {
      elements.circularTimerProgress.style.strokeDashoffset = (314.16 * (1 - progressRatio)).toFixed(2);
    }
    if (elements.mobileCircularProgress) {
      elements.mobileCircularProgress.style.strokeDashoffset = (94.25 * (1 - progressRatio)).toFixed(2);
    }

    const phase = getTimerColorPhase(rem, totalSecs);
    const isRedPulse = (phase === 'red' && rem > 0);
    const applyPhaseClasses = (el) => {
      if (!el) return;
      el.classList.toggle('timer-green', phase === 'green');
      el.classList.toggle('timer-orange', phase === 'orange');
      el.classList.toggle('timer-red', phase === 'red');
      el.classList.toggle('timer-critical', phase === 'red');
    };

    applyPhaseClasses(elements.circularTimerProgress);
    applyPhaseClasses(elements.timerDisplay);
    applyPhaseClasses(elements.mobileCircularProgress);
    applyPhaseClasses(elements.mobileTimerDisplay);

    if (elements.circularTimerContainer) {
      elements.circularTimerContainer.classList.toggle('timer-heartbeat-anim', isRedPulse);
    }
    if (elements.mobileCircularBadge) {
      elements.mobileCircularBadge.classList.toggle('timer-heartbeat-anim', isRedPulse);
    }

    // Fallback timer box if visible
    if (elements.timerBox) {
      if (phase === 'red') {
        elements.timerBox.style.background = 'rgba(239, 68, 68, 0.25)';
        elements.timerBox.style.borderColor = '#ef4444';
      } else if (phase === 'orange') {
        elements.timerBox.style.background = 'rgba(255, 152, 0, 0.16)';
        elements.timerBox.style.borderColor = '#ff9800';
      } else {
        elements.timerBox.style.background = 'rgba(16, 185, 129, 0.12)';
        elements.timerBox.style.borderColor = 'rgba(16, 185, 129, 0.35)';
      }
    }
  }

  // 13. Strict Proctoring / Leave Warning (20s Return Penalty System)
  function handleVisibilityOrBlur() {
    if (!State.isExamRunning) return;

    if (document.hidden) {
      triggerStrictLeaveWarning();
    }
  }

  function triggerStrictLeaveWarning() {
    if (!State.isExamRunning) return;
    State.tabSwitchCount++;

    // Max 1 leave allowed! If 2nd violation occurs, immediate Zero Marks!
    if (State.tabSwitchCount >= 2) {
      clearInterval(State.leaveCountdownInterval);
      elements.strictOverlay.classList.remove('active');
      finalizeExam(true, 'বারবার নিয়ম লঙ্ঘন করায় আপনার পরীক্ষা ০ নম্বরে বাতিল করা হয়েছে!');
      return;
    }

    // 1st leave: Show overlay and run emergency 20s timer
    State.leaveCountdownSeconds = 20;
    elements.countdownDisplay.innerText = `${State.leaveCountdownSeconds} সেকেন্ড`;
    elements.strictOverlay.classList.add('active');

    clearInterval(State.leaveCountdownInterval);
    State.leaveCountdownInterval = setInterval(() => {
      State.leaveCountdownSeconds--;
      elements.countdownDisplay.innerText = `${State.leaveCountdownSeconds} সেকেন্ড`;

      if (State.leaveCountdownSeconds <= 0) {
        clearInterval(State.leaveCountdownInterval);
        elements.strictOverlay.classList.remove('active');
        // Failed to return within 20 seconds -> 0 marks penalty!
        finalizeExam(true, '২০ সেকেন্ডের মধ্যে পরীক্ষায় ফিরে না আসায় ০ নম্বরে পরীক্ষা বাতিল হলো!');
      }
    }, 1000);
  }

  function closeStrictWarning() {
    clearInterval(State.leaveCountdownInterval);
    elements.strictOverlay.classList.remove('active');
  }

  // 14. Exam Submission Modal & Calculation
  function showConfirmSubmitModal() {
    const total = State.activeQuestions.length;
    const answered = Object.keys(State.userAnswers).length;
    const remaining = total - answered;

    elements.confirmMsg.innerHTML = `
      আপনি মোট <strong>${total}টি</strong> প্রশ্নের মধ্যে <strong>${answered}টি</strong> উত্তর দিয়েছেন।
      ${remaining > 0 ? `<br><span style="color:#f87171">এখনও <strong>${remaining}টি</strong> প্রশ্নের উত্তর দেওয়া বাকি রয়েছে!</span>` : ''}
    `;
    elements.confirmOverlay.classList.add('active');
  }

  function finalizeExam(isPenaltyZero = false, customReason = null) {
    if (!State.isExamRunning) return;
    State.isExamRunning = false;
    clearInterval(State.timerInterval);
    clearInterval(State.leaveCountdownInterval);
    clearTimeout(State.autoSubmitTimer);
    State.timerInterval = null;
    State.leaveCountdownInterval = null;
    State.autoSubmitTimer = null;
    setActiveExamViewportLock(false);
    detachActiveExamExitGuards();

    try { localStorage.removeItem('sr_active_exam_session'); } catch (e) {}
    if (State.activeSessionId) {
      const REST = getREST();
      const userKey = getUserWrongBankKey();
      if (REST && userKey) {
        REST.set(`exam_sessions/${userKey}/${State.activeSessionId}`, {
          sessionId: State.activeSessionId,
          examId: (State.activeExam && State.activeExam.id) || '',
          examTitle: (State.activeExam && State.activeExam.title) || 'অনুশীলন পরীক্ষা',
          status: isPenaltyZero ? 'penalty_zero' : 'completed',
          completedAt: Date.now()
        }).catch(() => {});
      }
      State.activeSessionId = null;
    }

    if (elements.strictOverlay) elements.strictOverlay.classList.remove('active');
    if (elements.confirmOverlay) elements.confirmOverlay.classList.remove('active');

    const total = State.activeQuestions.length;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    State.activeQuestions.forEach((q, idx) => {
      const isAnswered = State.userAnswers.hasOwnProperty(idx) && 
                         State.userAnswers[idx] !== undefined && 
                         State.userAnswers[idx] !== null && 
                         State.userAnswers[idx] !== '';
      const correctIdx = getQuestionCorrectIndex(q);

      if (!isAnswered) {
        skippedCount++;
      } else if (Number(State.userAnswers[idx]) === correctIdx) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const elapsedByClock = State.startTime ? Math.round((Date.now() - State.startTime) / 1000) : (State.totalDurationSeconds - State.timeRemainingSeconds);
    const timeSpentSeconds = Math.max(1, Math.min(State.totalDurationSeconds || elapsedByClock, elapsedByClock));
    const timeSpentFormatted = `${Math.floor(timeSpentSeconds / 60)} মি. ${timeSpentSeconds % 60} সে.`;

    let penaltyDeduction = 0;
    let finalScore = correctCount;

    if (State.negativeMarkingEnabled) {
      penaltyDeduction = wrongCount * 0.25;
      finalScore = Math.max(0, correctCount - penaltyDeduction);
    }

    let finalPercentage = total > 0 ? Math.max(0, Math.round((finalScore / total) * 100)) : 0;

    if (isPenaltyZero) {
      State.penaltyApplied = true;
      finalScore = 0;
      finalPercentage = 0;
    }

    const displayScore = Number.isInteger(finalScore) ? String(finalScore) : finalScore.toFixed(2);

    // Render Result Screen
    elements.resScore.innerText = `${displayScore}/${total}`;
    elements.resPercentage.innerText = `${finalPercentage}%`;
    elements.resCorrect.innerText = isPenaltyZero ? 0 : correctCount;
    if (elements.resWrong) {
      elements.resWrong.innerText = isPenaltyZero ? total : wrongCount;
    }
    if (elements.resSkipped) {
      elements.resSkipped.innerText = isPenaltyZero ? 0 : skippedCount;
    }
    if (elements.resWrongLabel) {
      elements.resWrongLabel.innerText = State.negativeMarkingEnabled && wrongCount > 0
        ? `ভুল উত্তর (-${(wrongCount * 0.25).toFixed(2)})`
        : (State.negativeMarkingEnabled ? 'ভুল উত্তর (-০.২৫)' : 'ভুল উত্তর (০)');
    }
    elements.resTime.innerText = timeSpentFormatted;

    if (isPenaltyZero) {
      elements.resultHeroCard.className = 'result-hero-card failed';
      elements.resultHeroIcon.innerText = '⚠️';
      elements.resultHeroTitle.innerText = 'নিয়ম লঙ্ঘনের কারণে বাতিল (০ নম্বর)';
      elements.resultHeroSub.innerText = customReason || 'ট্যাব পরিবর্তন বা ২০ সেকেন্ডের মধ্যে না ফেরায় পরীক্ষা ০ হিসেবে ধার্য করা হয়েছে।';
    } else if (finalPercentage >= 50) {
      elements.resultHeroCard.className = 'result-hero-card success';
      elements.resultHeroIcon.innerText = '🏆';
      elements.resultHeroTitle.innerText = 'অভিনন্দন! পরীক্ষা সফলভাবে সম্পন্ন!';
      const negSummary = State.negativeMarkingEnabled
        ? ` (মাইনাস মার্কিং চালু ছিল: ${wrongCount}টি ভুলের জন্য ${(wrongCount * 0.25).toFixed(2)} নম্বর কর্তন)`
        : '';
      elements.resultHeroSub.innerText = customReason || `আপনার ফলাফল এবং উত্তরপত্র বিশ্লেষণ নিচে দেওয়া হলো।${negSummary}`;
    } else {
      elements.resultHeroCard.className = 'result-hero-card failed';
      elements.resultHeroIcon.innerText = '📊';
      elements.resultHeroTitle.innerText = 'পরীক্ষা সম্পন্ন (আরও অনুশীলন প্রয়োজন)';
      const negSummary = State.negativeMarkingEnabled
        ? ` (মাইনাস মার্কিং চালু ছিল: ${wrongCount}টি ভুলের জন্য ${(wrongCount * 0.25).toFixed(2)} নম্বর কর্তন)`
        : '';
      elements.resultHeroSub.innerText = customReason || `নিচের ব্যাখ্যাগুলো পড়ে ভুলগুলো সংশোধন করে নিন।${negSummary}`;
    }

    // Render Detailed Solutions
    renderSolutionReview(isPenaltyZero, 'all');

    // Sync set-level mastery progress & wrong/skipped bank for BOTH All Questions and Custom Mode
    if (!isPenaltyZero && Array.isArray(State.activeQuestions) && State.activeQuestions.length > 0) {
      if (State.activeExam && !State.activeExam.isWrongBankExam) {
        const setId = State.activeExam.sourceSetId || State.activeExam.id || State.activeExam.chapterId;
        if (setId) {
          recordSetQuestionProgress(setId, State.activeQuestions, State.userAnswers);
        }
      }

      const capNow = Date.now();
      const capDateKey = getLocalDateKey(capNow);
      const exTitle = (State.activeExam && State.activeExam.title) ? State.activeExam.title : 'অনুশীলন পরীক্ষা';
      const exSub = (State.activeExam && State.activeExam.subjectName) ? State.activeExam.subjectName : '';
      const myCls = getStudentClass();
      const capturedMistakes = [];
      State.activeQuestions.forEach((q, idx) => {
        const isAnswered = State.userAnswers.hasOwnProperty(idx) &&
                           State.userAnswers[idx] !== undefined &&
                           State.userAnswers[idx] !== null &&
                           State.userAnswers[idx] !== '';
        const correctIdx = getQuestionCorrectIndex(q);
        const userAnsIdx = isAnswered ? Number(State.userAnswers[idx]) : null;
        if (isAnswered && userAnsIdx === correctIdx) {
          return; // Skip right-answered questions
        }
        const mistakeItem = {
          fingerprint: makeWrongQuestionKey(q),
          question: String(q.question || ''),
          options: Array.isArray(q.options) ? q.options.slice() : [],
          correct: correctIdx,
          explanation: q.explanation ? String(q.explanation) : '',
          userAnswer: userAnsIdx,
          status: isAnswered ? 'wrong' : 'skipped',
          examTitle: exTitle,
          subjectName: exSub,
          classCategory: myCls,
          timestamp: capNow - idx,
          dateKey: capDateKey
        };
        const safeImg = sanitizeQuestionImageUrl(q.image);
        if (safeImg) mistakeItem.image = safeImg;
        if (q.tricks !== undefined && q.tricks !== null && q.tricks !== '') mistakeItem.tricks = q.tricks;
        if (q.optionBreakdown !== undefined && q.optionBreakdown !== null && q.optionBreakdown !== '') mistakeItem.optionBreakdown = q.optionBreakdown;
        capturedMistakes.push(mistakeItem);
      });
      if (capturedMistakes.length > 0) {
        recordWrongBankItems(capturedMistakes);
      }
    }

    // Save to Firebase RTDB Leaderboard
    saveSubmissionToLeaderboard({
      score: finalScore,
      displayScore: displayScore,
      total: total,
      percentage: finalPercentage,
      correctCount: correctCount,
      wrongCount: wrongCount,
      skippedCount: skippedCount,
      negativeMarking: State.negativeMarkingEnabled,
      timeSpentSeconds: timeSpentSeconds,
      penalty: isPenaltyZero,
      examTitle: State.activeExam ? State.activeExam.title : 'অনুশীলন পরীক্ষা'
    });

    // Switch view to result
    Object.keys(elements.panels).forEach((k) => elements.panels[k] && elements.panels[k].classList.remove('active'));
    elements.panels.result.classList.add('active');
    syncFloatingBackButtonVisibility();
  }

  function renderSolutionReview(isPenaltyZero = false, filter = 'all') {
    document.querySelectorAll('.sol-filter-btn').forEach(b => {
      const isMatch = b.dataset.filter === filter;
      b.classList.toggle('active', isMatch);
      b.style.borderColor = isMatch ? '#38bdf8' : 'rgba(255,255,255,0.2)';
    });
    elements.solutionContainer.innerHTML = '';
    const letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];

    // Update count badges
    const countAllEl = document.getElementById('countAllQ');
    const countCorrectEl = document.getElementById('countCorrectQ');
    const countWrongEl = document.getElementById('countWrongQ');
    const countSkippedEl = document.getElementById('countSkippedQ');

    let countCorrect = 0;
    let countWrong = 0;
    let countSkipped = 0;

    State.activeQuestions.forEach((q, idx) => {
      const isAnswered = State.userAnswers.hasOwnProperty(idx) && 
                         State.userAnswers[idx] !== undefined && 
                         State.userAnswers[idx] !== null && 
                         State.userAnswers[idx] !== '';
      const correctIdx = getQuestionCorrectIndex(q);

      if (!isAnswered) {
        countSkipped++;
      } else if (Number(State.userAnswers[idx]) === correctIdx) {
        countCorrect++;
      } else {
        countWrong++;
      }
    });

    if (countAllEl) countAllEl.innerText = State.activeQuestions.length;
    if (countCorrectEl) countCorrectEl.innerText = countCorrect;
    if (countWrongEl) countWrongEl.innerText = countWrong;
    if (countSkippedEl) countSkippedEl.innerText = countSkipped;

    let itemsToShow = [];
    State.activeQuestions.forEach((q, idx) => {
      const isAnswered = State.userAnswers.hasOwnProperty(idx) && 
                         State.userAnswers[idx] !== undefined && 
                         State.userAnswers[idx] !== null && 
                         State.userAnswers[idx] !== '';
      const correctIdx = getQuestionCorrectIndex(q);
      const userAnsIdx = isAnswered ? Number(State.userAnswers[idx]) : null;
      const isCorrect = isAnswered && userAnsIdx === correctIdx;
      const isWrong = isAnswered && !isCorrect;
      const isSkipped = !isAnswered;

      if (filter === 'correct' && !isCorrect) return;
      if (filter === 'wrong' && !isWrong) return;
      if (filter === 'skipped' && !isSkipped) return;

      itemsToShow.push({ q, idx, userAnsIdx, isCorrect, isWrong, isSkipped, correctIdx });
    });

    if (itemsToShow.length === 0) {
      let emptyMsg = 'এই ফিল্টারে কোনো প্রশ্ন খুঁজে পাওয়া যায়নি।';
      if (filter === 'wrong') emptyMsg = '🎉 দারুণ! কোনো ভুল উত্তর নেই। সকল উত্তর সঠিক হয়েছে!';
      if (filter === 'skipped') emptyMsg = '👏 আপনি সকল প্রশ্নের উত্তর দিয়েছেন! কোনো প্রশ্ন বাদ পড়েনি।';
      if (filter === 'correct') emptyMsg = 'এই ফিল্টারে কোনো সঠিক উত্তর নেই।';

      elements.solutionContainer.innerHTML = `
        <div class="review-empty-box">
          ${emptyMsg}
        </div>
      `;
      return;
    }

    itemsToShow.forEach(({ q, idx, userAnsIdx, isCorrect, isWrong, isSkipped, correctIdx }) => {
      const item = document.createElement('div');
      item.className = 'review-item-card';

      let statusBadge = '';
      if (isSkipped) {
        statusBadge = `<span class="review-status-pill skipped">⚪ অনুত্তর (০ নম্বর)</span>`;
      } else if (isCorrect) {
        statusBadge = `<span class="review-status-pill correct">✓ সঠিক উত্তর (+১ নম্বর)</span>`;
      } else {
        const negText = State.negativeMarkingEnabled ? '-০.২৫ নম্বর' : '০ নম্বর';
        statusBadge = `<span class="review-status-pill wrong">✕ ভুল উত্তর (${negText})</span>`;
      }

      const userChoiceText = (!isSkipped && q.options && q.options[userAnsIdx] !== undefined)
        ? escHtml(`${letters[userAnsIdx] || userAnsIdx + 1}. ${q.options[userAnsIdx]}`)
        : '<span class="review-unanswered-note">কোনো উত্তর দেওয়া হয়নি (ছেড়ে দেওয়া হয়েছে)</span>';

      const correctChoiceText = (q.options && q.options[correctIdx] !== undefined)
        ? escHtml(`${letters[correctIdx] || correctIdx + 1}. ${q.options[correctIdx]}`)
        : '';

      const safeImg = sanitizeQuestionImageUrl(q.image);
      const userAnsClass = isCorrect ? 'is-correct' : (isSkipped ? 'is-skipped' : 'is-wrong');

      item.innerHTML = `
        <div class="review-card-top">
          <span class="review-q-num">প্রশ্ন #${idx + 1}</span>
          ${statusBadge}
        </div>
        <h5 class="review-question-title">${escHtml(q.question)}</h5>
        ${safeImg ? `<div class="review-question-image-wrap"><img src="${escHtml(safeImg)}" class="review-question-image" alt="প্রশ্নের ছবি" loading="lazy" onerror="this.parentNode.style.display='none'" /></div>` : ''}
        <div class="review-answers-summary">
          <div class="review-ans-row ${userAnsClass}"><strong>আপনার নির্বাচন:</strong> ${userChoiceText}</div>
          <div class="review-ans-row is-right-ans"><strong>সঠিক উত্তর:</strong> ${correctChoiceText}</div>
        </div>
        ${formatQuestionExtrasHTML(q)}
      `;

      elements.solutionContainer.appendChild(item);
    });
  }

  // 15. Save via Firebase REST API (with localStorage Data Loss Protection & Retry) & Load Leaderboard
  let cachedLeaderboardRows = [];
  const PENDING_EXAM_SUB_KEY = 'sr_pending_exam_submissions';

  function readPendingExamSubmissions() {
    try {
      const arr = JSON.parse(localStorage.getItem(PENDING_EXAM_SUB_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function writePendingExamSubmissions(list) {
    try {
      localStorage.setItem(PENDING_EXAM_SUB_KEY, JSON.stringify((list || []).slice(0, 30)));
    } catch (e) {}
  }

  function updateResultSyncBanner(state, detailMsg, pendingId) {
    const banner = document.getElementById('examResultSyncBanner');
    if (!banner) return;
    if (state === 'saving') {
      banner.style.display = 'block';
      banner.style.background = 'rgba(59,130,246,0.14)';
      banner.style.border = '1.5px solid rgba(59,130,246,0.45)';
      banner.style.color = '#bfdbfe';
      banner.innerHTML = '⏳ আপনার পরীক্ষার রেজাল্ট ও উত্তরপত্র সার্ভারে সংরক্ষণ করা হচ্ছে...';
    } else if (state === 'saved') {
      banner.style.display = 'block';
      banner.style.background = 'rgba(16,185,129,0.14)';
      banner.style.border = '1.5px solid rgba(16,185,129,0.45)';
      banner.style.color = '#a7f3d0';
      banner.innerHTML = '✓ রেজাল্ট ও লিডারবোর্ড সার্ভারে সফলভাবে সংরক্ষিত হয়েছে।';
    } else if (state === 'error') {
      banner.style.display = 'block';
      banner.style.background = 'rgba(239,68,68,0.15)';
      banner.style.border = '1.5px solid rgba(239,68,68,0.55)';
      banner.style.color = '#fecaca';
      banner.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <strong style="display:block;color:#fca5a5;margin-bottom:3px">⚠️ ইন্টারনেট সমস্যার কারণে রেজাল্ট সার্ভারে পাঠানো যায়নি!</strong>
            <span style="font-size:12.5px;color:#fee2e2">ভয় নেই — আপনার রেজাল্ট ও উত্তরপত্র ফোনে (localStorage) নিরাপদে ব্যাকআপ রাখা হয়েছে।${detailMsg ? ' (' + escHtml(detailMsg) + ')' : ''}</span>
          </div>
          <button type="button" id="btnRetryExamSubmit" style="padding:8px 14px;border-radius:10px;border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:#0f172a;font-weight:800;font-size:13px;cursor:pointer;white-space:nowrap">🔄 Retry / আবার সাবমিট করুন</button>
        </div>
      `;
      const retryBtn = document.getElementById('btnRetryExamSubmit');
      if (retryBtn) {
        retryBtn.onclick = () => retryPendingExamSubmissions(pendingId, { fromResultBanner: true });
      }
    } else {
      banner.style.display = 'none';
      banner.innerHTML = '';
    }
  }

  function renderPendingExamQueueBar() {
    const bar = document.getElementById('examPendingQueueBar');
    if (!bar) return;
    const list = readPendingExamSubmissions();
    if (!list.length) {
      bar.style.display = 'none';
      bar.innerHTML = '';
      return;
    }
    bar.style.display = 'flex';
    bar.innerHTML = `
      <div style="font-size:13px;line-height:1.45">
        <strong style="color:#fde68a">⚠️ ${list.length}টি পরীক্ষার রেজাল্ট সার্ভারে আপলোড বাকি আছে</strong>
        <div style="font-size:12px;color:#fef3c7;opacity:0.9">ইন্টারনেট সংযোগ সচল হলে নিচের বাটনে চাপ দিয়ে সাবমিট সম্পন্ন করুন (লোকাল ব্যাকআপ সুরক্ষিত আছে)।</div>
      </div>
      <button type="button" id="btnRetryQueueBar" style="padding:8px 14px;border-radius:10px;border:none;background:#f59e0b;color:#0f172a;font-weight:800;font-size:13px;cursor:pointer;white-space:nowrap">🔄 Retry / আবার সাবমিট করুন</button>
    `;
    const btn = document.getElementById('btnRetryQueueBar');
    if (btn) {
      btn.onclick = () => retryPendingExamSubmissions(null, { fromQueueBar: true });
    }
  }

  function syncSinglePendingSubmission(item) {
    const REST = getREST();
    if (!REST) {
      return Promise.reject(new Error('REST ক্লায়েন্ট পাওয়া যায়নি'));
    }

    const persistItemProgress = () => {
      const list = readPendingExamSubmissions();
      const idx = list.findIndex((x) => x.pendingId === item.pendingId);
      if (idx > -1) {
        list[idx] = item;
        writePendingExamSubmissions(list);
      }
    };

    const tasks = [];
    if (!item.leaderboardSaved) {
      tasks.push(
        REST.push('exam_leaderboard', item.submission).then(() => {
          item.leaderboardSaved = true;
          persistItemProgress();
        })
      );
    }
    if (item.uid && !item.historySaved) {
      tasks.push(
        REST.push(`user_exam_history/${item.uid}`, item.histRecord).then(() => {
          item.historySaved = true;
          persistItemProgress();
        })
      );
    }
    if (item.uid && item.studentName && item.studentName !== 'শিক্ষার্থী' && item.studentName !== 'সদস্য' && !item.uidUpdated) {
      const patch = {
        name: item.studentName,
        roomId: item.roomCode,
        updatedAt: Date.now()
      };
      if (item.memberId) patch.memberId = item.memberId;
      REST.update('numeric_uids/' + item.uid, patch).then(() => {
        item.uidUpdated = true;
        persistItemProgress();
      }).catch(() => {});
    }
    const wbKey = item.wrongBankKey || getUserWrongBankKey();
    let wbDirty = false;
    try { wbDirty = localStorage.getItem('sr_wrong_qns_dirty_' + wbKey) === '1'; } catch (e) {}
    if (wbDirty) {
      const wbList = readLocalWrongBank(wbKey);
      tasks.push(
        REST.set(`user_exam_history/wrong_bank/${wbKey}`, {
          updatedAt: Date.now(),
          items: wbList
        }).then(() => {
          try { localStorage.removeItem('sr_wrong_qns_dirty_' + wbKey); } catch (e) {}
        })
      );
    }

    return Promise.all(tasks).then(() => {
      const remaining = readPendingExamSubmissions().filter((x) => x.pendingId !== item.pendingId);
      writePendingExamSubmissions(remaining);
      return true;
    });
  }

  let isRetryingPendingSubmissions = false;
  function retryPendingExamSubmissions(onlyId, opts) {
    opts = opts || {};
    if (isRetryingPendingSubmissions) return Promise.resolve();
    const list = readPendingExamSubmissions();
    const targets = onlyId ? list.filter((x) => x.pendingId === onlyId) : list.slice();
    if (!targets.length) {
      renderPendingExamQueueBar();
      return Promise.resolve();
    }

    isRetryingPendingSubmissions = true;
    const retryBtn = document.getElementById('btnRetryExamSubmit');
    const qBtn = document.getElementById('btnRetryQueueBar');
    if (retryBtn) { retryBtn.disabled = true; retryBtn.textContent = '⏳ সাবমিট হচ্ছে...'; }
    if (qBtn) { qBtn.disabled = true; qBtn.textContent = '⏳ সাবমিট হচ্ছে...'; }
    if (opts.fromResultBanner) updateResultSyncBanner('saving', '', onlyId);

    let failedCount = 0;
    let lastErrMsg = '';
    let chain = Promise.resolve();
    targets.forEach((item) => {
      chain = chain.then(() =>
        syncSinglePendingSubmission(item).catch((err) => {
          failedCount += 1;
          lastErrMsg = (err && err.message) || 'সংযোগ সমস্যা';
        })
      );
    });

    return chain.then(() => {
      isRetryingPendingSubmissions = false;
      renderPendingExamQueueBar();
      if (failedCount === 0) {
        if (opts.fromResultBanner || document.getElementById('examResultSyncBanner')) {
          updateResultSyncBanner('saved', '', onlyId);
        }
        showExamNotice('✓ ব্যাকআপ থাকা পরীক্ষার রেজাল্ট সফলভাবে সার্ভারে সাবমিট হয়েছে!');
      } else {
        if (opts.fromResultBanner || document.getElementById('examResultSyncBanner')) {
          updateResultSyncBanner('error', lastErrMsg, onlyId);
        }
        showExamNotice('⚠️ এখনো সাবমিট করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে Retry চাপুন।');
      }
    });
  }

  window.retryPendingExamSubmissions = retryPendingExamSubmissions;
  window.addEventListener('online', () => {
    if (readPendingExamSubmissions().length > 0) {
      retryPendingExamSubmissions(null, { fromAutoOnline: true });
    }
  });

  function saveSubmissionToLeaderboard(subData) {
    let studentName = (localStorage.getItem('sr-name') || '').trim();
    const meSlot = localStorage.getItem('sr-me');
    const roomCode = localStorage.getItem('sr-code') || '14320';

    if (!studentName || studentName === 'শিক্ষার্থী' || studentName === 'সদস্য') {
      if (roomCode === '1432014310' || meSlot === 'p1' || meSlot === 'p2') {
        studentName = (meSlot === 'p2') ? (localStorage.getItem('vip_p2_name') || 'রহমান') : (localStorage.getItem('vip_p1_name') || 'তাসফিয়া হাসান');
      } else if (window.P && window.me && window.P[window.me] && window.P[window.me].name) {
        studentName = window.P[window.me].name;
      }
    }
    if (!studentName || studentName === 'শিক্ষার্থী' || studentName === 'সদস্য') {
      studentName = (meSlot === 'p2') ? 'রহমান' : 'তাসফিয়া হাসান';
    }

    const myUid = getActiveUserUid();
    const myClass = getStudentClass();

    let roomName = (window.P && window.P.meta && window.P.meta.name) || localStorage.getItem('sr_room_name');
    if (!roomName || roomName === roomCode || /^\d{4,}$/.test(roomName)) {
      roomName = (roomCode === '1432014310') ? 'Queen Room' : 'অধ্যয়ন কক্ষ';
    }

    const nowTs = Date.now();
    const submission = {
      name: studentName,
      uid: myUid,
      slot: meSlot || '',
      room: roomCode,
      roomName: roomName,
      examTitle: subData.examTitle,
      score: subData.score,
      displayScore: subData.displayScore || subData.score,
      total: subData.total,
      percentage: subData.percentage,
      correctCount: subData.correctCount,
      wrongCount: subData.wrongCount,
      skippedCount: subData.skippedCount,
      negativeMarking: subData.negativeMarking || false,
      timeSpentSeconds: subData.timeSpentSeconds,
      penalty: subData.penalty,
      classCategory: myClass,
      timestamp: nowTs
    };

    // Save to user_exam_history for personal history
    const histRecord = {
      examTitle: subData.examTitle,
      score: subData.score,
      displayScore: subData.displayScore || subData.score,
      total: subData.total,
      percentage: subData.percentage,
      correctCount: subData.correctCount,
      wrongCount: subData.wrongCount,
      skippedCount: subData.skippedCount,
      negativeMarking: subData.negativeMarking || false,
      timeSpentSeconds: subData.timeSpentSeconds,
      penalty: subData.penalty,
      timestamp: nowTs,
      questions: State.activeQuestions,
      userAnswers: State.userAnswers
    };

    // ১. প্রথমে লোকাল স্টোরেজে নিরাপদ ইতিহাস ও পেন্ডিং ব্যাকআপ সেভ (Data Loss Protection)
    try {
      const histKey = getUserHistoryStorageKey();
      const localHist = JSON.parse(localStorage.getItem(histKey) || '[]');
      localHist.unshift(histRecord);
      localStorage.setItem(histKey, JSON.stringify(localHist.slice(0, 30)));
    } catch(e) {}

    const pendingItem = {
      pendingId: 'sub_' + nowTs.toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      uid: myUid,
      memberId: meSlot || '',
      wrongBankKey: getUserWrongBankKey(),
      studentName: studentName,
      roomCode: roomCode,
      submission: submission,
      histRecord: histRecord,
      leaderboardSaved: false,
      historySaved: !myUid,
      uidUpdated: false,
      createdAt: nowTs
    };

    const existingQueue = readPendingExamSubmissions();
    existingQueue.unshift(pendingItem);
    writePendingExamSubmissions(existingQueue);
    renderPendingExamQueueBar();
    updateResultSyncBanner('saving', '', pendingItem.pendingId);

    // ২. REST API দিয়ে রেজাল্ট ও ইতিহাস সাবমিট — ফেইল করলে পেন্ডিং ব্যাকআপ থেকে Retry অপশন দেখাবে
    syncSinglePendingSubmission(pendingItem).then(() => {
      updateResultSyncBanner('saved', '', pendingItem.pendingId);
      renderPendingExamQueueBar();
    }).catch((err) => {
      console.warn('REST submission failed, preserved in localStorage:', err);
      const errMsg = (err && err.message) ? err.message : '';
      updateResultSyncBanner('error', errMsg, pendingItem.pendingId);
      renderPendingExamQueueBar();
      showExamNotice('⚠️ ইন্টারনেট সমস্যার কারণে রেজাল্ট সার্ভারে যায়নি — ব্যাকআপ সেভ আছে, Retry চাপুন।');
    });
  }

  let activeLeaderboardFilter = null;

  function filterAndRenderLeaderboard(filterVal, displayLabel) {
    activeLeaderboardFilter = filterVal;
    const badge = document.getElementById('activeFilterBadge');
    const clearBtn = document.getElementById('btnClearFilter');

    if (!filterVal || filterVal === 'all') {
      if (badge) badge.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
      renderLeaderboardRows(cachedLeaderboardRows);
    } else {
      if (badge) {
        badge.textContent = `ফিল্টার: ${displayLabel || filterVal}`;
        badge.style.display = 'inline-block';
      }
      if (clearBtn) clearBtn.style.display = 'inline-block';
      const term = filterVal.toLowerCase().trim();
      const filtered = cachedLeaderboardRows.filter(r => {
        const t = (r.examTitle || '').toLowerCase();
        return t === term || t.includes(term);
      });
      renderLeaderboardRows(filtered);
    }
  }

  _openLeaderboardFilterModalImpl = openLeaderboardFilterModal;
  window.openLeaderboardFilterModal = openLeaderboardFilterModal;
  function openLeaderboardFilterModal() {
    _openLeaderboardFilterModalImpl = openLeaderboardFilterModal;
    window.openLeaderboardFilterModal = openLeaderboardFilterModal;
    let existing = document.getElementById('lbFilterModalOverlay');
    if (existing) {
      existing.style.display = 'none';
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'lbFilterModalOverlay';
    overlay.className = 'exam-modal-overlay active';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100005;padding:16px;opacity:1;pointer-events:auto;';
    overlay.innerHTML = `
      <div class="exam-modal-container" style="max-width:540px;width:100%;background:#0f172a;border:1.5px solid rgba(255,255,255,0.15);border-radius:18px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,0.8);position:relative;z-index:100010">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;margin-bottom:16px">
          <h3 style="margin:0;font-size:18px;font-weight:700;color:#f8fafc;display:flex;align-items:center;gap:8px">
            <span>🔍</span> লিডারবোর্ড ফিল্টার
          </h3>
          <button type="button" id="btnCloseLbFilter" style="background:transparent;border:none;color:#94a3b8;font-size:24px;cursor:pointer;line-height:1;padding:0 6px" title="বন্ধ করুন (✕)">✕</button>
        </div>
        <div id="lbFilterStepsContainer"></div>
        <div style="display:flex;justify-content:flex-end;margin-top:14px;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px">
          <button type="button" class="btn-back-subjects" id="btnCancelLbFilterModal" style="padding:7px 18px;border-radius:10px;font-size:13px;font-weight:600;color:#cbd5e1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);cursor:pointer">বাতিল</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => {
      overlay.classList.remove('active');
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      overlay.remove();
      window.removeEventListener('keydown', escHandler);
    };

    const escHandler = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', escHandler);

    document.getElementById('btnCloseLbFilter').onclick = close;
    const btnCancelLb = document.getElementById('btnCancelLbFilterModal');
    if (btnCancelLb) btnCancelLb.onclick = close;
    overlay.onclick = (e) => {
      // Rule 2: Strict Close Behavior - Outside backdrop clicks do NOT close modal
      if (e.target === overlay) {
        e.stopPropagation();
      }
    };
    const modalBox = overlay.querySelector('.exam-modal-container');
    if (modalBox) {
      modalBox.onclick = (e) => e.stopPropagation();
      modalBox.onmousedown = (e) => e.stopPropagation();
    }

    const container = document.getElementById('lbFilterStepsContainer');

    function renderSubjectStep() {
      const studentClass = getStudentClass();
      const filtered = (State.subjects || []).filter(subj => {
        return getSubjectCategory(subj).toLowerCase() === String(studentClass || 'HSC').toLowerCase();
      });
      const displaySubjects = (filtered.length > 0) ? filtered : State.subjects;

      let classLabel = 'এইচএসসি (HSC)';
      if (studentClass === 'SSC') classLabel = 'এসএসসি (SSC)';
      else if (studentClass === 'Admission') classLabel = 'ভর্তি পরীক্ষা (Admission)';
      else if (studentClass === 'BCS') classLabel = 'বিসিএস ও চাকরি (BCS / Job)';

      container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin:0 0 12px 0">
          <p style="font-size:14px;color:#94a3b8;margin:0">১. বিষয় নির্বাচন করুন:</p>
          <span style="font-size:11.5px;padding:2px 8px;border-radius:12px;background:rgba(56,189,248,0.15);color:#38bdf8;font-weight:600">${escHtml(classLabel)}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr;gap:8px;max-height:280px;overflow-y:auto;padding-right:4px">
          <button type="button" class="btn lb-step-btn" data-type="all" style="text-align:left;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#34d399;font-weight:700;padding:12px 14px;border-radius:10px">
            ✨ সকল পরীক্ষা ও বিষয় (সব দেখুন)
          </button>
          ${displaySubjects.map(s => `
            <button type="button" class="btn lb-step-btn" data-type="subject" data-subjid="${escHtml(s.id)}" style="text-align:left;background:#1e293b;border:1px solid rgba(255,255,255,0.08);color:#f8fafc;font-weight:600;padding:12px 14px;border-radius:10px;display:flex;align-items:center;justify-content:space-between">
              <span>${escHtml(s.titleBn)}</span>
              <span style="font-size:12px;color:#38bdf8">${(s.chapters || []).length}টি অধ্যায় ›</span>
            </button>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.lb-step-btn').forEach(btn => {
        btn.onclick = () => {
          const type = btn.getAttribute('data-type');
          if (type === 'all') {
            filterAndRenderLeaderboard('all');
            close();
          } else {
            const sid = btn.getAttribute('data-subjid');
            const subj = State.subjects.find(x => x.id === sid);
            if (subj) renderChapterStep(subj);
          }
        };
      });
    }

    function renderChapterStep(subj) {
      const chapters = subj.chapters || [];
      container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <button type="button" id="btnBackToSubjStep" style="background:transparent;border:none;color:#60a5fa;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:4px">← বিষয় পরিবর্তনে ফিরুন</button>
          <span style="font-size:13px;color:#94a3b8;font-weight:600">${escHtml(subj.titleBn)}</span>
        </div>
        <p style="font-size:14px;color:#94a3b8;margin:0 0 12px 0">২. অধ্যায় বা ফিল্টার লেভেল নির্বাচন করুন:</p>
        <div style="display:grid;grid-template-columns:1fr;gap:8px;max-height:280px;overflow-y:auto;padding-right:4px">
          <button type="button" class="btn lb-sub-all-btn" style="text-align:left;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.4);color:#93c5fd;font-weight:700;padding:12px 14px;border-radius:10px">
            🎯 "${escHtml(subj.titleBn)}"-এর সকল পরীক্ষা
          </button>
          ${chapters.map((ch, idx) => `
            <button type="button" class="btn lb-chap-btn" data-idx="${idx}" style="text-align:left;background:#1e293b;border:1px solid rgba(255,255,255,0.08);color:#f8fafc;font-weight:600;padding:12px 14px;border-radius:10px;display:flex;align-items:center;justify-content:space-between">
              <span>অধ্যায় ${escHtml(ch.num)}: ${escHtml(ch.name)}</span>
              <span style="font-size:12px;color:#38bdf8">পরীক্ষা তালিকা ›</span>
            </button>
          `).join('')}
        </div>
      `;

      document.getElementById('btnBackToSubjStep').onclick = renderSubjectStep;
      container.querySelector('.lb-sub-all-btn').onclick = () => {
        filterAndRenderLeaderboard(subj.titleBn, subj.titleBn);
        close();
      };

      container.querySelectorAll('.lb-chap-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          const ch = chapters[idx];
          if (ch) renderExamStep(subj, ch);
        };
      });
    }

    function renderExamStep(subj, ch) {
      container.innerHTML = `
        <div class="sr-skeleton-stack" aria-hidden="true" style="padding:8px 0">
          <div class="sr-skeleton-card"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div></div>
          <div class="sr-skeleton-card"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div></div>
        </div>
      `;
      const REST = getREST();

      Promise.all([
        REST ? REST.get('exam_chapter_tests/' + ch.id).catch(() => null) : Promise.resolve(null),
        REST ? REST.get('examSets/' + ch.id).catch(() => null) : Promise.resolve(null)
      ]).then(([t1, t2]) => {
        const tests1 = t1 || {};
        const tests2 = t2 || {};
        const allSets = Object.assign({}, tests1, tests2);
        const setTitles = Object.values(allSets).map(s => s && s.title).filter(Boolean);

        // Find matching exam titles from cached rows or default presets
        const searchKey = ch.name;
        const matchingRows = cachedLeaderboardRows.filter(r => (r.examTitle || '').includes(searchKey));
        const historyTitles = matchingRows.map(r => r.examTitle).filter(Boolean);

        const examTitles = Array.from(new Set([...setTitles, ...historyTitles]));
        if (examTitles.length === 0) {
          examTitles.push(`${subj.titleBn} - অধ্যায় ${ch.num}: ${ch.name}`);
          examTitles.push(`অধ্যায়ভিত্তিক বেসিক টেস্ট — ${ch.name}`);
          examTitles.push(`চ্যাপ্টার স্পেশাল মডেল টেস্ট — ${ch.name}`);
        }

        container.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <button type="button" id="btnBackToChapStep" style="background:transparent;border:none;color:#60a5fa;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:4px">← অধ্যায় তালিকায় ফিরুন</button>
            <span style="font-size:13px;color:#94a3b8;font-weight:600">অধ্যায় ${escHtml(ch.num)}</span>
          </div>
          <p style="font-size:14px;color:#94a3b8;margin:0 0 12px 0">৩. নির্দিষ্ট পরীক্ষা নির্বাচন করুন:</p>
          <div style="display:grid;grid-template-columns:1fr;gap:8px;max-height:280px;overflow-y:auto;padding-right:4px">
            <button type="button" class="btn lb-all-ch-btn" style="text-align:left;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);color:#34d399;font-weight:700;padding:12px 14px;border-radius:10px">
              ⭐ এই অধ্যায়ের সকল পরীক্ষা
            </button>
            ${examTitles.map(t => `
              <button type="button" class="btn lb-spec-exam-btn" data-title="${escHtml(t)}" style="text-align:left;background:#1e293b;border:1px solid rgba(255,255,255,0.08);color:#f8fafc;font-weight:600;padding:12px 14px;border-radius:10px">
                📝 ${escHtml(t)}
              </button>
            `).join('')}
          </div>
        `;

        document.getElementById('btnBackToChapStep').onclick = () => renderChapterStep(subj);
        container.querySelector('.lb-all-ch-btn').onclick = () => {
          filterAndRenderLeaderboard(ch.name, `অধ্যায় ${ch.num}: ${ch.name}`);
          close();
        };

        container.querySelectorAll('.lb-spec-exam-btn').forEach(btn => {
          btn.onclick = () => {
            const t = btn.getAttribute('data-title');
            filterAndRenderLeaderboard(t, t);
            close();
          };
        });
      }).catch(() => {
        container.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <button type="button" id="btnBackToChapStep" style="background:transparent;border:none;color:#60a5fa;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:4px">← অধ্যায় তালিকায় ফিরুন</button>
            <span style="font-size:13px;color:#94a3b8;font-weight:600">অধ্যায় ${escHtml(ch.num)}</span>
          </div>
          <button type="button" class="btn lb-all-ch-btn" style="width:100%;text-align:left;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);color:#34d399;font-weight:700;padding:12px 14px;border-radius:10px">
            ⭐ এই অধ্যায়ের সকল পরীক্ষা
          </button>
        `;
        document.getElementById('btnBackToChapStep').onclick = () => renderChapterStep(subj);
        container.querySelector('.lb-all-ch-btn').onclick = () => {
          filterAndRenderLeaderboard(ch.name, `অধ্যায় ${ch.num}: ${ch.name}`);
          close();
        };
      });
    }

    renderSubjectStep();
  }

  function loadLeaderboardFromDB() {
    const REST = getREST();
    if (!REST) {
      renderFallbackLeaderboard();
      return;
    }

    elements.leaderboardBody.innerHTML = `
      <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="7"><div class="sr-skeleton-line md" style="width:94%"></div></td></tr>
      <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="7"><div class="sr-skeleton-line md" style="width:86%"></div></td></tr>
      <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="7"><div class="sr-skeleton-line md" style="width:90%"></div></td></tr>
      <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="7"><div class="sr-skeleton-line md" style="width:80%"></div></td></tr>
    `;

    Promise.all([
      REST.get('exam_leaderboard', { orderBy: '$key', limitToLast: 100 }),
      REST.get('numeric_uids').catch(() => ({})),
      REST.get('vip_users').catch(() => ({}))
    ]).then(([val, uidsRaw, vipRaw]) => {
      const uidsMap = uidsRaw || {};
      const vipMap = vipRaw || {};
      if (!val || typeof val !== 'object') {
        renderFallbackLeaderboard();
        return;
      }

      const rows = Object.keys(val).map((k) => {
        const item = { id: k, ...val[k] };
        // Heal student name if missing, undefined, or generic placeholder
        if (!item.name || item.name === 'undefined' || item.name === 'null' || item.name === 'শিক্ষার্থী' || item.name === 'সদস্য' || item.name === 'মেধা শিক্ষার্থী') {
          if (item.uid && uidsMap[item.uid] && uidsMap[item.uid].name) {
            item.name = uidsMap[item.uid].name;
          } else if (item.userName) {
            item.name = item.userName;
          } else if (item.studentName) {
            item.name = item.studentName;
          } else if (item.room === '1432014310' || item.roomName === 'Queen Room') {
            item.name = (item.slot === 'p2') ? ((vipMap.p2 && vipMap.p2.name) || 'রহমান') : ((vipMap.p1 && vipMap.p1.name) || 'তাসফিয়া হাসান');
          }
        }
        return item;
      });

      // Sort by score desc, then timeSpentSeconds asc
      rows.sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return (a.timeSpentSeconds || 0) - (b.timeSpentSeconds || 0);
      });

      cachedLeaderboardRows = rows;
      filterAndRenderLeaderboard(activeLeaderboardFilter || 'all');
    }).catch(() => {
      renderFallbackLeaderboard();
    });
  }

  function renderLeaderboardRows(rows) {
    elements.leaderboardBody.innerHTML = '';
    if (rows.length === 0) {
      elements.leaderboardBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--ex-muted)">এখনও কোনো পরীক্ষা জমা হয়নি। প্রথম পরীক্ষা দিয়ে শীর্ষে আসুন!</td></tr>`;
      return;
    }

    const curUid = getActiveUserUid();
    const curName = getActiveUserDisplayName();
    const curSlot = getActiveUserSlot();

    rows.forEach((r, idx) => {
      const rank = idx + 1;
      let badgeCls = '';
      if (rank === 1) badgeCls = 'top-1';
      else if (rank === 2) badgeCls = 'top-2';
      else if (rank === 3) badgeCls = 'top-3';

      const tr = document.createElement('tr');
      const timeStr = r.timeSpentSeconds ? `${Math.floor(r.timeSpentSeconds / 60)} মি. ${r.timeSpentSeconds % 60} সে.` : '--';
      const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('bn-BD') : 'আজকে';
      
      // Strict Room Name masking: Never expose raw room passcodes or PINs!
      let safeRoomName = r.roomName;
      if (!safeRoomName || safeRoomName === r.room || /^\d{4,}$/.test(safeRoomName)) {
        safeRoomName = (r.room === '1432014310') ? 'Queen Room' : 'অধ্যয়ন কক্ষ';
      }

      // Healing student name if missing or saved as 'শিক্ষার্থী'
      let displayName = r.name;
      if (!displayName || displayName === 'শিক্ষার্থী' || displayName === 'সদস্য') {
        if (r.uid && curUid && r.uid === curUid && curName && curName !== 'শিক্ষার্থী' && curName !== 'সদস্য') {
          displayName = curName;
        } else if (r.room === '1432014310' || r.roomName === 'Queen Room' || (r.room && r.room.includes('1432014310'))) {
          displayName = (curSlot === 'p2' || r.slot === 'p2') ? (localStorage.getItem('vip_p2_name') || 'রহমান') : (localStorage.getItem('vip_p1_name') || 'তাসফিয়া হাসান');
        } else if (window.P && r.uid && window.P[r.uid] && window.P[r.uid].name) {
          displayName = window.P[r.uid].name;
        } else if (curName && curName !== 'শিক্ষার্থী' && curName !== 'সদস্য') {
          displayName = curName;
        } else {
          displayName = (r.room === '1432014310' || r.roomName === 'Queen Room') ? 'তাসফিয়া হাসান' : 'মেধা শিক্ষার্থী';
        }
      }

      tr.innerHTML = `
        <td><span class="rank-badge ${escHtml(badgeCls)}">${rank}</span></td>
        <td>
          <strong style="color:var(--ex-ink)">${escHtml(displayName)}</strong>
          <div style="font-size:11.5px;color:var(--ex-accent)">${escHtml(safeRoomName)}</div>
        </td>
        <td>${escHtml(r.examTitle || 'মডেল টেস্ট')}</td>
        <td style="font-weight:700;color:${r.penalty ? 'var(--rev-wrong)' : 'var(--rev-correct)'}">${escHtml(r.score)}/${Number(r.total) || 0} ${r.penalty ? '(শাস্তি: ০)' : ''}</td>
        <td style="font-weight:800;color:var(--rev-right-ans)">${Number(r.percentage) || 0}%</td>
        <td>${escHtml(timeStr)}</td>
        <td style="font-size:12px;color:var(--ex-muted)">${escHtml(dateStr)}</td>
      `;
      elements.leaderboardBody.appendChild(tr);
    });
  }

  function renderFallbackLeaderboard() {
    const samples = [
      { name: 'আরিফুল ইসলাম', roomName: 'Queen Room', examTitle: 'রসায়ন ২য় পত্র - পরিবেশ রসায়ন', score: 5, total: 5, percentage: 100, timeSpentSeconds: 145, timestamp: Date.now() - 3600000 },
      { name: 'সাদিয়া তাসনিম', roomName: 'Queen Room', examTitle: 'মেডিকেল স্পেশাল মডেল টেস্ট', score: 14, total: 15, percentage: 93, timeSpentSeconds: 490, timestamp: Date.now() - 7200000 },
      { name: 'তানভীর আহমেদ', roomName: 'মিশন মেডিকেল', examTitle: 'রসায়ন ১ম পত্র - গুণগত রসায়ন', score: 4, total: 5, percentage: 80, timeSpentSeconds: 190, timestamp: Date.now() - 14400000 }
    ];
    cachedLeaderboardRows = samples;
    renderLeaderboardRows(samples);
  }

  // 16. Recent Exams Personal History View
  function loadUserHistoryFromDB() {
    const db = getDB();
    const myUid = getActiveUserUid();
    if (!elements.historyBody) return;

    elements.historyBody.innerHTML = `
      <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="6"><div class="sr-skeleton-line md" style="width:92%"></div></td></tr>
      <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="6"><div class="sr-skeleton-line md" style="width:84%"></div></td></tr>
      <tr class="sr-skeleton-table-row" aria-hidden="true"><td colspan="6"><div class="sr-skeleton-line md" style="width:88%"></div></td></tr>
    `;

    const renderHistory = (list) => {
      if (!list || list.length === 0) {
        elements.historyBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--ex-muted)">এখনও কোনো বিগত পরীক্ষা দেওয়া হয়নি। পরীক্ষা সম্পন্ন করলে এখানে রেকর্ড সংরক্ষিত হবে।</td></tr>`;
        return;
      }
      elements.historyBody.innerHTML = '';
      list.slice(0, 25).forEach((h) => {
        const tr = document.createElement('tr');
        const timeStr = h.timeSpentSeconds ? `${Math.floor(h.timeSpentSeconds / 60)} মি. ${h.timeSpentSeconds % 60} সে.` : '--';
        const dateStr = h.timestamp ? new Date(h.timestamp).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'সম্প্রতি';
        const scoreColor = h.penalty ? 'var(--rev-wrong)' : (h.percentage >= 50 ? 'var(--rev-correct)' : 'var(--rev-wrong)');

        tr.innerHTML = `
          <td style="font-weight:600;color:var(--ex-ink)">${escHtml(h.examTitle || 'মডেল টেস্ট')}</td>
          <td style="font-weight:700;color:${scoreColor}">${escHtml(h.displayScore !== undefined ? h.displayScore : h.score)}/${Number(h.total) || 0} ${h.penalty ? '(শাস্তি: ০)' : ''}</td>
          <td style="font-weight:700;color:var(--rev-right-ans)">${Number(h.percentage) || 0}%</td>
          <td>${timeStr}</td>
          <td style="font-size:12px;color:var(--ex-muted)">${dateStr}</td>
          <td style="text-align:center">
            <button type="button" class="btn-review-history" style="background:#0284c7;color:#fff;border:none;border-radius:8px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer">🔍 রিভিউ</button>
          </td>
        `;

        const reviewBtn = tr.querySelector('.btn-review-history');
        if (reviewBtn) {
          reviewBtn.onclick = () => {
            if (h.questions && h.questions.length > 0) {
              State.activeQuestions = h.questions;
              State.userAnswers = h.userAnswers || {};
              State.negativeMarkingEnabled = !!h.negativeMarking;
              const displayScore = h.displayScore !== undefined ? h.displayScore : h.score;
              const wrongCount = h.wrongCount !== undefined ? h.wrongCount : (h.total - h.score);
              elements.resScore.innerText = `${displayScore}/${h.total}`;
              elements.resPercentage.innerText = `${h.percentage}%`;
              elements.resCorrect.innerText = h.correctCount !== undefined ? h.correctCount : h.score;
              if (elements.resWrong) elements.resWrong.innerText = wrongCount;
              if (elements.resSkipped) elements.resSkipped.innerText = h.skippedCount !== undefined ? h.skippedCount : 0;
              if (elements.resWrongLabel) {
                elements.resWrongLabel.innerText = State.negativeMarkingEnabled && wrongCount > 0
                  ? `ভুল উত্তর (-${(wrongCount * 0.25).toFixed(2)})`
                  : (State.negativeMarkingEnabled ? 'ভুল উত্তর (-০.২৫)' : 'ভুল উত্তর (০)');
              }
              elements.resTime.innerText = timeStr;
              if (elements.resultHeroCard) {
                if (h.penalty) {
                  elements.resultHeroCard.className = 'result-hero-card failed';
                  if (elements.resultHeroIcon) elements.resultHeroIcon.innerText = '⚠️';
                  if (elements.resultHeroTitle) elements.resultHeroTitle.innerText = 'নিয়ম লঙ্ঘনের কারণে বাতিল (০ নম্বর)';
                  if (elements.resultHeroSub) elements.resultHeroSub.innerText = `${h.examTitle || 'পরীক্ষা'} — ট্যাব পরিবর্তন বা সময়সীমা অতিক্রমের কারণে বাতিল হয়েছে।`;
                } else if (Number(h.percentage) >= 50) {
                  elements.resultHeroCard.className = 'result-hero-card success';
                  if (elements.resultHeroIcon) elements.resultHeroIcon.innerText = '🏆';
                  if (elements.resultHeroTitle) elements.resultHeroTitle.innerText = h.examTitle || 'পরীক্ষার উত্তরপত্র রিভিউ';
                  if (elements.resultHeroSub) elements.resultHeroSub.innerText = 'আপনার বিগত পরীক্ষার বিস্তারিত ফলাফল ও উত্তর বিশ্লেষণ';
                } else {
                  elements.resultHeroCard.className = 'result-hero-card failed';
                  if (elements.resultHeroIcon) elements.resultHeroIcon.innerText = '📊';
                  if (elements.resultHeroTitle) elements.resultHeroTitle.innerText = h.examTitle || 'পরীক্ষার উত্তরপত্র রিভিউ';
                  if (elements.resultHeroSub) elements.resultHeroSub.innerText = 'নিচের ব্যাখ্যাগুলো পড়ে ভুলগুলো সংশোধন করে নিন।';
                }
              }
              renderSolutionReview(h.penalty || false, 'all');
              Object.keys(elements.panels).forEach(k => elements.panels[k] && elements.panels[k].classList.remove('active'));
              elements.panels.result.classList.add('active');
            } else {
              alert('এই পরীক্ষার উত্তরপত্র বা প্রশ্নপত্র সংরক্ষিত নেই।');
            }
          };
        }
        elements.historyBody.appendChild(tr);
      });
    };

    let localList = [];
    try {
      localList = JSON.parse(localStorage.getItem(getUserHistoryStorageKey()) || '[]');
    } catch(e) {}

    const REST = getREST();
    if (REST && myUid) {
      REST.get(`user_exam_history/${myUid}`, { orderBy: '$key', limitToLast: 25 }).then((val) => {
        if (val && typeof val === 'object') {
          const dbList = Object.keys(val).map(k => ({ id: k, ...val[k] })).reverse();
          renderHistory(dbList);
        } else {
          renderHistory(localList);
        }
      }).catch(() => {
        renderHistory(localList);
      });
    } else {
      renderHistory(localList);
    }
  }

  // 17. Interactive Modals for Add Subject, Add Chapter & Add Test Set (Points 2, 5, 9, 10)
  function openAddSubjectModalInUserPortal() {
    let existing = document.getElementById('userAddSubModalOverlay');
    if (existing) {
      existing.style.display = 'none';
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'userAddSubModalOverlay';
    overlay.className = 'exam-modal-overlay active';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100005;padding:16px;opacity:1;pointer-events:auto;';
    const curClass = getStudentClass();

    overlay.innerHTML = `
      <div class="exam-modal-container" style="max-width:500px;width:100%;background:#0f172a;border:1.5px solid rgba(16,185,129,0.35);border-radius:18px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,0.85);position:relative;z-index:100010">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;margin-bottom:16px">
          <h3 style="margin:0;font-size:18px;font-weight:700;color:#f8fafc;display:flex;align-items:center;gap:8px">
            <span style="font-size:22px">🌿</span> ➕ নতুন বিষয় যোগ করুন
          </h3>
          <button type="button" id="btnCloseAddSubModal" style="background:transparent;border:none;color:#94a3b8;font-size:24px;cursor:pointer;line-height:1;padding:0 6px" title="বন্ধ করুন (✕)">✕</button>
        </div>

        <div style="margin-bottom:14px">
          <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:6px">বিষয়ের নাম (বাংলায়):</label>
          <input type="text" id="inpSubTitleBn" placeholder="যেমন: পদার্থবিজ্ঞান ১ম পত্র বা আইসিটি" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none" />
        </div>

        <div style="margin-bottom:14px">
          <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:6px">ইংরেজি নাম (ঐচ্ছিক):</label>
          <input type="text" id="inpSubTitleEn" placeholder="যেমন: Physics 1st Paper" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none" />
        </div>

        <div style="margin-bottom:14px">
          <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:6px">ক্লাস / ক্যাটাগরি:</label>
          <select id="selSubCategory" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none">
            <option value="HSC" ${curClass === 'HSC' ? 'selected' : ''}>🎓 এইচএসসি (HSC)</option>
            <option value="SSC" ${curClass === 'SSC' ? 'selected' : ''}>📖 এসএসসি (SSC)</option>
            <option value="Admission" ${curClass === 'Admission' ? 'selected' : ''}>🎯 ভর্তি পরীক্ষা (Admission)</option>
            <option value="BCS" ${curClass === 'BCS' ? 'selected' : ''}>💼 বিসিএস ও চাকরি (BCS / Job)</option>
          </select>
        </div>

        <div style="margin-bottom:16px;padding:12px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:10px;font-size:12.5px;color:#a7f3d0">
          ✨ ডিফল্ট থিম: <strong>Glossy Dark Light Gradient Green</strong> স্বয়ংক্রিয়ভাবে প্রযুক্ত হবে।
        </div>

        <div id="subModalErr" style="color:#f87171;font-size:12.5px;margin-bottom:12px;min-height:16px"></div>

        <div style="display:flex;gap:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px">
          <button type="button" class="btn-back-subjects" id="btnCancelAddSub" style="flex:1;justify-content:center;padding:10px;font-weight:600;border-radius:10px">বাতিল</button>
          <button type="button" id="btnSaveAddSub" style="flex:1;background:linear-gradient(135deg, #059669, #10b981);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;padding:10px">সংরক্ষণ করুন</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
      overlay.classList.remove('active');
      overlay.style.display = 'none';
      overlay.remove();
    };

    document.getElementById('btnCloseAddSubModal').onclick = close;
    document.getElementById('btnCancelAddSub').onclick = close;
    overlay.onclick = (e) => {
      // Rule 2: Strict Close Behavior - Outside backdrop clicks do NOT close modal
      if (e.target === overlay) e.stopPropagation();
    };
    const modalBox = overlay.querySelector('.exam-modal-container');
    if (modalBox) modalBox.onclick = (e) => e.stopPropagation();

    document.getElementById('btnSaveAddSub').onclick = () => {
      const titleBn = document.getElementById('inpSubTitleBn').value.trim();
      const titleEn = document.getElementById('inpSubTitleEn').value.trim() || titleBn;
      const category = document.getElementById('selSubCategory').value;
      const errEl = document.getElementById('subModalErr');

      if (!titleBn) {
        errEl.innerText = 'বিষয়ের নাম লিখুন।';
        return;
      }

      const newSubj = {
        id: 'subj_' + Date.now().toString(36),
        titleBn: titleBn,
        titleEn: titleEn,
        category: category,
        tag: `${category} প্রস্তুতি`,
        gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 35%, #059669 70%, #10b981 100%)',
        chapters: [],
        noChapters: true
      };

      const btnSave = document.getElementById('btnSaveAddSub');
      btnSave.disabled = true;
      btnSave.innerText = '⏳ সেভ হচ্ছে...';

      try {
        localStorage.setItem('sr_custom_subject_' + newSubj.id, JSON.stringify(newSubj));
      } catch (e) {}

      const REST = getREST();
      if (REST) {
        Promise.all([
          REST.set(`exam_subjects/${newSubj.id}`, newSubj),
          REST.set(`subjects/${newSubj.id}`, newSubj),
          REST.remove(`exam_deleted_subjects/${newSubj.id}`).catch(() => null)
        ]).then(() => {
          close();
          showExamNotice('✓ নতুন বিষয় সফলভাবে যোগ করা হয়েছে!');
          loadSubjectsFromDB();
        }).catch(err => {
          errEl.innerText = 'ত্রুটি: ' + err.message;
          btnSave.disabled = false;
          btnSave.innerText = 'সংরক্ষণ করুন';
        });
      } else {
        State.subjects.push(newSubj);
        close();
        renderSubjectsGrid();
        showExamNotice('✓ নতুন বিষয় যোগ করা হয়েছে!');
      }
    };
  }

  function openAddChapterModalInUserPortal(subject) {
    const activeSubj = subject || State.currentSubject;
    if (!activeSubj) {
      alert('প্রথমে একটি বিষয় নির্বাচন করুন।');
      return;
    }

    let existing = document.getElementById('userAddChModalOverlay');
    if (existing) {
      existing.style.display = 'none';
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'userAddChModalOverlay';
    overlay.className = 'exam-modal-overlay active';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100005;padding:16px;opacity:1;pointer-events:auto;';

    const defNum = (activeSubj.chapters && activeSubj.chapters.length) ? activeSubj.chapters.length + 1 : 1;

    overlay.innerHTML = `
      <div class="exam-modal-container" style="max-width:480px;width:100%;background:#0f172a;border:1.5px solid rgba(56,189,248,0.35);border-radius:18px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,0.85);position:relative;z-index:100010">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;margin-bottom:16px">
          <div>
            <h3 style="margin:0 0 4px;font-size:18px;font-weight:700;color:#f8fafc;display:flex;align-items:center;gap:8px">
              <span style="font-size:22px">📖</span> ➕ নতুন চ্যাপ্টার যোগ করুন
            </h3>
            <small style="color:#94a3b8;font-size:12.5px">বিষয়: ${escHtml(activeSubj.titleBn)}</small>
          </div>
          <button type="button" id="btnCloseAddChModal" style="background:transparent;border:none;color:#94a3b8;font-size:24px;cursor:pointer;line-height:1;padding:0 6px" title="বন্ধ করুন (✕)">✕</button>
        </div>

        <div style="margin-bottom:14px">
          <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:6px">অধ্যায় নম্বর:</label>
          <input type="number" id="inpChNum" min="1" max="100" value="${defNum}" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;font-weight:700;outline:none" />
        </div>

        <div style="margin-bottom:14px">
          <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:6px">অধ্যায়ের নাম:</label>
          <input type="text" id="inpChName" placeholder="যেমন: গতিবিদ্যা বা পরিবেশ রসায়ন" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none" />
        </div>

        <div id="chModalErr" style="color:#f87171;font-size:12.5px;margin-bottom:12px;min-height:16px"></div>

        <div style="display:flex;gap:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px">
          <button type="button" class="btn-back-subjects" id="btnCancelAddCh" style="flex:1;justify-content:center;padding:10px;font-weight:600;border-radius:10px">বাতিল</button>
          <button type="button" id="btnSaveAddCh" style="flex:1;background:linear-gradient(135deg, #0284c7, #0ea5e9);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;padding:10px">সংরক্ষণ করুন</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
      overlay.classList.remove('active');
      overlay.style.display = 'none';
      overlay.remove();
    };

    document.getElementById('btnCloseAddChModal').onclick = close;
    document.getElementById('btnCancelAddCh').onclick = close;
    overlay.onclick = (e) => {
      // Rule 2: Strict Close Behavior
      if (e.target === overlay) e.stopPropagation();
    };
    const modalBox = overlay.querySelector('.exam-modal-container');
    if (modalBox) modalBox.onclick = (e) => e.stopPropagation();

    document.getElementById('btnSaveAddCh').onclick = () => {
      const numVal = parseInt(document.getElementById('inpChNum').value, 10) || defNum;
      const nameVal = document.getElementById('inpChName').value.trim();
      const errEl = document.getElementById('chModalErr');

      if (!nameVal) {
        errEl.innerText = 'অধ্যায়ের নাম লিখুন।';
        return;
      }

      const newCh = {
        id: 'ch_' + Date.now().toString(36),
        num: numVal,
        name: nameVal
      };

      if (!activeSubj.chapters) activeSubj.chapters = [];
      activeSubj.chapters.push(newCh);
      delete activeSubj.noChapters;
      try {
        localStorage.setItem('sr_custom_subject_' + activeSubj.id, JSON.stringify(activeSubj));
      } catch (e) {}

      const btnSave = document.getElementById('btnSaveAddCh');
      btnSave.disabled = true;
      btnSave.innerText = '⏳ সেভ হচ্ছে...';

      const REST = getREST();
      if (REST && activeSubj.id) {
        Promise.all([
          REST.set(`exam_subjects/${activeSubj.id}/chapters`, activeSubj.chapters),
          REST.remove(`exam_subjects/${activeSubj.id}/noChapters`).catch(() => null),
          REST.set(`subjects/${activeSubj.id}/chapters`, activeSubj.chapters)
        ]).then(() => {
          close();
          showExamNotice('✓ নতুন চ্যাপ্টার সফলভাবে যোগ করা হয়েছে!');
          openSubjectChapters(activeSubj);
        }).catch(err => {
          errEl.innerText = 'ত্রুটি: ' + err.message;
          btnSave.disabled = false;
          btnSave.innerText = 'সংরক্ষণ করুন';
        });
      } else {
        close();
        openSubjectChapters(activeSubj);
        alert('✓ নতুন চ্যাপ্টার যোগ হয়েছে!');
      }
    };
  }

  function openAddTestSetModalInUserPortal(subject, chapter) {
    const activeSubj = subject || State.currentSubject;
    const activeChap = chapter || State.currentChapter;

    if (!activeChap) {
      alert('প্রথমে একটি অধ্যায় নির্বাচন করুন।');
      return;
    }

    let existing = document.getElementById('userAddTestModalOverlay');
    if (existing) {
      existing.style.display = 'none';
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'userAddTestModalOverlay';
    overlay.className = 'exam-modal-overlay active';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100005;padding:16px;opacity:1;pointer-events:auto;';

    const defTitle = `টেস্ট: ${activeChap.name} মডেল টেস্ট`;

    overlay.innerHTML = `
      <div class="exam-modal-container" style="max-width:620px;width:100%;background:#0f172a;border:1.5px solid rgba(52,211,153,0.35);border-radius:18px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,0.85);position:relative;z-index:100010;max-height:90vh;display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;margin-bottom:14px">
          <div>
            <h3 style="margin:0 0 4px;font-size:18px;font-weight:700;color:#f8fafc;display:flex;align-items:center;gap:8px">
              <span>📝</span> ➕ নতুন টেস্ট সেট যোগ করুন
            </h3>
            <small style="color:#94a3b8;font-size:12.5px">অধ্যায়: ${escHtml(activeChap.name)} (চ্যাপ্টার ${escHtml(activeChap.num)})</small>
          </div>
          <button type="button" id="btnCloseAddTestModal" style="background:transparent;border:none;color:#94a3b8;font-size:24px;cursor:pointer;line-height:1;padding:0 6px" title="বন্ধ করুন (✕)">✕</button>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:14px;background:#1e293b;padding:4px;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
          <button type="button" id="tabUserTsForm" style="flex:1;padding:8px 12px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;border:none;background:#059669;color:#fff">
            📝 সাধারণ তথ্য ও সময়সীমা
          </button>
          <button type="button" id="tabUserTsJson" style="flex:1;padding:8px 12px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;border:none;background:transparent;color:#94a3b8">
            💻 প্রশ্নব্যাংক JSON কোড
          </button>
        </div>

        <div style="overflow-y:auto;flex:1;padding-right:4px">
          <div id="panelUserTsForm">
            <div style="margin-bottom:12px">
              <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:4px">টেস্ট সেটের নাম (Title):</label>
              <input type="text" id="inpUserTsTitle" value="${escHtml(defTitle)}" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none" />
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
              <div>
                <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:4px">ট্যাগ / ক্যাটাগরি:</label>
                <input type="text" id="inpUserTsTag" value="মক টেস্ট" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none" />
              </div>
              <div>
                <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:4px">সময়সীমা (মিনিট):</label>
                <input type="number" id="inpUserTsDur" min="1" max="180" value="15" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;font-weight:700;outline:none" />
              </div>
            </div>

            <div style="margin-bottom:12px">
              <label style="font-size:12.5px;color:#94a3b8;font-weight:600;display:block;margin-bottom:6px">দ্রুত সময় নির্বাচন:</label>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button type="button" class="btn-preset-dur" data-dur="10" style="padding:4px 10px;font-size:12px;border-radius:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;cursor:pointer">১০ মি.</button>
                <button type="button" class="btn-preset-dur" data-dur="15" style="padding:4px 10px;font-size:12px;border-radius:8px;background:rgba(52,211,153,0.15);border:1px solid #34d399;color:#34d399;cursor:pointer">১৫ মি.</button>
                <button type="button" class="btn-preset-dur" data-dur="20" style="padding:4px 10px;font-size:12px;border-radius:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;cursor:pointer">২০ মি.</button>
                <button type="button" class="btn-preset-dur" data-dur="25" style="padding:4px 10px;font-size:12px;border-radius:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;cursor:pointer">২৫ মি.</button>
                <button type="button" class="btn-preset-dur" data-dur="30" style="padding:4px 10px;font-size:12px;border-radius:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;cursor:pointer">৩০ মি.</button>
              </div>
            </div>

            <div style="margin-bottom:12px">
              <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:4px">সংক্ষিপ্ত বিবরণ:</label>
              <input type="text" id="inpUserTsDesc" placeholder="যেমন: অধ্যায় রিভিশন ও পূর্ণাঙ্গ এমসিকিউ টেস্ট সেট" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none" />
            </div>
          </div>

          <div id="panelUserTsJson" style="display:none">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <label style="font-size:13px;font-weight:600;color:#cbd5e1">প্রশ্নব্যাংক (JSON Array):</label>
              <div style="display:flex;gap:6px">
                <button type="button" id="btnUserLoadDemoQ" style="background:rgba(52,211,153,0.15);border:1px solid #34d399;color:#34d399;font-size:11.5px;padding:3px 8px;border-radius:6px;cursor:pointer;font-weight:700">📋 ডেমো প্রশ্ন</button>
                <button type="button" id="btnUserFormatJson" style="background:rgba(56,189,248,0.15);border:1px solid #38bdf8;color:#38bdf8;font-size:11.5px;padding:3px 8px;border-radius:6px;cursor:pointer">✨ Format</button>
              </div>
            </div>
            <textarea id="inpUserTsJson" rows="9" placeholder='[\n  {\n    "question": "প্রশ্ন এখানে...",\n    "image": "https://... (ঐচ্ছিক)",\n    "options": ["ক অপশন", "খ অপশন", "গ অপশন", "ঘ অপশন"],\n    "correct": 0,\n    "explanation": "ব্যাখ্যা... (ঐচ্ছিক)",\n    "tricks": "মনে রাখার সহজ কৌশল... (ঐচ্ছিক)",\n    "optionBreakdown": "অপশনগুলোর বিশ্লেষণ... (ঐচ্ছিক)"\n  }\n]' style="width:100%;font-family:monospace;font-size:12.5px;padding:10px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;box-sizing:border-box;line-height:1.4"></textarea>
          </div>
        </div>

        <div id="userTsModalErr" style="color:#f87171;font-size:12.5px;margin-top:8px;min-height:16px"></div>

        <div style="display:flex;gap:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;margin-top:10px">
          <button type="button" class="btn-back-subjects" id="btnCancelAddTest" style="flex:1;justify-content:center;padding:10px;font-weight:600;border-radius:10px">বাতিল</button>
          <button type="button" id="btnSaveAddTest" style="flex:1;background:linear-gradient(135deg, #059669, #10b981);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;padding:10px">➕ এক্সাম সেট তৈরি করুন</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
      overlay.classList.remove('active');
      overlay.style.display = 'none';
      overlay.remove();
    };

    document.getElementById('btnCloseAddTestModal').onclick = close;
    document.getElementById('btnCancelAddTest').onclick = close;
    overlay.onclick = (e) => {
      // Rule 2: Strict Close Behavior
      if (e.target === overlay) e.stopPropagation();
    };
    const modalBox = overlay.querySelector('.exam-modal-container');
    if (modalBox) modalBox.onclick = (e) => e.stopPropagation();

    // Tab switching
    const tabForm = document.getElementById('tabUserTsForm');
    const tabJson = document.getElementById('tabUserTsJson');
    const panelForm = document.getElementById('panelUserTsForm');
    const panelJson = document.getElementById('panelUserTsJson');

    tabForm.onclick = () => {
      tabForm.style.background = '#059669';
      tabForm.style.color = '#fff';
      tabJson.style.background = 'transparent';
      tabJson.style.color = '#94a3b8';
      panelForm.style.display = 'block';
      panelJson.style.display = 'none';
    };

    tabJson.onclick = () => {
      tabJson.style.background = '#059669';
      tabJson.style.color = '#fff';
      tabForm.style.background = 'transparent';
      tabForm.style.color = '#94a3b8';
      panelForm.style.display = 'none';
      panelJson.style.display = 'block';
    };

    // Duration presets
    overlay.querySelectorAll('.btn-preset-dur').forEach(b => {
      b.onclick = () => {
        document.getElementById('inpUserTsDur').value = b.getAttribute('data-dur');
        overlay.querySelectorAll('.btn-preset-dur').forEach(x => {
          x.style.background = 'rgba(255,255,255,0.06)';
          x.style.borderColor = 'rgba(255,255,255,0.1)';
          x.style.color = '#e2e8f0';
        });
        b.style.background = 'rgba(52,211,153,0.15)';
        b.style.borderColor = '#34d399';
        b.style.color = '#34d399';
      };
    });

    // Demo questions loader
    document.getElementById('btnUserLoadDemoQ').onclick = () => {
      const demo = [
        {
          question: `${activeChap.name} সম্পর্কিত মৌলিক প্রশ্ন কোনটি?`,
          image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Simple_harmonic_motion_animation.gif/220px-Simple_harmonic_motion_animation.gif',
          options: ['প্রথম সূত্র ও প্রাথমিক ধারণা', 'দ্বিতীয় সূত্র ও প্রয়োগ', 'উভয়ই সঠিক', 'কোনোটিই নয়'],
          correct: 2,
          explanation: 'অধ্যায়ের মূল পাঠ্যবই ভিত্তিক আলোচনা।',
          tricks: 'প্রাথমিক সূত্র ও প্রয়োগ—দুটোই মিলিয়ে মনে রাখলে সহজ হয়।',
          optionBreakdown: [
            'ক) শুধু প্রাথমিক অংশ',
            'খ) শুধু প্রয়োগ অংশ',
            'গ) উভয় অংশ সমন্বিত (সঠিক)',
            'ঘ) প্রযোজ্য নয়'
          ]
        },
        {
          question: `${activeChap.name} এর প্রধান একক বা মাত্রা কী?`,
          options: ['এসআই একক', 'সিজিএস একক', 'পরম মান', 'মাত্রা সমীকরণ'],
          correct: 0,
          explanation: 'আন্তর্জাতিক প্রমাণ একক অনুযায়ী সঠিক।'
        }
      ];
      document.getElementById('inpUserTsJson').value = JSON.stringify(demo, null, 2);
    };

    // Format JSON
    document.getElementById('btnUserFormatJson').onclick = () => {
      const errEl = document.getElementById('userTsModalErr');
      try {
        const val = JSON.parse(document.getElementById('inpUserTsJson').value);
        document.getElementById('inpUserTsJson').value = JSON.stringify(val, null, 2);
        if (errEl) errEl.innerText = '';
      } catch(e) {
        if (errEl) errEl.innerText = 'ভুল JSON সিনট্যাক্স: ' + e.message;
      }
    };

    // Save test set
    document.getElementById('btnSaveAddTest').onclick = () => {
      const title = document.getElementById('inpUserTsTitle').value.trim();
      const tag = document.getElementById('inpUserTsTag').value.trim() || 'মক টেস্ট';
      const dur = parseInt(document.getElementById('inpUserTsDur').value, 10) || 15;
      const desc = document.getElementById('inpUserTsDesc').value.trim();
      const jsonTxt = document.getElementById('inpUserTsJson').value.trim();
      const errEl = document.getElementById('userTsModalErr');

      if (!title) {
        errEl.innerText = 'টেস্টের একটি নাম লিখুন।';
        return;
      }

      let questions = [];
      if (jsonTxt) {
        try {
          questions = JSON.parse(jsonTxt);
          if (!Array.isArray(questions)) {
            errEl.innerText = 'প্রশ্ন কোড অবশ্যই একটি Array (তালিকা) হতে হবে!';
            return;
          }
        } catch(e) {
          errEl.innerText = 'JSON সিনট্যাক্স ভুল: ' + e.message;
          return;
        }
      }

      const testId = 'test_' + activeChap.id + '_' + Date.now().toString().slice(-6);
      const testObj = {
        id: testId,
        title: title,
        tag: tag,
        durationMinutes: dur,
        timeLimit: dur, // Point 1: timeLimit field synced!
        desc: desc || `⏱ ${dur} মিনিট · 📝 ${questions.length}টি প্রশ্ন`,
        questions: questions,
        qCount: questions.length,
        updatedAt: Date.now()
      };

      // Immediate local save
      try {
        localStorage.setItem('sr_local_ts_' + activeChap.id + '_' + testId, JSON.stringify(testObj));
      } catch(e) {}

      const btnSave = document.getElementById('btnSaveAddTest');
      btnSave.disabled = true;
      btnSave.innerText = '⏳ সেভ হচ্ছে...';

      const REST = getREST();
      const subId = (activeSubj && activeSubj.id) ? activeSubj.id : 'default';

      if (REST) {
        const candidatePromises = [
          REST.set(`subjects/${subId}/chapters/${activeChap.id}/examSets/${testId}`, testObj).catch(() => null),
          REST.set(`examSets/${activeChap.id}/${testId}`, testObj).catch(() => null),
          REST.set(`exam_chapter_tests/${activeChap.id}/${testId}`, testObj).catch(() => null),
          REST.set(`chapter_exams/${activeChap.id}/${testId}`, testObj).catch(() => null),
          REST.set(`exam_chapter_durations/${activeChap.id}`, dur).catch(() => null)
        ];

        Promise.all(candidatePromises).then(() => {
          close();
          showExamNotice('✓ নতুন এক্সাম সেট সফলভাবে তৈরি হয়েছে!');
          openChapterExamsList(activeSubj, activeChap);
        }).catch(() => {
          close();
          openChapterExamsList(activeSubj, activeChap);
          showExamNotice('✓ নতুন এক্সাম সেট সংরক্ষিত হয়েছে!');
        });
      } else {
        close();
        openChapterExamsList(activeSubj, activeChap);
        showExamNotice('✓ নতুন এক্সাম সেট সংরক্ষিত হয়েছে!');
      }
    };
  }

  // Expose helpers globally
  window.openAddSubjectModalInUserPortal = openAddSubjectModalInUserPortal;
  window.openAddChapterModalInUserPortal = openAddChapterModalInUserPortal;
  window.openAddTestSetModalInUserPortal = openAddTestSetModalInUserPortal;

  function promptAddNewSubject() {
    openAddSubjectModalInUserPortal();
  }

  function promptAddNewChapter() {
    openAddChapterModalInUserPortal(State.currentSubject);
  }

  // 18. In-Page Shortcuts Modal (Pop-up Modal instead of shortcuts.html redirect)
  let inPageShortcuts = [];
  let inPageEditingId = null;

  function getShortcutIdentity() {
    const code = window.CODE || localStorage.getItem('sr-code') || '14320';
    const isMonitor = !!window.MON || window.me === 'mon' || localStorage.getItem('sr-me') === 'mon';
    const me = isMonitor ? 'mon' : (window.me || localStorage.getItem('sr-me') || 'p1');
    return { code, me, isMonitor };
  }

  function getShortcutDBPath() {
    const { code, me } = getShortcutIdentity();
    return code === '1432014310'
      ? `rooms/${code}/${me}/sc`
      : `rooms_v2/${code}/${me}/sc`;
  }

  function getScopedShortcutBackupKey() {
    const { code, me } = getShortcutIdentity();
    return `sr_shortcuts_backup_${code}_${me}`;
  }

  function readLocalShortcutBackup() {
    const scopedKey = getScopedShortcutBackupKey();
    try {
      const scopedRaw = localStorage.getItem(scopedKey);
      if (scopedRaw !== null) {
        const parsed = JSON.parse(scopedRaw);
        if (Array.isArray(parsed)) return parsed;
      }
      const legacyRaw = localStorage.getItem('sr_shortcuts_backup');
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed)) return legacyParsed;
      }
    } catch (e) {}
    return [];
  }

  function writeLocalShortcutBackup(list) {
    try {
      localStorage.setItem(getScopedShortcutBackupKey(), JSON.stringify(list));
      localStorage.setItem('sr_shortcuts_backup', JSON.stringify(list));
    } catch (e) {}
  }

  function renderInPageShortcutModalMarkup() {
    if (document.getElementById('inPageShortcutModalOverlay')) return;

    const shortcutModalHtml = `
      <div id="inPageShortcutModalOverlay" class="exam-modal-overlay" role="dialog" aria-modal="true" style="z-index:9999">
        <div class="exam-modal-container" style="max-width:880px">
          
          <header class="exam-portal-header">
            <div class="exam-brand-wrapper">
              <div class="exam-brand-icon" style="background:linear-gradient(135deg,#059669,#10b981)">🔗</div>
              <div>
                <h3 class="exam-portal-title">পড়ার শর্টকাট ও ক্লাস রিসোর্স</h3>
                <p class="exam-portal-sub">আমার অধ্যয়ন কক্ষ - দ্রুত অ্যাক্সেস হাব</p>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:8px">
              <button type="button" id="btnInPageScAdd" style="background:#059669;color:#fff;border:none;padding:8px 14px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                ➕ নতুন শর্টকাট
              </button>
              <button class="exam-close-btn" id="btnInPageScClose" type="button" title="বন্ধ করুন">✕</button>
            </div>
          </header>

          <div style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.06)">
            <input type="search" id="inPageScSearchInput" placeholder="🔍 শর্টকাটের নাম বা লিংক দিয়ে খুঁজুন..." style="width:100%;box-sizing:border-box;background:#1e293b;border:1.5px solid rgba(255,255,255,0.12);color:#f8fafc;padding:10px 16px;border-radius:12px;font:inherit;font-size:14px;outline:none">
          </div>

          <div class="exam-portal-body" style="padding:20px;max-height:calc(85vh - 170px);overflow-y:auto">
            <div id="inPageScGridContainer" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(270px, 1fr));gap:14px">
              <div class="sr-skeleton-card" aria-hidden="true"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div></div>
              <div class="sr-skeleton-card" aria-hidden="true"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div></div>
              <div class="sr-skeleton-card" aria-hidden="true"><div class="sr-skeleton-line md"></div><div class="sr-skeleton-line sm"></div></div>
            </div>
          </div>

        </div>

        <!-- Bottom Left Back Button -->
        <button id="btnInPageScBottomBack" type="button" style="position:fixed;bottom:20px;left:20px;z-index:10000;background:#1e293b;border:1.5px solid #10b981;color:#34d399;padding:9px 18px;border-radius:999px;font-weight:700;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,0.4);cursor:pointer;display:inline-flex;align-items:center;gap:6px">
          ← রুমে ফিরে যান
        </button>
      </div>

      <!-- In-Page Shortcut Add/Edit Modal -->
      <div id="inPageScEditorModal" class="strict-warning-overlay" style="z-index:100020;display:none;opacity:0;pointer-events:none;background:rgba(15,23,42,0.85)">
        <div class="strict-warning-box" style="background:#0f172a;border-color:rgba(16,185,129,0.5);box-shadow:0 0 40px rgba(16,185,129,0.25);color:#f8fafc;max-width:460px;width:90%">
          <div class="warning-alert-icon" style="background:rgba(16,185,129,0.15);border-color:#10b981;color:#34d399">🔗</div>
          <h3 id="inPageScEditorTitle" style="margin:0 0 12px 0;font-size:19px;font-weight:800;color:#f8fafc">➕ নতুন শর্টকাট যোগ করুন</h3>
          
          <div style="text-align:left;margin-bottom:12px">
            <label for="inPageScNameInput" style="font-size:12.5px;color:#94a3b8;font-weight:600;display:block;margin-bottom:4px">শর্টকাটের নাম:</label>
            <input type="text" id="inPageScNameInput" placeholder="যেমন: Physics Master Class বা 10 Minute School" maxlength="60" style="width:100%;box-sizing:border-box;padding:9px 12px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none">
          </div>

          <div style="text-align:left;margin-bottom:14px">
            <label for="inPageScUrlInput" style="font-size:12.5px;color:#94a3b8;font-weight:600;display:block;margin-bottom:4px">ওয়েবসাইট বা রিসোর্স লিঙ্ক (URL):</label>
            <input type="url" id="inPageScUrlInput" placeholder="https://..." style="width:100%;box-sizing:border-box;padding:9px 12px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none">
          </div>

          <div id="inPageScModalErr" style="color:#f87171;font-size:12.5px;margin-bottom:12px;min-height:16px;text-align:left"></div>

          <div style="display:flex;gap:10px">
            <button id="btnInPageScCancel" type="button" class="btn-back-subjects" style="flex:1;justify-content:center;padding:9px">বাতিল</button>
            <button id="btnInPageScSave" type="button" style="flex:1;background:#059669;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;padding:9px">সংরক্ষণ করুন</button>
          </div>
        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = shortcutModalHtml;
    while (div.firstElementChild) {
      document.body.appendChild(div.firstElementChild);
    }

    // Bind In-Page shortcut modal listeners
    document.getElementById('btnInPageScClose').onclick = closeInPageShortcutModal;
    document.getElementById('btnInPageScBottomBack').onclick = closeInPageShortcutModal;
    document.getElementById('btnInPageScAdd').onclick = () => openInPageScEditor(null);
    document.getElementById('inPageScSearchInput').oninput = renderInPageShortcutsGrid;
    document.getElementById('btnInPageScCancel').onclick = closeInPageScEditor;
    document.getElementById('btnInPageScSave').onclick = saveInPageScItem;

    const editorOverlay = document.getElementById('inPageScEditorModal');
    if (editorOverlay) {
      editorOverlay.onclick = (e) => {
        if (e.target === editorOverlay) closeInPageScEditor();
      };
    }

    const nameInput = document.getElementById('inPageScNameInput');
    const urlInput = document.getElementById('inPageScUrlInput');
    if (nameInput) {
      nameInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (urlInput) urlInput.focus();
        }
      };
    }
    if (urlInput) {
      urlInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveInPageScItem();
        }
      };
    }

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const edModal = document.getElementById('inPageScEditorModal');
      if (edModal && edModal.classList.contains('active')) {
        closeInPageScEditor();
        return;
      }
      const mainOverlay = document.getElementById('inPageShortcutModalOverlay');
      if (mainOverlay && mainOverlay.classList.contains('active')) {
        closeInPageShortcutModal();
      }
    });
  }

  function normalizeShortcutList(val) {
    if (Array.isArray(val)) return val.filter(x => x && typeof x === 'object' && x.n && x.u);
    if (val && typeof val === 'object') {
      return Object.keys(val)
        .map(k => (val[k] && typeof val[k] === 'object' ? { i: val[k].i || k, ...val[k] } : null))
        .filter(x => x && x.n && x.u);
    }
    return [];
  }

  function loadInPageShortcuts() {
    const REST = getREST();
    const { code, me, isMonitor } = getShortcutIdentity();
    const path = getShortcutDBPath();
    const localBackup = readLocalShortcutBackup();

    // Immediate in-memory preview if P[me].sc is already populated
    if (!isMonitor && window.P && window.P[me] && Array.isArray(window.P[me].sc) && window.P[me].sc.length > 0) {
      inPageShortcuts = normalizeShortcutList(window.P[me].sc);
      renderInPageShortcutsGrid();
    }

    if (REST && !isMonitor) {
      REST.get(path).then(val => {
        const list = normalizeShortcutList(val);
        if (list.length > 0) {
          inPageShortcuts = list;
          writeLocalShortcutBackup(inPageShortcuts);
          if (window.P && window.P[me]) window.P[me].sc = inPageShortcuts.slice();
          renderInPageShortcutsGrid();
        } else if (code !== '1432014310') {
          // Legacy fallback check under members/${me}/sc
          REST.get(`rooms_v2/${code}/members/${me}/sc`).then(legVal => {
            const legList = normalizeShortcutList(legVal);
            if (legList.length > 0) {
              inPageShortcuts = legList;
              writeLocalShortcutBackup(inPageShortcuts);
            } else {
              inPageShortcuts = localBackup;
            }
            if (window.P && window.P[me]) window.P[me].sc = inPageShortcuts.slice();
            renderInPageShortcutsGrid();
          }).catch(() => {
            inPageShortcuts = localBackup;
            renderInPageShortcutsGrid();
          });
        } else {
          inPageShortcuts = localBackup;
          renderInPageShortcutsGrid();
        }
      }).catch(() => {
        inPageShortcuts = localBackup;
        renderInPageShortcutsGrid();
      });
    } else {
      inPageShortcuts = localBackup;
      renderInPageShortcutsGrid();
    }
  }

  function saveInPageShortcutsDB() {
    writeLocalShortcutBackup(inPageShortcuts);

    const REST = getREST();
    const { code, me, isMonitor } = getShortcutIdentity();
    if (!isMonitor && window.P && window.P[me]) {
      window.P[me].sc = inPageShortcuts.slice();
    }
    if (!REST || isMonitor) return Promise.resolve({ localOnly: true });

    const path = getShortcutDBPath();
    const tasks = [REST.set(path, inPageShortcuts)];
    if (code === '1432014310' && (me === 'p1' || me === 'p2')) {
      tasks.push(REST.set(`vip_users/${me}/sc`, inPageShortcuts).catch(() => null));
    }
    return Promise.all(tasks);
  }

  function copyTextFallback(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px;top:0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) resolve();
        else reject(new Error('copy_failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  function renderInPageShortcutsGrid() {
    const container = document.getElementById('inPageScGridContainer');
    if (!container) return;
    const searchInput = document.getElementById('inPageScSearchInput');
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const filtered = inPageShortcuts.filter(s => {
      return !q || (s.n && s.n.toLowerCase().includes(q)) || (s.u && s.u.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px 20px;background:#1e293b;border-radius:16px;border:1px dashed rgba(255,255,255,0.15)">
          <div style="font-size:38px;margin-bottom:12px">🔗</div>
          <h3 style="margin:0 0 8px;color:#f8fafc;font-size:18px">${q ? 'খুঁজে কোনো শর্টকাট পাওয়া যায়নি' : 'কোনো শর্টকাট যোগ করা হয়নি'}</h3>
          <p style="margin:0 0 16px;color:#94a3b8;font-size:13.5px">প্রয়োজনীয় ক্লাস, লেকচার শিট ও ওয়েবসাইটের লিঙ্ক সহজে পেতে শর্টকাট যোগ করুন।</p>
          <button id="btnEmptyAddSc" type="button" style="background:#059669;color:#fff;border:none;border-radius:10px;padding:9px 20px;font-weight:700;cursor:pointer">➕ নতুন শর্টকাট যোগ করুন</button>
        </div>
      `;
      const emptyBtn = document.getElementById('btnEmptyAddSc');
      if (emptyBtn) emptyBtn.onclick = () => openInPageScEditor(null);
      return;
    }

    container.innerHTML = '';
    filtered.forEach(s => {
      const card = document.createElement('div');
      card.className = 'sc-inpage-card';
      card.style.cssText = 'background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;transition:all 0.2s';

      const rawUrl = String(s.u || '').trim();
      let safeUrl = '#';
      if (rawUrl) {
        try {
          const parsedUrl = new URL(/^[a-z][a-z0-9+.-]*:/i.test(rawUrl) ? rawUrl : ('https://' + rawUrl));
          if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') safeUrl = parsedUrl.href;
        } catch (e) {}
      }
      const initial = escHtml((s.n || '?').trim().charAt(0).toUpperCase());
      const displayUrl = escHtml((safeUrl === '#' ? rawUrl : safeUrl).replace(/^https?:\/\//i, '').replace(/\/$/, ''));
      const safeName = escHtml(s.n || '');

      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;flex-shrink:0">
            ${initial}
          </div>
          <div style="min-width:0;flex:1">
            <a href="${escHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" style="color:#f8fafc;font-weight:700;font-size:14.5px;text-decoration:none;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${safeName}">
              ${safeName} ↗
            </a>
            <div style="color:#38bdf8;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${displayUrl}
            </div>
          </div>
        </div>
        <div style="display:flex;gap:5px;align-items:center;flex-shrink:0">
          <button type="button" class="btn-sc-copy" title="লিঙ্ক কপি করুন" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;padding:5px 8px;border-radius:8px;font-size:12px;cursor:pointer">📋</button>
          <button type="button" class="btn-sc-edit" title="এডিট করুন" style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;padding:5px 8px;border-radius:8px;font-size:12px;cursor:pointer">✏️</button>
          <button type="button" class="btn-sc-del" title="মুছে ফেলুন" style="background:rgba(248,113,113,0.15);border:1px solid rgba(248,113,113,0.3);color:#f87171;padding:5px 8px;border-radius:8px;font-size:12px;cursor:pointer">🗑</button>
        </div>
      `;

      // Copy link (non-blocking toast instead of alert/prompt)
      card.querySelector('.btn-sc-copy').onclick = () => {
        const targetCopyUrl = safeUrl !== '#' ? safeUrl : rawUrl;
        copyTextFallback(targetCopyUrl).then(() => {
          showExamNotice('✓ শর্টকাট লিঙ্ক কপি করা হয়েছে!');
        }).catch(() => {
          showExamNotice('⚠️ ব্রাউজার থেকে কপি করা যায়নি, লিঙ্কটিতে ক্লিক করে ওপেন করুন।');
        });
      };

      // Edit
      card.querySelector('.btn-sc-edit').onclick = () => {
        openInPageScEditor(s);
      };

      // Delete (two-step inline confirmation so iframe sandboxes never block deletion)
      const delBtn = card.querySelector('.btn-sc-del');
      let delConfirmTimer = null;
      delBtn.onclick = () => {
        if (delBtn.dataset.confirming !== '1') {
          delBtn.dataset.confirming = '1';
          delBtn.textContent = 'নিশ্চিত?';
          delBtn.style.background = '#ef4444';
          delBtn.style.color = '#ffffff';
          delBtn.style.borderColor = '#ef4444';
          delConfirmTimer = setTimeout(() => {
            if (!delBtn.isConnected) return;
            delBtn.dataset.confirming = '0';
            delBtn.textContent = '🗑';
            delBtn.style.background = 'rgba(248,113,113,0.15)';
            delBtn.style.color = '#f87171';
            delBtn.style.borderColor = 'rgba(248,113,113,0.3)';
          }, 3200);
          return;
        }
        clearTimeout(delConfirmTimer);
        inPageShortcuts = inPageShortcuts.filter(x => x.i !== s.i);
        renderInPageShortcutsGrid();
        saveInPageShortcutsDB().then((res) => {
          showExamNotice(res && res.localOnly ? '✓ শর্টকাট মুছে ফেলা হয়েছে (লোকাল)' : '✓ শর্টকাট মুছে ফেলা হয়েছে');
        }).catch(() => {
          showExamNotice('⚠️ লোকাল তালিকা থেকে মুছে ফেলা হয়েছে (সার্ভার সিঙ্ক ব্যর্থ)');
        });
      };

      container.appendChild(card);
    });
  }

  function openInPageScEditor(s = null) {
    renderInPageShortcutModalMarkup();
    const modal = document.getElementById('inPageScEditorModal');
    const title = document.getElementById('inPageScEditorTitle');
    const nameInput = document.getElementById('inPageScNameInput');
    const urlInput = document.getElementById('inPageScUrlInput');
    const errEl = document.getElementById('inPageScModalErr');

    if (!modal) return;
    if (s && s.i) {
      inPageEditingId = s.i;
      if (title) title.innerText = '✏️ শর্টকাট পরিবর্তন করুন';
      if (nameInput) nameInput.value = s.n || '';
      if (urlInput) urlInput.value = s.u || '';
    } else {
      inPageEditingId = null;
      if (title) title.innerText = '➕ নতুন শর্টকাট যোগ করুন';
      if (nameInput) nameInput.value = '';
      if (urlInput) urlInput.value = '';
    }
    if (errEl) errEl.innerText = '';
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    modal.classList.add('active');
    setTimeout(() => { if (nameInput) nameInput.focus(); }, 60);
  }

  function closeInPageScEditor() {
    const modal = document.getElementById('inPageScEditorModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.opacity = '0';
      modal.style.pointerEvents = 'none';
      modal.style.display = 'none';
    }
    inPageEditingId = null;
  }

  function saveInPageScItem() {
    const nameInput = document.getElementById('inPageScNameInput');
    const urlInput = document.getElementById('inPageScUrlInput');
    const errEl = document.getElementById('inPageScModalErr');

    const name = (nameInput ? nameInput.value : '').trim().slice(0, 60);
    let url = (urlInput ? urlInput.value : '').trim();

    if (!name) {
      if (errEl) errEl.innerText = 'শর্টকাটের একটি নাম লিখুন।';
      if (nameInput) nameInput.focus();
      return;
    }
    if (!url) {
      if (errEl) errEl.innerText = 'সঠিক লিঙ্ক দিন।';
      if (urlInput) urlInput.focus();
      return;
    }

    if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) {
      url = 'https://' + url;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        if (errEl) errEl.innerText = 'শুধু http:// বা https:// লিঙ্ক গ্রহণযোগ্য।';
        return;
      }
      if (!parsed.hostname || parsed.hostname.indexOf('.') < 0 && parsed.hostname !== 'localhost') {
        if (errEl) errEl.innerText = 'সঠিক ওয়েবসাইটের লিঙ্ক দিন (যেমন: https://youtube.com)।';
        return;
      }
      url = parsed.href;
    } catch (e) {
      if (errEl) errEl.innerText = 'সঠিক ওয়েবসাইটের লিঙ্ক দিন (যেমন: https://youtube.com)।';
      if (urlInput) urlInput.focus();
      return;
    }

    if (!inPageEditingId && inPageShortcuts.length >= 40) {
      if (errEl) errEl.innerText = 'সর্বোচ্চ ৪০টি শর্টকাট সংরক্ষণ করা যায়।';
      return;
    }

    if (inPageEditingId) {
      inPageShortcuts = inPageShortcuts.map(item => {
        if (item.i === inPageEditingId) {
          return { ...item, n: name, u: url };
        }
        return item;
      });
    } else {
      const newId = 'sc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      inPageShortcuts.push({ i: newId, n: name, u: url });
    }

    const wasEditing = !!inPageEditingId;
    closeInPageScEditor();
    renderInPageShortcutsGrid();
    saveInPageShortcutsDB().then((res) => {
      if (res && res.localOnly) {
        showExamNotice(wasEditing ? '✓ শর্টকাট আপডেট হয়েছে (লোকাল)' : '✓ নতুন শর্টকাট যোগ হয়েছে (লোকাল)');
      } else {
        showExamNotice(wasEditing ? '✓ শর্টকাট আপডেট ও সংরক্ষণ করা হয়েছে!' : '✓ নতুন শর্টকাট সফলভাবে যোগ করা হয়েছে!');
      }
    }).catch(() => {
      showExamNotice('⚠️ লোকাল ব্যাকআপে সেভ হয়েছে — ইন্টারনেট সংযোগ পেলে ক্লাউডে সিঙ্ক হবে।');
    });
  }

  function openInPageShortcutModal() {
    renderInPageShortcutModalMarkup();
    const overlay = document.getElementById('inPageShortcutModalOverlay');
    if (overlay) {
      overlay.classList.add('active');
      loadInPageShortcuts();
    }
  }

  function closeInPageShortcutModal() {
    closeInPageScEditor();
    const overlay = document.getElementById('inPageShortcutModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global controller
  window.ExamPortal = {
    open: openPortal,
    close: closePortal,
    switchTab: switchTab,
    openWrongBank: function () {
      openPortal('subjects', { openWrongBank: true });
    },
    syncWrongBank: syncWrongBankFromDB
  };

})();
