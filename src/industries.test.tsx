import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Simulator from './pages/Simulator';
import { industriesConfig } from './industries';

// Mock the AI service
vi.mock('./services/gemini', () => ({
  generateAIResponse: vi.fn()
}));

describe('Industry Differences Automation Tests', () => {
  it('Healthcare config asks about medical departments or appointments', () => {
    const config = industriesConfig['Healthcare'];
    expect(config.systemPrompt).toMatch(/departments|appointment/i);
    expect(config.scenarios.some(s => s.title.match(/appointment/i))).toBe(true);
  });

  it('Real Estate config asks about property preferences or budgets', () => {
    const config = industriesConfig['Real Estate'];
    expect(config.systemPrompt).toMatch(/budget|preferences|ready-to-move/i);
    expect(config.scenarios.some(s => s.title.match(/budget/i))).toBe(true);
  });

  it('Education config asks about courses or admissions', () => {
    const config = industriesConfig['Education'];
    expect(config.systemPrompt).toMatch(/courses|admissions/i);
    expect(config.scenarios.some(s => s.title.match(/course/i))).toBe(true);
  });

  it('Manufacturing config asks about specifications or quantities', () => {
    const config = industriesConfig['Manufacturing'];
    expect(config.systemPrompt).toMatch(/specification|quantity/i);
    expect(config.scenarios.some(s => s.title.match(/quotation/i))).toBe(true);
  });

  it('Retail config asks about products, sizes, or orders', () => {
    const config = industriesConfig['Retail & E-commerce'];
    expect(config.systemPrompt).toMatch(/products|sizes|orders/i);
    expect(config.scenarios.some(s => s.title.match(/product/i))).toBe(true);
  });

  it('Hospitality config asks about check-in/check-out dates or room preferences', () => {
    const config = industriesConfig['Hospitality'];
    expect(config.systemPrompt).toMatch(/check-in|check-out|room/i);
    expect(config.scenarios.some(s => s.title.match(/room availability/i) || s.title.match(/check/i))).toBe(true);
  });

  it('Restaurants config asks about table reservations and party size', () => {
    const config = industriesConfig['Restaurants'];
    expect(config.systemPrompt).toMatch(/reservations|party size|table/i);
    expect(config.scenarios.some(s => s.title.match(/reserve/i))).toBe(true);
  });

  it('Automotive config asks about vehicles, test drives, or servicing', () => {
    const config = industriesConfig['Automotive'];
    expect(config.systemPrompt).toMatch(/vehicles|test drive|servicing/i);
    expect(config.scenarios.some(s => s.title.match(/test drive/i))).toBe(true);
  });

  it('Professional Services config asks about business requirements', () => {
    const config = industriesConfig['Professional Services'];
    expect(config.systemPrompt).toMatch(/business|requirements|consultation/i);
    expect(config.scenarios.some(s => s.title.match(/sales/i) || s.title.match(/quote/i))).toBe(true);
  });

  it('Logistics config asks about pickups, destinations, or shipment tracking', () => {
    const config = industriesConfig['Logistics'];
    expect(config.systemPrompt).toMatch(/pickup|destination|tracking/i);
    expect(config.scenarios.some(s => s.title.match(/pickup/i) || s.title.match(/tracking/i))).toBe(true);
  });
});

describe('Simulator Component Behavior', () => {
  const onBackMock = vi.fn();
  const onIndustryChangeMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Clears previous conversation and loads new industry context when industry changes', async () => {
    const { rerender } = render(
      <Simulator 
        industry="Healthcare" 
        scenarioId="book_dermatology" 
        onBack={onBackMock} 
        onIndustryChange={onIndustryChangeMock} 
      />
    );
    
    // Initial welcome message from Healthcare should be present
    expect(screen.getByText(industriesConfig['Healthcare'].welcomeMessage)).toBeTruthy();
    
    // Initial scenario message is sent automatically
    await waitFor(() => {
      expect(screen.getByText('I want to see a skin doctor.')).toBeTruthy();
    });

    // Rerender with new industry to simulate change
    rerender(
      <Simulator 
        industry="Real Estate" 
        scenarioId="find_2bhk" 
        onBack={onBackMock} 
        onIndustryChange={onIndustryChangeMock} 
      />
    );

    // Should contain new welcome message
    expect(screen.getByText(industriesConfig['Real Estate'].welcomeMessage)).toBeTruthy();

    // The previous scenario message from healthcare should no longer be in the document
    expect(screen.queryByText('I want to see a skin doctor.')).toBeNull();

    // New scenario message is sent automatically
    await waitFor(() => {
      expect(screen.getByText('I need a 2 BHK in Raipur.')).toBeTruthy();
    });
  });
});
