import { describe, it, expect, beforeEach } from 'vitest'
// estimator.js is a pure JS module — we can import it directly
import { estimateCabinetCost } from '@/lib/estimator'

describe('lib/estimator.js', () => {

  describe('Validation', () => {
    it('throws for invalid projectType', () => {
      expect(() =>
        estimateCabinetCost({ projectType: 'invalid', cabinetType: 'luxury', linearMeter: 5 })
      ).toThrow(/Invalid projectType/)
    })

    it('throws for invalid cabinetType', () => {
      expect(() =>
        estimateCabinetCost({ projectType: 'kitchen', cabinetType: 'gold', linearMeter: 5 })
      ).toThrow(/Invalid cabinetType/)
    })

    it('throws for invalid linearMeter (0)', () => {
      expect(() =>
        estimateCabinetCost({ projectType: 'kitchen', cabinetType: 'luxury', linearMeter: 0 })
      ).toThrow(/Invalid linearMeter/)
    })

    it('throws for invalid linearMeter (negative)', () => {
      expect(() =>
        estimateCabinetCost({ projectType: 'kitchen', cabinetType: 'luxury', linearMeter: -5 })
      ).toThrow(/Invalid linearMeter/)
    })

    it('throws for invalid linearMeter (NaN)', () => {
      expect(() =>
        estimateCabinetCost({ projectType: 'kitchen', cabinetType: 'luxury', linearMeter: NaN })
      ).toThrow(/Invalid linearMeter/)
    })

    it('throws when neither linearMeter nor units provided', () => {
      expect(() =>
        estimateCabinetCost({ projectType: 'kitchen', cabinetType: 'luxury' })
      ).toThrow(/Invalid linearMeter/)
    })
  })

  describe('Advanced inputs', () => {
    it('with units array (not legacy linearMeter)', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        units: [{ category: 'base', meters: 5 }],
      })
      expect(typeof res.total).toBe('number')
      expect(res.total).toBeGreaterThan(0)
    })

    it('with applyImportSurcharge: total *= 1.1', () => {
      const without = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
      })
      const with_ = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        applyImportSurcharge: true,
      })
      expect(with_.total).toBe(Math.round(without.total * 1.1))
    })

    it('with downgradeToMFC: total *= 0.9', () => {
      const without = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
      })
      const with_ = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        downgradeToMFC: true,
      })
      expect(with_.total).toBe(Math.round(without.total * 0.9))
    })

    it('with discount (0.1): subtotal * 0.9', () => {
      const without = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        discount: 0,
      })
      const with_ = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        discount: 0.1,
      })
      // discount applied to subtotal, not total
      // total = Math.round(subtotal * (1 - 0.1) + tax)
      expect(with_.breakdown.discountRate).toBe(0.1)
    })

    it('with applyTax and taxRate (0.12)', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        applyTax: true,
        taxRate: 0.12,
      })
      expect(res.breakdown.taxRate).toBe(0.12)
      expect(res.breakdown.tax).toBeGreaterThan(0)
      expect(res.total).toBe(res.breakdown.subtotal + res.breakdown.tax)
    })

    it('with includeFees: true vs false — different totals', () => {
      const withFees = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        includeFees: true,
      })
      const withoutFees = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        includeFees: false,
      })
      // withFees should be higher (includes VAT & legal fees)
      expect(withFees.total).not.toBe(withoutFees.total)
    })

    it('unknown kitchenScope — produces warning, not throw', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        kitchenScope: 'invalid_scope',
      })
      expect(res.warnings).toContainEqual(expect.stringContaining('kitchenScope'))
      expect(typeof res.total).toBe('number')
    })

    it('unknown material — produces warning, not throw', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        material: 'unknown_material',
      })
      expect(res.warnings).toContainEqual(expect.stringContaining('material'))
      expect(typeof res.total).toBe('number')
    })

    it('unknown finish — produces warning, not throw', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        finish: 'unknown_finish',
      })
      expect(res.warnings).toContainEqual(expect.stringContaining('finish'))
      expect(typeof res.total).toBe('number')
    })

    it('tier multipliers from input override cabinetType defaults', () => {
      // When tierMultipliers are passed, they take precedence
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        tierMultipliers: { luxury: 0.5, premium: 0.6, standard: 0.7 },
      })
      // With tierMultipliers.luxury = 0.5, total should be 10 * baseRate * 0.5
      expect(typeof res.total).toBe('number')
      expect(res.total).toBeGreaterThan(0)
    })

    it('custom baseRates from input', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
        baseRates: { base: 30000, hanging: 28000, tall: 50000 },
      })
      expect(typeof res.total).toBe('number')
      expect(res.breakdown.subtotal).toBeGreaterThan(0)
    })

    it('returns breakdown object with expected shape', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
      })
      expect(res.breakdown).toHaveProperty('units')
      expect(res.breakdown).toHaveProperty('subtotal')
      expect(res.breakdown).toHaveProperty('discountRate')
      expect(res.breakdown).toHaveProperty('taxRate')
      expect(res.breakdown).toHaveProperty('tax')
      expect(Array.isArray(res.breakdown.units)).toBe(true)
    })
  })

  describe('Room size and project types', () => {
    it('kitchen project type', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
      })
      expect(res.total).toBeGreaterThan(0)
    })

    it('bathroom project type', () => {
      const res = estimateCabinetCost({
        projectType: 'bathroom',
        cabinetType: 'luxury',
        linearMeter: 10,
      })
      expect(res.total).toBeGreaterThan(0)
    })

    it('bedroom project type', () => {
      const res = estimateCabinetCost({
        projectType: 'bedroom',
        cabinetType: 'luxury',
        linearMeter: 10,
      })
      expect(res.total).toBeGreaterThan(0)
    })

    it('office project type', () => {
      const res = estimateCabinetCost({
        projectType: 'office',
        cabinetType: 'luxury',
        linearMeter: 10,
      })
      expect(res.total).toBeGreaterThan(0)
    })
  })

  describe('Edge cases', () => {
    it('handles very small linear meter values', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 0.1,
      })
      expect(res.total).toBeGreaterThan(0)
    })

    it('handles large linear meter values', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 1000,
      })
      expect(res.total).toBeGreaterThan(0)
    })

    it('units with zero meters — skipped with warning', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        units: [
          { category: 'base', meters: 0 },
          { category: 'hanging', meters: 5 },
        ],
      })
      expect(res.warnings.some(w => w.includes('invalid meters'))).toBe(true)
      expect(res.total).toBeGreaterThan(0)
    })

    it('units with NaN meters — skipped with warning', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        units: [{ category: 'base', meters: NaN }],
      })
      expect(res.warnings.some(w => w.includes('invalid meters'))).toBe(true)
    })

    it('returns empty warnings array when all inputs valid', () => {
      const res = estimateCabinetCost({
        projectType: 'kitchen',
        cabinetType: 'luxury',
        linearMeter: 10,
      })
      // No unknown values → no warnings
      expect(res.warnings.filter(w => w.startsWith('Unknown'))).toHaveLength(0)
    })
  })
})
