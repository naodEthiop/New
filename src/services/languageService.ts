export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  numbers: { [key: number]: string };
  letters: { [key: string]: string };
  phrases: { [key: string]: string };
  getNumberText: (num: number) => string;
  getLetterText: (letter: string) => string;
}

export const ETHIOPIAN_LANGUAGES: LanguageConfig[] = [
  {
    code: 'am-ET',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    flag: '🇪🇹',
    numbers: {
      1: 'አንድ', 2: 'ሁለት', 3: 'ሦስት', 4: 'አራት', 5: 'አምስት',
      6: 'ስድስት', 7: 'ሰባት', 8: 'ስምንት', 9: 'ዘጠኝ', 10: 'አስር',
      11: 'አስራ አንድ', 12: 'አስራ ሁለት', 13: 'አስራ ሦስት', 14: 'አስራ አራት', 15: 'አስራ አምስት',
      16: 'አስራ ስድስት', 17: 'አስራ ሰባት', 18: 'አስራ ስምንት', 19: 'አስራ ዘጠኝ', 20: 'ሃያ',
      21: 'ሃያ አንድ', 22: 'ሃያ ሁለት', 23: 'ሃያ ሦስት', 24: 'ሃያ አራት', 25: 'ሃያ አምስት',
      26: 'ሃያ ስድስት', 27: 'ሃያ ሰባት', 28: 'ሃያ ስምንት', 29: 'ሃያ ዘጠኝ', 30: 'ሰ��ሳ',
      31: 'ሰላሳ አንድ', 32: 'ሰላሳ ሁለት', 33: 'ሰላሳ ሦስት', 34: 'ሰላሳ አራት', 35: 'ሰላሳ አምስት',
      36: 'ሰላሳ ስድስት', 37: 'ሰላሳ ሰባት', 38: 'ሰላሳ ስምንት', 39: 'ሰላሳ ዘጠኝ', 40: 'አርባ',
      41: 'አርባ አንድ', 42: 'አርባ ሁለት', 43: 'አርባ ሦስት', 44: 'አርባ አራት', 45: 'አርባ አምስት',
      46: 'አርባ ስድስት', 47: 'አርባ ሰባት', 48: 'አርባ ስምንት', 49: 'አርባ ዘጠኝ', 50: 'ሃምሳ',
      51: 'ሃምሳ አንድ', 52: 'ሃምሳ ሁለት', 53: 'ሃምሳ ሦስት', 54: 'ሃምሳ አራት', 55: 'ሃምሳ አምስት',
      56: 'ሃምሳ ስድስት', 57: 'ሃምሳ ሰባት', 58: 'ሃምሳ ስምንት', 59: 'ሃምሳ ዘጠኝ', 60: 'ስድሳ',
      61: 'ስድሳ አንድ', 62: 'ስድሳ ሁለት', 63: 'ስድሳ ሦስት', 64: 'ስድሳ አራት', 65: 'ስድሳ አምስት',
      66: 'ስድሳ ስድስት', 67: 'ስድሳ ሰባት', 68: 'ስድሳ ስምንት', 69: 'ስድሳ ዘጠኝ', 70: 'ሰባ',
      71: 'ሰባ አንድ', 72: 'ሰባ ሁለት', 73: 'ሰባ ሦስት', 74: 'ሰባ አራት', 75: 'ሰባ አምስት'
    },
    letters: {
      B: 'ቢ', I: 'አይ', N: 'ኤን', G: 'ጂ', O: 'ኦ'
    },
    phrases: {
      // Game phrases
      bingo: 'ቢንጎ!',
      congratulations: 'እንኳን ደስ አለዎት!',
      goodLuck: 'እድል ይስጥዎት!',
      gameStarted: 'ጨዋታው ተጀምሯል!',
      gameStarting: 'ጨዋታው ሊጀመር ነው!',
      waitingForPlayers: 'ተጫዋቾችን እየጠበቅን ነው',
      numberCalled: 'ቁጥር ተጠርቷል',
      youWon: 'አሸንፈዋል!',
      gameOver: 'ጨዋታው ተጠናቋል',
      
      // Voice Settings
      enableVoiceAnnouncements: 'ድምጽ ማስታወቂያዎችን ያንቁ',
      language: 'Language',
      voice: 'Voice',
      testingVoice: 'Testing...',
      testVoice: 'Test Voice',
      testingNumberCall: 'Testing...',
      testNumberCall: 'Test Number Call',
      saveChanges: 'Save Changes',
      noChanges: 'No Changes',
      resetChanges: 'Reset Changes',
      done: 'Done',
      
      // Common UI
      loading: 'Loading...',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      start: 'Start',
      stop: 'Stop',
      pause: 'Pause',
      resume: 'Resume',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information'
    },
    getNumberText: function(num: number) { return this.numbers[num] || num.toString(); },
    getLetterText: function(letter: string) { return this.letters[letter] || letter; }
  },
  {
    code: 'ti-ET',
    name: 'Tigrinya',
    nativeName: 'ትግርኛ',
    flag: '🇪🇹',
    numbers: {
      1: 'ሓደ', 2: 'ክልተ', 3: 'ሰለስተ', 4: 'አርባዕተ', 5: 'ሓሙሽተ',
      6: 'ሽድሽተ', 7: 'ሸውዓተ', 8: 'ሸሞንተ', 9: 'ትሽዓተ', 10: 'ዓሰርተ',
      11: 'ዓሰርተ ሓደ', 12: 'ዓሰርተ ክልተ', 13: 'ዓሰርተ ሰለስተ', 14: 'ዓሰርተ አርባዕተ', 15: 'ዓሰርተ ሓሙሽተ',
      16: 'ዓሰርተ ሽድሽተ', 17: 'ዓሰርተ ሸውዓተ', 18: 'ዓሰርተ ሸሞንተ', 19: 'ዓሰርተ ትሽዓተ', 20: 'ዕስራ',
      21: 'ዕስራ ሓደ', 22: 'ዕስራ ክልተ', 23: 'ዕስራ ሰለስተ', 24: 'ዕስራ አርባዕተ', 25: 'ዕስራ ሓሙሽተ',
      26: 'ዕስራ ሽድሽተ', 27: 'ዕስራ ሸውዓተ', 28: 'ዕስራ ሸሞንተ', 29: 'ዕስራ ትሽዓተ', 30: 'ሰላሳ',
      31: 'ሰላሳ ሓደ', 32: 'ሰላሳ ክልተ', 33: 'ሰላሳ ሰለስተ', 34: 'ሰላሳ አርባዕተ', 35: 'ሰላ��� ሓሙሽተ',
      36: 'ሰላሳ ሽድሽተ', 37: 'ሰላሳ ሸውዓተ', 38: 'ሰላሳ ሸሞንተ', 39: 'ሰላሳ ትሽዓተ', 40: 'አርባ',
      41: 'አርባ ሓደ', 42: 'አርባ ክልተ', 43: 'አርባ ሰለስተ', 44: 'አርባ አርባዕተ', 45: 'አርባ ሓሙሽተ',
      46: 'አርባ ሽድሽተ', 47: 'አርባ ሸውዓተ', 48: 'አርባ ሸሞንተ', 49: 'አርባ ትሽዓተ', 50: 'ሓምሳ',
      51: 'ሓምሳ ሓደ', 52: 'ሓምሳ ክልተ', 53: 'ሓምሳ ሰለስተ', 54: 'ሓምሳ አርባዕተ', 55: 'ሓምሳ ሓሙሽተ',
      56: 'ሓምሳ ሽድሽተ', 57: 'ሓምሳ ሸውዓተ', 58: 'ሓምሳ ሸሞንተ', 59: 'ሓምሳ ትሽዓተ', 60: 'ሱሳ',
      61: 'ሱሳ ሓደ', 62: 'ሱሳ ክልተ', 63: 'ሱሳ ሰለስተ', 64: 'ሱሳ አርባዕተ', 65: 'ሱሳ ሓሙሽተ',
      66: 'ሱሳ ሽድሽተ', 67: 'ሱሳ ሸውዓተ', 68: 'ሱሳ ሸሞንተ', 69: 'ሱሳ ትሽዓተ', 70: 'ሰብዓ',
      71: 'ሰብዓ ሓደ', 72: 'ሰብዓ ክልተ', 73: 'ሰብዓ ሰለስተ', 74: 'ሰብዓ አርባዕተ', 75: 'ሰብዓ ሓሙሽተ'
    },
    letters: {
      B: 'ቢ', I: 'አይ', N: 'ኤን', G: 'ጂ', O: 'ኦ'
    },
    phrases: {
      // Game phrases
      bingo: 'ቢንጎ!',
      congratulations: 'እ���ኳን ሓጎሰ!',
      goodLuck: 'ሓጎስ ይሃብካ!',
      gameStarted: 'ጸወታ ተጀሚሩ!',
      gameStarting: 'ጸወታ ክጅምር ኢዩ!',
      waitingForPlayers: 'ተጻወትቲ ንጽበ ኣለና',
      numberCalled: 'ቁጽሪ ተጸዊዑ',
      youWon: 'ዓወትካ!',
      gameOver: 'ጸወታ ተወዲኡ',
      
      // Voice Settings
      enableVoiceAnnouncements: 'ድምጺ ማስታወቂያታት ኣንቁ',
      language: 'Language',
      voice: 'Voice',
      testingVoice: 'Testing...',
      testVoice: 'Test Voice',
      testingNumberCall: 'Testing...',
      testNumberCall: 'Test Number Call',
      saveChanges: 'Save Changes',
      noChanges: 'No Changes',
      resetChanges: 'Reset Changes',
      done: 'Done',
      
      // Common UI
      loading: 'Loading...',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      start: 'Start',
      stop: 'Stop',
      pause: 'Pause',
      resume: 'Resume',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information'
    },
    getNumberText: function(num: number) { return this.numbers[num] || num.toString(); },
    getLetterText: function(letter: string) { return this.letters[letter] || letter; }
  },
  {
    code: 'om-ET',
    name: 'Oromo',
    nativeName: 'Afaan Oromoo',
    flag: '🇪🇹',
    numbers: {
      1: 'tokko', 2: 'lama', 3: 'sadii', 4: 'afur', 5: 'shan',
      6: 'ja\'a', 7: 'torba', 8: 'saddeet', 9: 'sagal', 10: 'kudhan',
      11: 'kudha tokko', 12: 'kudha lama', 13: 'kudha sadii', 14: 'kudha afur', 15: 'kudha shan',
      16: 'kudha ja\'a', 17: 'kudha torba', 18: 'kudha saddeet', 19: 'kudha sagal', 20: 'digdama',
      21: 'digdama tokko', 22: 'digdama lama', 23: 'digdama sadii', 24: 'digdama afur', 25: 'digdama shan',
      26: 'digdama ja\'a', 27: 'digdama torba', 28: 'digdama saddeet', 29: 'digdama sagal', 30: 'soddoma',
      31: 'soddoma tokko', 32: 'soddoma lama', 33: 'soddoma sadii', 34: 'soddoma afur', 35: 'soddoma shan',
      36: 'soddoma ja\'a', 37: 'soddoma torba', 38: 'soddoma saddeet', 39: 'soddoma sagal', 40: 'afurtama',
      41: 'afurtama tokko', 42: 'afurtama lama', 43: 'afurtama sadii', 44: 'afurtama afur', 45: 'afurtama shan',
      46: 'afurtama ja\'a', 47: 'afurtama torba', 48: 'afurtama saddeet', 49: 'afurtama sagal', 50: 'shantama',
      51: 'shantama tokko', 52: 'shantama lama', 53: 'shantama sadii', 54: 'shantama afur', 55: 'shantama shan',
      56: 'shantama ja\'a', 57: 'shantama torba', 58: 'shantama saddeet', 59: 'shantama sagal', 60: 'jaatama',
      61: 'jaatama tokko', 62: 'jaatama lama', 63: 'jaatama sadii', 64: 'jaatama afur', 65: 'jaatama shan',
      66: 'jaatama ja\'a', 67: 'jaatama torba', 68: 'jaatama saddeet', 69: 'jaatama sagal', 70: 'torbaatama',
      71: 'torbaatama tokko', 72: 'torbaatama lama', 73: 'torbaatama sadii', 74: 'torbaatama afur', 75: 'torbaatama shan'
    },
    letters: {
      B: 'Bii', I: 'Ayii', N: 'Een', G: 'Jii', O: 'Oo'
    },
    phrases: {
      // Game phrases
      bingo: 'Bingo!',
      congratulations: 'Baga gammadde!',
      goodLuck: 'Carraan siif haa ta\'u!',
      gameStarted: 'Taphi jalqabame!',
      gameStarting: 'Taphi jalqabamuu gahe!',
      waitingForPlayers: 'Taphattootaaf eegaa jirra',
      numberCalled: 'Lakkoofsi waamamee',
      youWon: 'Mo\'atte!',
      gameOver: 'Taphi xumurameera',
      
      // Voice Settings
      enableVoiceAnnouncements: 'Dhawaa sagalee mul\'isuu',
      language: 'Language',
      voice: 'Voice',
      testingVoice: 'Testing...',
      testVoice: 'Test Voice',
      testingNumberCall: 'Testing...',
      testNumberCall: 'Test Number Call',
      saveChanges: 'Save Changes',
      noChanges: 'No Changes',
      resetChanges: 'Reset Changes',
      done: 'Done',
      
      // Common UI
      loading: 'Loading...',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      start: 'Start',
      stop: 'Stop',
      pause: 'Pause',
      resume: 'Resume',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information'
    },
    getNumberText: function(num: number) { return this.numbers[num] || num.toString(); },
    getLetterText: function(letter: string) { return this.letters[letter] || letter; }
  },
  {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    numbers: {
      1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
      6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
      11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen',
      16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty',
      21: 'twenty-one', 22: 'twenty-two', 23: 'twenty-three', 24: 'twenty-four', 25: 'twenty-five',
      26: 'twenty-six', 27: 'twenty-seven', 28: 'twenty-eight', 29: 'twenty-nine', 30: 'thirty',
      31: 'thirty-one', 32: 'thirty-two', 33: 'thirty-three', 34: 'thirty-four', 35: 'thirty-five',
      36: 'thirty-six', 37: 'thirty-seven', 38: 'thirty-eight', 39: 'thirty-nine', 40: 'forty',
      41: 'forty-one', 42: 'forty-two', 43: 'forty-three', 44: 'forty-four', 45: 'forty-five',
      46: 'forty-six', 47: 'forty-seven', 48: 'forty-eight', 49: 'forty-nine', 50: 'fifty',
      51: 'fifty-one', 52: 'fifty-two', 53: 'fifty-three', 54: 'fifty-four', 55: 'fifty-five',
      56: 'fifty-six', 57: 'fifty-seven', 58: 'fifty-eight', 59: 'fifty-nine', 60: 'sixty',
      61: 'sixty-one', 62: 'sixty-two', 63: 'sixty-three', 64: 'sixty-four', 65: 'sixty-five',
      66: 'sixty-six', 67: 'sixty-seven', 68: 'sixty-eight', 69: 'sixty-nine', 70: 'seventy',
      71: 'seventy-one', 72: 'seventy-two', 73: 'seventy-three', 74: 'seventy-four', 75: 'seventy-five'
    },
    letters: {
      B: 'B', I: 'I', N: 'N', G: 'G', O: 'O'
    },
    phrases: {
      // Game phrases
      bingo: 'BINGO!',
      congratulations: 'Congratulations!',
      goodLuck: 'Good luck!',
      gameStarted: 'Game has started!',
      gameStarting: 'Game is starting!',
      waitingForPlayers: 'Waiting for players',
      numberCalled: 'Number called',
      youWon: 'You won!',
      gameOver: 'Game over',
      
      // Voice Settings
      enableVoiceAnnouncements: 'Enable Voice Announcements',
      language: 'Language',
      voice: 'Voice',
      testingVoice: 'Testing...',
      testVoice: 'Test Voice',
      testingNumberCall: 'Testing...',
      testNumberCall: 'Test Number Call',
      saveChanges: 'Save Changes',
      noChanges: 'No Changes',
      resetChanges: 'Reset Changes',
      done: 'Done',
      
      // Common UI
      loading: 'Loading...',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      start: 'Start',
      stop: 'Stop',
      pause: 'Pause',
      resume: 'Resume',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information'
    },
    getNumberText: function(num: number) { return this.numbers[num] || num.toString(); },
    getLetterText: function(letter: string) { return this.letters[letter] || letter; }
  }
];

class LanguageService {
  private currentLanguage: LanguageConfig;

  constructor() {
    const savedLanguage = localStorage.getItem('selectedLanguage') || '';
    const normalized = this.normalizeCode(savedLanguage);
    this.currentLanguage =
      ETHIOPIAN_LANGUAGES.find(lang => lang.code === normalized || lang.code.toLowerCase().startsWith(normalized.toLowerCase())) ||
      ETHIOPIAN_LANGUAGES[0];
  }

  getCurrentLanguage(): LanguageConfig {
    return this.currentLanguage;
  }

  setLanguage(languageCode: string): void {
    const normalized = this.normalizeCode(languageCode);
    const language = ETHIOPIAN_LANGUAGES.find(
      lang => lang.code === normalized || lang.code.toLowerCase().startsWith(normalized.toLowerCase())
    );
    if (language) {
      this.currentLanguage = language;
      localStorage.setItem('selectedLanguage', language.code);
    }
  }

  private normalizeCode(code: string): string {
    const c = (code || '').toLowerCase();
    if (c === 'am' || c.startsWith('am-')) return 'am-ET';
    if (c === 'en' || c.startsWith('en-')) return 'en-US';
    if (c === 'ti' || c.startsWith('ti-')) return 'ti-ET';
    if (c === 'om' || c.startsWith('om-')) return 'om-ET';
    return code || 'en-US';
  }

  getAvailableLanguages(): LanguageConfig[] {
    return ETHIOPIAN_LANGUAGES;
  }

  translateNumber(number: number): string {
    return this.currentLanguage.getNumberText(number);
  }

  translateLetter(letter: string): string {
    return this.currentLanguage.getLetterText(letter);
  }

  getPhrase(key: string): string {
    return this.currentLanguage.phrases[key] || key;
  }
}

export const languageService = new LanguageService();
