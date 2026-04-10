import { describe, it, expect } from 'bun:test';
import { format } from 'date-fns';

describe('Utility Functions', () => {
  describe('Phone Number Normalization', () => {
    it('should remove non-digit characters', () => {
      const phone = '(11) 99999-8888';
      const normalized = phone.replace(/\D/g, '');
      expect(normalized).toBe('11999998888');
    });

    it('should handle international format', () => {
      const phone = '+55 (11) 99999-8888';
      const normalized = phone.replace(/\D/g, '');
      expect(normalized).toBe('5511999998888');
    });

    it('should handle plain numbers', () => {
      const phone = '11999998888';
      const normalized = phone.replace(/\D/g, '');
      expect(normalized).toBe('11999998888');
    });
  });

  describe('Date Formatting', () => {
    it('should format date for daily key', () => {
      const date = new Date('2024-03-15');
      const dailyKey = format(date, 'yyyy-MM-dd');
      expect(dailyKey).toBe('2024-03-15');
    });

    it('should format date for monthly key', () => {
      const date = new Date('2024-03-15');
      const monthlyKey = format(date, 'yyyy-MM');
      expect(monthlyKey).toBe('2024-03');
    });
  });

  describe('API Key Format', () => {
    it('should validate zzw- prefix', () => {
      const token = 'zzw-abc123def456ghi789jkl012mnop';
      expect(token.startsWith('zzw-')).toBe(true);
      expect(token.length).toBe(32);
    });

    it('should mask token for display', () => {
      const token = 'zzw-abc123def456ghi789jkl012';
      const first = token.slice(0, 4);
      const last = token.slice(-4);
      const masked = `${first}...${last}`;
      expect(masked).toBe('zzw-...l012');
    });
  });

  describe('Plan Limit Validation', () => {
    it('should allow unlimited plans', () => {
      const dailyLimit = 0;
      const hasLimit = dailyLimit > 0 && dailyLimit < 999999;
      expect(hasLimit).toBe(false);
    });

    it('should enforce daily limits', () => {
      const dailyLimit = 100;
      const today = format(new Date(), 'yyyy-MM-dd');
      const dailyUsage = 50;
      
      const withinLimit = dailyUsage < dailyLimit;
      expect(withinLimit).toBe(true);
    });

    it('should reject when over daily limit', () => {
      const dailyLimit = 100;
      const dailyUsage = 150;
      
      const withinLimit = dailyUsage < dailyLimit;
      expect(withinLimit).toBe(false);
    });
  });

  describe('Session Status', () => {
    it('should recognize connected status', () => {
      const status = 'connected';
      const isConnected = status === 'connected';
      expect(isConnected).toBe(true);
    });

    it('should recognize disconnected status', () => {
      const status = 'disconnected';
      const isConnected = status === 'connected';
      expect(isConnected).toBe(false);
    });
  });

  describe('URL Validation', () => {
    it('should accept valid HTTPS URLs', () => {
      const url = new URL('https://example.com/webhook');
      expect(['http:', 'https:'].includes(url.protocol)).toBe(true);
    });

    it('should reject HTTP URLs', () => {
      const url = new URL('http://example.com/webhook');
      const isValid = ['https:'].includes(url.protocol);
      expect(isValid).toBe(false);
    });

    it('should detect private IP addresses', () => {
      const privateIpRegex = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
      
      expect(privateIpRegex.test('127.0.0.1')).toBe(true);
      expect(privateIpRegex.test('10.0.0.1')).toBe(true);
      expect(privateIpRegex.test('172.16.0.1')).toBe(true);
      expect(privateIpRegex.test('192.168.1.1')).toBe(true);
      expect(privateIpRegex.test('8.8.8.8')).toBe(false);
    });

    it('should reject localhost', () => {
      const privateIpRegex = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|localhost|0\.0\.0\.0)/;
      expect(privateIpRegex.test('localhost')).toBe(true);
    });
  });
});
