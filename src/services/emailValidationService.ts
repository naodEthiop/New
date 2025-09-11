// Advanced Email Validation Service
export interface EmailValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  email?: string;
}

export class EmailValidationService {
  private static readonly DISPOSABLE_DOMAINS = new Set([
    'tempmail.org', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
    'yopmail.com', 'throwaway.email', 'temp-mail.org', 'sharklasers.com',
    'getairmail.com', 'mailnesia.com', 'maildrop.cc', 'mailcatch.com',
    'mailmetrash.com', 'trashmail.com', 'spam4.me', 'bccto.me',
    'chacuo.net', 'dispostable.com', 'mailnesia.com', 'mailnull.com'
  ]);

  private static readonly COMMON_DOMAINS = new Set([
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'protonmail.com', 'tutanota.com', 'zoho.com',
    'yandex.com', 'mail.ru', 'qq.com', '163.com', '126.com'
  ]);

  private static readonly ETHIOPIAN_DOMAINS = new Set([
    'ethionet.et', 'telecom.net.et', 'ethiotelecom.et', 'ethiopia.gov.et'
  ]);

  /**
   * Advanced email validation with multiple layers
   */
  static async validateEmail(email: string): Promise<EmailValidationResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Basic format validation
    if (!this.isValidFormat(email)) {
      return {
        isValid: false,
        score: 0,
        issues: ['Invalid email format'],
        suggestions: ['Please enter a valid email address'],
        riskLevel: 'high'
      };
    }

    const [localPart, domain] = email.toLowerCase().split('@');

    // Local part validation
    if (localPart.length < 2) {
      issues.push('Username too short');
      score -= 20;
    }

    if (localPart.length > 64) {
      issues.push('Username too long');
      score -= 15;
    }

    if (!/^[a-zA-Z0-9._%+-]+$/.test(localPart)) {
      issues.push('Username contains invalid characters');
      score -= 10;
    }

    // Domain validation
    if (domain.length < 3) {
      issues.push('Domain too short');
      score -= 25;
    }

    if (domain.length > 253) {
      issues.push('Domain too long');
      score -= 20;
    }

    // Check for disposable email domains
    if (this.DISPOSABLE_DOMAINS.has(domain)) {
      issues.push('Disposable email domain detected');
      score -= 40;
      suggestions.push('Please use a permanent email address');
    }

    // Check for common legitimate domains (bonus points)
    if (this.COMMON_DOMAINS.has(domain)) {
      score += 10;
    }

    // Check for Ethiopian domains (bonus points)
    if (this.ETHIOPIAN_DOMAINS.has(domain)) {
      score += 15;
    }

    // Check for suspicious patterns
    if (this.hasSuspiciousPatterns(email)) {
      issues.push('Suspicious email pattern detected');
      score -= 30;
    }

    // DNS validation (async)
    try {
      const dnsValid = await this.validateDNS(domain);
      if (!dnsValid) {
        issues.push('Domain does not have valid DNS records');
        score -= 35;
      }
    } catch (error) {
      issues.push('Unable to verify domain DNS');
      score -= 10;
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (score < 50) riskLevel = 'high';
    else if (score < 80) riskLevel = 'medium';

    // Additional suggestions based on score
    if (score < 70) {
      suggestions.push('Consider using a more reputable email provider');
    }

    if (localPart.includes('test') || localPart.includes('temp')) {
      suggestions.push('Avoid using temporary or test email addresses');
    }

    return {
      isValid: score >= 60,
      score: Math.max(0, Math.min(100, score)),
      issues,
      suggestions,
      riskLevel
    };
  }

  /**
   * Basic format validation using regex
   */
  private static isValidFormat(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Check for suspicious patterns in email
   */
  private static hasSuspiciousPatterns(email: string): boolean {
    const suspiciousPatterns = [
      /\d{10,}/, // Too many consecutive numbers
      /[a-zA-Z]{20,}/, // Too many consecutive letters
      /[._%+-]{3,}/, // Too many special characters
      /test\d*@/, // Test emails
      /temp\d*@/, // Temporary emails
      /fake\d*@/, // Fake emails
      /spam\d*@/, // Spam indicators
    ];

    return suspiciousPatterns.some(pattern => pattern.test(email));
  }

  /**
   * Validate DNS records for the domain
   */
  private static async validateDNS(domain: string): Promise<boolean> {
    try {
      // This would typically call a DNS validation service
      // For now, we'll simulate the check
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
      const data = await response.json();
      return data.Status === 0 && data.Answer && data.Answer.length > 0;
    } catch (error) {
      console.warn('DNS validation failed:', error);
      return false;
    }
  }

  /**
   * Real-time validation with debouncing
   */
  static createRealTimeValidator() {
    let timeoutId: NodeJS.Timeout;
    let lastValidation: EmailValidationResult | null = null;

    return {
      validate: async (email: string, callback: (result: EmailValidationResult) => void) => {
        clearTimeout(timeoutId);
        
        // Return cached result for immediate feedback
        if (lastValidation && email === lastValidation.email) {
          callback(lastValidation);
        }

        timeoutId = setTimeout(async () => {
          const result = await this.validateEmail(email);
          lastValidation = { ...result, email };
          callback(result);
        }, 500);
      }
    };
  }

  /**
   * Get email provider reputation score
   */
  static getProviderReputation(domain: string): number {
    if (this.COMMON_DOMAINS.has(domain)) return 90;
    if (this.ETHIOPIAN_DOMAINS.has(domain)) return 85;
    if (this.DISPOSABLE_DOMAINS.has(domain)) return 10;
    return 50; // Unknown domain
  }

  /**
   * Suggest alternative email providers
   */
  static getEmailSuggestions(domain: string): string[] {
    const suggestions = [];
    
    if (this.DISPOSABLE_DOMAINS.has(domain)) {
      suggestions.push('gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com');
    }
    
    if (!this.COMMON_DOMAINS.has(domain) && !this.ETHIOPIAN_DOMAINS.has(domain)) {
      suggestions.push('Consider using a well-known email provider');
    }
    
    return suggestions;
  }
} 