/**
 * Troubleshoot Reporter for Test Failures
 *
 * Auto-generates `output/troubleshoot/ISSUE-{NNN}-{test-name}.md` on test failure.
 *
 * Format:
 * - title
 * - what_failed
 * - expected
 * - actual
 * - probable_cause
 * - suggested_fix
 * - files_to_check
 * - severity
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

// Issue counter for unique naming
let issueCounter = 1

export interface TroubleReport {
  title: string
  testName: string
  expected: string
  actual: string
  probableCause: string
  suggestedFix: string
  filesToCheck: string[]
  severity: 'critical' | 'high' | 'medium' | 'low'
}

/**
 * Generates a troubleshoot report file from a test failure.
 * File is written to `output/troubleshoot/ISSUE-{NNN}-{sanitized-test-name}.md`
 */
export function generateTroubleshootReport(report: TroubleReport): string {
  const outputDir = join(process.cwd(), 'output', 'troubleshoot')

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  // Sanitize test name for filename
  const sanitized = report.testName
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .slice(0, 50)

  const issueNum = String(issueCounter++).padStart(3, '0')
  const filename = `ISSUE-${issueNum}-${sanitized}.md`
  const filepath = join(outputDir, filename)

  const content = formatReport(report)
  writeFileSync(filepath, content, 'utf-8')

  return filepath
}

function formatReport(report: TroubleReport): string {
  return `# Troubleshoot Report: ${report.title}

## Test Name
${report.testName}

## What Failed
${report.whatFailed || '(not specified)'}

## Expected
${report.expected}

## Actual
${report.actual}

## Probable Cause
${report.probableCause}

## Suggested Fix
${report.suggestedFix}

## Files to Check
${report.filesToCheck.length > 0 ? report.filesToCheck.map(f => `- \`${f}\``).join('\n') : '- (none listed)'}

## Severity
${report.severity.toUpperCase()} — ${getSeverityDescription(report.severity)}

---
*Generated: ${new Date().toISOString()}*
*Report ID: ISSUE-${String(issueCounter - 1).padStart(3, '0')}*
`
}

function getSeverityDescription(severity: TroubleReport['severity']): string {
  switch (severity) {
    case 'critical':
      return 'Data corruption, security breach, or complete system failure'
    case 'high':
      return 'Major functionality broken, potential data loss or security risk'
    case 'medium':
      return 'Functionality partially broken, workarounds available'
    case 'low':
      return 'Minor issue, cosmetic or edge case'
    default:
      return 'Unknown severity'
  }
}

/**
 * Example usage:
 *
 * import { generateTroubleshootReport } from './tests/helpers/troubleshoot-reporter'
 *
 * it('signSession throws when secret is empty', () => {
 *   try {
 *     process.env.SESSION_SECRET = ''
 *     expect(() => signSession({ test: true })).toThrow()
 *   } catch (e) {
 *     generateTroubleshootReport({
 *       title: 'signSession does not throw with empty secret',
 *       testName: 'signSession throws when secret is empty',
 *       expected: 'Error("SESSION_SECRET not set") thrown',
 *       actual: 'No error thrown',
 *       probableCause: 'signSession checks process.env.SESSION_SECRET || "" which is falsy but not undefined',
 *       suggestedFix: 'Ensure signSession throws when secret is empty string, not just undefined',
 *       filesToCheck: ['lib/auth.ts:16-17'],
 *       severity: 'high',
 *     })
 *     throw e
 *   }
 * })
 */

export {}
