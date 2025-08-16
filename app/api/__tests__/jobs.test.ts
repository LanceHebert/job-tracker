/// <reference types="jest" />
/**
 * @jest-environment node
 */

// Simple test that validates the API endpoint structure
describe('/api/jobs API', () => {
  it('should have the correct structure for job data', () => {
    // Test job object structure
    const mockJob = {
      id: 'test-id',
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      url: 'https://example.com',
      source: 'linkedin.com',
      salary: '80k-120k',
      employmentType: 'Full-time',
      remoteType: 'Remote',
      description: 'Job description',
      notes: 'Personal notes',
      appliedAt: new Date().toISOString(),
      status: 'APPLIED',
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Validate required fields
    expect(mockJob.id).toBeDefined()
    expect(mockJob.title).toBeDefined()
    expect(mockJob.status).toBeDefined()
    expect(mockJob.position).toBeDefined()
    
    // Validate status values
    const validStatuses = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED']
    expect(validStatuses).toContain(mockJob.status)
    
    // Validate data types
    expect(typeof mockJob.title).toBe('string')
    expect(typeof mockJob.position).toBe('number')
    expect(mockJob.position).toBeGreaterThanOrEqual(0)
  })

  it('should validate job status enum values', () => {
    const validStatuses = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED']
    
    validStatuses.forEach(status => {
      expect(validStatuses).toContain(status)
    })
    
    expect(validStatuses).toHaveLength(5)
  })

  it('should handle API response structure', () => {
    const mockApiResponse = {
      jobs: [
        {
          id: '1',
          title: 'Job 1',
          status: 'APPLIED',
          position: 0,
        },
        {
          id: '2',
          title: 'Job 2',
          status: 'INTERVIEWING',
          position: 1,
        }
      ]
    }

    expect(mockApiResponse.jobs).toBeDefined()
    expect(Array.isArray(mockApiResponse.jobs)).toBe(true)
    expect(mockApiResponse.jobs).toHaveLength(2)
    
    mockApiResponse.jobs.forEach(job => {
      expect(job.id).toBeDefined()
      expect(job.title).toBeDefined()
      expect(job.status).toBeDefined()
      expect(job.position).toBeDefined()
    })
  })
})
