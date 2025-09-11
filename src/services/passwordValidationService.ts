// Advanced Password Validation Service
export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
  issues: string[];
  suggestions: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    noCommonPatterns: boolean;
  };
  password?: string;
}

export class PasswordValidationService {
  private static readonly COMMON_PASSWORDS = new Set([
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'sunshine',
    'princess', 'qwerty123', 'football', 'baseball', 'superman', 'batman',
    'trustno1', 'hello123', 'freedom', 'whatever', 'qazwsx', 'password1',
    '12345678', '1234567', '1234567890', 'michael', 'jordan', 'harley',
    'rangers', 'joshua', 'maggie', 'hunter', 'michelle', 'charlie', 'andrew',
    'matthew', 'abigail', 'daniel', 'thomas', 'samantha', 'jessica', 'amanda'
  ]);

  private static readonly COMMON_PATTERNS = [
    /12345/, /qwert/, /asdfg/, /zxcvb/, /11111/, /00000/, /aaaaa/, /bbbbb/,
    /abcde/, /123123/, /qweqwe/, /asdasd/, /zxczxc/, /password/, /admin/,
    /user/, /login/, /welcome/, /hello/, /test/, /demo/, /guest/, /temp/
  ];

  /**
   * Comprehensive password validation
   */
  static validatePassword(password: string): PasswordValidationResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 0;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noCommonPatterns: !this.hasCommonPatterns(password)
    };

    // Length scoring
    if (password.length >= 12) score += 25;
    else if (password.length >= 10) score += 20;
    else if (password.length >= 8) score += 15;
    else {
      issues.push('Password too short (minimum 8 characters)');
      suggestions.push('Make your password at least 8 characters long');
    }

    // Character type scoring
    if (requirements.uppercase) score += 10;
    else {
      issues.push('Missing uppercase letter');
      suggestions.push('Add at least one uppercase letter (A-Z)');
    }

    if (requirements.lowercase) score += 10;
    else {
      issues.push('Missing lowercase letter');
      suggestions.push('Add at least one lowercase letter (a-z)');
    }

    if (requirements.numbers) score += 15;
    else {
      issues.push('Missing number');
      suggestions.push('Add at least one number (0-9)');
    }

    if (requirements.symbols) score += 20;
    else {
      issues.push('Missing special character');
      suggestions.push('Add at least one special character (!@#$%^&*)');
    }

    // Complexity scoring
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= 10) score += 15;
    else if (uniqueChars >= 8) score += 10;
    else if (uniqueChars >= 6) score += 5;
    else {
      issues.push('Too many repeated characters');
      suggestions.push('Use more diverse characters');
    }

    // Check for common passwords
    if (this.COMMON_PASSWORDS.has(password.toLowerCase())) {
      issues.push('Common password detected');
      score -= 30;
      suggestions.push('Avoid using common passwords');
    }

    // Check for common patterns
    if (!requirements.noCommonPatterns) {
      issues.push('Common pattern detected');
      score -= 20;
      suggestions.push('Avoid sequential or repeated patterns');
    }

    // Check for personal information patterns
    if (this.hasPersonalInfoPatterns(password)) {
      issues.push('Personal information pattern detected');
      score -= 15;
      suggestions.push('Avoid using personal information in passwords');
    }

    // Bonus for mixed case and symbols
    if (requirements.uppercase && requirements.lowercase && requirements.numbers && requirements.symbols) {
      score += 10;
    }

    // Determine strength level
    let strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
    if (score >= 90) strength = 'very-strong';
    else if (score >= 75) strength = 'strong';
    else if (score >= 60) strength = 'medium';
    else if (score >= 40) strength = 'weak';
    else strength = 'very-weak';

    // Additional suggestions based on score
    if (score < 60) {
      suggestions.push('Consider using a password manager for better security');
    }

    if (password.length < 12) {
      suggestions.push('Longer passwords are more secure');
    }

    return {
      isValid: score >= 60 && requirements.length,
      score: Math.max(0, Math.min(100, score)),
      strength,
      issues,
      suggestions,
      requirements
    };
  }

  /**
   * Check for common patterns in password
   */
  private static hasCommonPatterns(password: string): boolean {
    return this.COMMON_PATTERNS.some(pattern => pattern.test(password.toLowerCase()));
  }

  /**
   * Check for personal information patterns
   */
  private static hasPersonalInfoPatterns(password: string): boolean {
    const personalPatterns = [
      /\d{4}/, // Year patterns
      /\d{2}/, // Day/month patterns
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i, // Month names
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, // Day names
      /(name|user|login|email|phone|mobile|address)/i // Common personal terms
    ];

    return personalPatterns.some(pattern => pattern.test(password.toLowerCase()));
  }

  /**
   * Generate password strength indicator color
   */
  static getStrengthColor(strength: string): string {
    switch (strength) {
      case 'very-weak': return '#ff4444';
      case 'weak': return '#ff8800';
      case 'medium': return '#ffbb33';
      case 'strong': return '#00C851';
      case 'very-strong': return '#007E33';
      default: return '#666666';
    }
  }

  /**
   * Generate secure password suggestions
   */
  static generatePasswordSuggestions(): string[] {
    return [
      'Use a mix of letters, numbers, and symbols',
      'Make it at least 12 characters long',
      'Avoid common words and patterns',
      'Don\'t use personal information',
      'Consider using a passphrase',
      'Use unique passwords for each account'
    ];
  }

  /**
   * Real-time password validation with debouncing
   */
  static createRealTimeValidator() {
    let timeoutId: NodeJS.Timeout;
    let lastValidation: PasswordValidationResult | null = null;

    return {
      validate: (password: string, callback: (result: PasswordValidationResult) => void) => {
        clearTimeout(timeoutId);
        
        // Return cached result for immediate feedback
        if (lastValidation && password === lastValidation.password) {
          callback(lastValidation);
        }

        timeoutId = setTimeout(() => {
          const result = this.validatePassword(password);
          lastValidation = { ...result, password };
          callback(result);
        }, 300);
      }
    };
  }

  /**
   * Check if passwords match
   */
  static passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }

  /**
   * Get password requirements status
   */
  static getRequirementsStatus(password: string) {
    const result = this.validatePassword(password);
    return result.requirements;
  }
} 