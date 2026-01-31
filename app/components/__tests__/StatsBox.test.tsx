/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatsBox from '../StatsBox'

const mockJobsData = {
  SAVED: [
    { id: '1', title: 'Job 1', status: 'SAVED' as const, position: 0 },
    { id: '2', title: 'Job 2', status: 'SAVED' as const, position: 1 },
  ],
  APPLIED: [
    { id: '3', title: 'Job 3', status: 'APPLIED' as const, position: 0 },
    { id: '4', title: 'Job 4', status: 'APPLIED' as const, position: 1 },
    { id: '5', title: 'Job 5', status: 'APPLIED' as const, position: 2 },
  ],
  INTERVIEWING: [
    { id: '6', title: 'Job 6', status: 'INTERVIEWING' as const, position: 0 },
  ],
  OFFER: [
    { id: '7', title: 'Job 7', status: 'OFFER' as const, position: 0 },
  ],
  REJECTED: [
    { id: '8', title: 'Job 8', status: 'REJECTED' as const, position: 0 },
    { id: '9', title: 'Job 9', status: 'REJECTED' as const, position: 1 },
  ],
  INTERVIEWED_BUT_REJECTED: [
    { id: '10', title: 'Job 10', status: 'INTERVIEWED_BUT_REJECTED' as const, position: 0 },
  ],
}

describe('StatsBox', () => {
  it('renders stats box with correct title', () => {
    render(<StatsBox columns={mockJobsData} />)
    
    expect(screen.getByText('Job Search Stats')).toBeInTheDocument()
    expect(screen.getByText('📊')).toBeInTheDocument()
  })

  it('calculates total jobs correctly', () => {
    render(<StatsBox columns={mockJobsData} />)
    
    // Find the total jobs specifically by looking for the text next to "Total Jobs:"
    expect(screen.getByText('Total Jobs:')).toBeInTheDocument()
    const totalJobsElement = screen.getByText('Total Jobs:').parentElement?.querySelector('.text-slate-800')
    expect(totalJobsElement).toHaveTextContent('10')
  })

  it('displays correct counts for each status', () => {
    render(<StatsBox columns={mockJobsData} />)
    
    // Applied: 3 jobs
    const appliedSection = screen.getByText('Applied:').parentElement
    expect(appliedSection?.querySelector('.text-sky-600')).toHaveTextContent('3')
    
    // Interviewing: 1 job  
    const interviewingSection = screen.getByText('Interviewing:').parentElement
    expect(interviewingSection?.querySelector('.text-amber-600')).toHaveTextContent('1')
    
    // Offers: 1 job
    const offersSection = screen.getByText('Offers:').parentElement
    expect(offersSection?.querySelector('.text-emerald-600')).toHaveTextContent('1')
    
    // Rejected: 2 + 1 = 3 jobs (REJECTED + INTERVIEWED_BUT_REJECTED)
    const rejectedSection = screen.getByText('Rejected:').parentElement
    expect(rejectedSection?.querySelector('.text-rose-600')).toHaveTextContent('3')
  })

  it('calculates percentages correctly', () => {
    render(<StatsBox columns={mockJobsData} />)
    
    // Applied: 3/10 = 30.0%
    const appliedSection = screen.getByText('Applied:').parentElement
    expect(appliedSection).toHaveTextContent('(30.0%)')
    
    // Interviewing: 1/10 = 10.0%
    const interviewingSection = screen.getByText('Interviewing:').parentElement
    expect(interviewingSection).toHaveTextContent('(10.0%)')
    
    // Offers: 1/10 = 10.0%
    const offersSection = screen.getByText('Offers:').parentElement
    expect(offersSection).toHaveTextContent('(10.0%)')
    
    // Rejected: (2 + 1)/10 = 30.0% (REJECTED + INTERVIEWED_BUT_REJECTED)
    const rejectedSection = screen.getByText('Rejected:').parentElement
    expect(rejectedSection).toHaveTextContent('(30.0%)')
  })

  it('calculates interview rate correctly', () => {
    render(<StatsBox columns={mockJobsData} />)
    
    // Interview rate: (1 interviewing + 1 interviewed_but_rejected) / (3 applied + 1 interviewing + 1 offer + 2 rejected + 1 interviewed_but_rejected) = 2/8 = 25.0%
    const interviewRateSection = screen.getByText('Interview Rate:').parentElement
    expect(interviewRateSection?.querySelector('.text-slate-800')).toHaveTextContent('25.0%')
    expect(screen.getByText(/Interviews \/ Total Applied/)).toBeInTheDocument()
  })

  it('calculates success rate correctly', () => {
    render(<StatsBox columns={mockJobsData} />)
    
    // Success rate: 1 offer / 8 total applied = 12.5%
    const successRateSection = screen.getByText('Success Rate:').parentElement
    expect(successRateSection?.querySelector('.text-slate-800')).toHaveTextContent('12.5%')
    expect(screen.getByText('Offers / Total Applied')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(<StatsBox columns={{}} />)
    
    // Should show 0 for total jobs
    const totalJobsElement = screen.getByText('Total Jobs:').parentElement?.querySelector('.text-slate-800')
    expect(totalJobsElement).toHaveTextContent('0')
    
    // Should show 0% for all categories
    expect(screen.getAllByText('(0%)')).toHaveLength(4)
  })

  it('handles missing status columns', () => {
    const partialData = {
      APPLIED: [
        { id: '1', title: 'Job 1', status: 'APPLIED' as const, position: 0 },
      ],
    }
    
    render(<StatsBox columns={partialData} />)
    
    // Total should be 1
    const totalJobsElement = screen.getByText('Total Jobs:').parentElement?.querySelector('.text-slate-800')
    expect(totalJobsElement).toHaveTextContent('1')
    
    // Applied should be 100%
    const appliedSection = screen.getByText('Applied:').parentElement
    expect(appliedSection).toHaveTextContent('(100.0%)')
    
    // Others should be 0%
    const otherPercentages = screen.getAllByText('(0.0%)')
    expect(otherPercentages).toHaveLength(3) // Interviewing, Offers, Rejected
  })

  it('shows success rate section only when there are jobs', () => {
    const { rerender } = render(<StatsBox columns={{}} />)
    
    // Should not show success rate when no jobs
    expect(screen.queryByText('Success Rate:')).not.toBeInTheDocument()
    
    // Should show success rate when there are jobs
    rerender(<StatsBox columns={mockJobsData} />)
    expect(screen.getByText('Success Rate:')).toBeInTheDocument()
  })

  it('handles zero applied jobs for success rate', () => {
    const noAppliedData = {
      SAVED: [
        { id: '1', title: 'Job 1', status: 'SAVED' as const, position: 0 },
      ],
      OFFER: [
        { id: '2', title: 'Job 2', status: 'OFFER' as const, position: 0 },
      ],
    }
    
    render(<StatsBox columns={noAppliedData} />)
    
    // Success rate should be 0% when no jobs applied
    const successRateSection = screen.getByText('Success Rate:').parentElement
    expect(successRateSection?.querySelector('.text-slate-800')).toHaveTextContent('0%')
  })

  it('has correct styling classes', () => {
    render(<StatsBox columns={mockJobsData} />)
    
    const statsBox = screen.getByText('Job Search Stats').closest('div')
    expect(statsBox).toHaveClass(
      'fixed',
      'left-6',
      'bottom-6',
      'bg-white',
      'rounded-lg',
      'border',
      'border-slate-200',
      'shadow-lg',
      'p-4',
      'min-w-[280px]',
      'z-40'
    )
  })
})
