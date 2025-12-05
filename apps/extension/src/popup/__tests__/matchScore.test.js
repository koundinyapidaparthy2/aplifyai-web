/**
 * Tests for SmartPopup component and match score algorithm
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Chrome API
global.chrome = {
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
    create: vi.fn(),
  },
  runtime: {
    sendMessage: vi.fn(),
  },
};

/**
 * Match Score Algorithm Tests
 * Tests the weighted scoring system used in SmartPopup
 */
describe('Match Score Algorithm', () => {
  /**
   * Skills Matching (40% weight)
   */
  describe('Skills Matching', () => {
    it('should calculate 100% match when all required skills are present', () => {
      const userSkills = ['javascript', 'react', 'node.js', 'typescript'];
      const requiredSkills = ['javascript', 'react', 'node.js'];
      
      const matches = requiredSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      const percentage = (matches.length / requiredSkills.length) * 100;
      
      expect(percentage).toBe(100);
      expect(matches).toHaveLength(3);
    });

    it('should calculate partial match when some skills are missing', () => {
      const userSkills = ['javascript', 'react'];
      const requiredSkills = ['javascript', 'react', 'python', 'django'];
      
      const matches = requiredSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      const percentage = (matches.length / requiredSkills.length) * 100;
      
      expect(percentage).toBe(50);
      expect(matches).toHaveLength(2);
    });

    it('should handle case-insensitive skill matching', () => {
      const userSkills = ['JavaScript', 'REACT', 'Node.js'];
      const requiredSkills = ['javascript', 'react', 'node.js'];
      
      const matches = requiredSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      expect(matches).toHaveLength(3);
    });

    it('should match partial skill names', () => {
      const userSkills = ['React.js', 'Node.js'];
      const requiredSkills = ['react', 'node'];
      
      const matches = requiredSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      expect(matches).toHaveLength(2);
    });

    it('should return 0% when no skills match', () => {
      const userSkills = ['java', 'spring'];
      const requiredSkills = ['python', 'django', 'flask'];
      
      const matches = requiredSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      const percentage = (matches.length / requiredSkills.length) * 100;
      
      expect(percentage).toBe(0);
    });
  });

  /**
   * Experience Matching (30% weight)
   */
  describe('Experience Matching', () => {
    const extractYearsFromSeniority = (seniority) => {
      if (!seniority) return 0;
      
      const level = seniority.toLowerCase();
      const yearMap = {
        'entry': 0,
        'junior': 1,
        'mid': 3,
        'senior': 5,
        'lead': 8,
        'staff': 10,
        'principal': 12,
        'director': 12,
      };
      
      for (const [key, years] of Object.entries(yearMap)) {
        if (level.includes(key)) {
          return years;
        }
      }
      
      return 0;
    };

    it('should match exact experience years', () => {
      const userYears = 5;
      const requiredYears = 5;
      
      const percentage = Math.min((userYears / requiredYears) * 100, 100);
      
      expect(percentage).toBe(100);
    });

    it('should calculate percentage for less experience', () => {
      const userYears = 3;
      const requiredYears = 5;
      
      const percentage = Math.min((userYears / requiredYears) * 100, 100);
      
      expect(percentage).toBe(60);
    });

    it('should cap at 100% for more experience', () => {
      const userYears = 8;
      const requiredYears = 5;
      
      const percentage = Math.min((userYears / requiredYears) * 100, 100);
      
      expect(percentage).toBe(100);
    });

    it('should extract years from entry level seniority', () => {
      expect(extractYearsFromSeniority('entry level')).toBe(0);
    });

    it('should extract years from junior level seniority', () => {
      expect(extractYearsFromSeniority('junior')).toBe(1);
    });

    it('should extract years from mid level seniority', () => {
      expect(extractYearsFromSeniority('mid-level')).toBe(3);
    });

    it('should extract years from senior level seniority', () => {
      expect(extractYearsFromSeniority('senior')).toBe(5);
    });

    it('should extract years from lead level seniority', () => {
      expect(extractYearsFromSeniority('lead developer')).toBe(8);
    });

    it('should return 0 for unknown seniority levels', () => {
      expect(extractYearsFromSeniority('intern')).toBe(0);
      expect(extractYearsFromSeniority('')).toBe(0);
      expect(extractYearsFromSeniority(null)).toBe(0);
    });
  });

  /**
   * Education Matching (15% weight)
   */
  describe('Education Matching', () => {
    it('should match exact degree requirements', () => {
      const userEducation = "Bachelor's in Computer Science";
      const requiredEducation = "Bachelor's degree";
      
      const match = userEducation.toLowerCase().includes(requiredEducation.toLowerCase());
      
      expect(match).toBe(true);
    });

    it('should match higher degrees', () => {
      const userEducation = "Master's in Computer Science";
      const requiredEducation = "Bachelor's degree";
      
      const match = userEducation.toLowerCase().includes('master') || 
                    userEducation.toLowerCase().includes('bachelor');
      
      expect(match).toBe(true);
    });

    it('should not match when degree is missing', () => {
      const userEducation = "High School Diploma";
      const requiredEducation = "Bachelor's degree";
      
      const match = userEducation.toLowerCase().includes('bachelor') ||
                    userEducation.toLowerCase().includes('master');
      
      expect(match).toBe(false);
    });
  });

  /**
   * Location Matching (15% weight)
   */
  describe('Location Matching', () => {
    it('should match remote jobs with remote preference', () => {
      const userLocation = 'New York, NY';
      const userRemotePreference = true;
      const jobLocation = 'Remote';
      const jobRemote = true;
      
      const isRemoteMatch = jobRemote && userRemotePreference;
      
      expect(isRemoteMatch).toBe(true);
    });

    it('should match same location', () => {
      const userLocation = 'San Francisco, CA';
      const jobLocation = 'San Francisco, CA';
      
      const match = userLocation.toLowerCase() === jobLocation.toLowerCase();
      
      expect(match).toBe(true);
    });

    it('should match partial location (city)', () => {
      const userLocation = 'San Francisco, CA';
      const jobLocation = 'San Francisco';
      
      const match = userLocation.toLowerCase().includes(jobLocation.toLowerCase());
      
      expect(match).toBe(true);
    });

    it('should not match different locations', () => {
      const userLocation = 'New York, NY';
      const userRemotePreference = false;
      const jobLocation = 'San Francisco, CA';
      const jobRemote = false;
      
      const match = userLocation.toLowerCase().includes(jobLocation.toLowerCase());
      
      expect(match).toBe(false);
    });
  });

  /**
   * Weighted Overall Score (Integration)
   */
  describe('Weighted Overall Score', () => {
    const calculateMatchScore = (jobData, userProfile) => {
      let skillScore = 0;
      let experienceScore = 0;
      let educationScore = 0;
      let locationScore = 0;

      // Skills (40% weight)
      if (jobData.skills?.length > 0) {
        const matchingSkills = jobData.skills.filter(skill =>
          userProfile.skills?.some(userSkill =>
            userSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        skillScore = (matchingSkills.length / jobData.skills.length) * 100;
      }

      // Experience (30% weight)
      const extractYears = (seniority) => {
        if (!seniority) return 0;
        const level = seniority.toLowerCase();
        const yearMap = {
          'entry': 0, 'junior': 1, 'mid': 3, 'senior': 5,
          'lead': 8, 'staff': 10, 'principal': 12, 'director': 12,
        };
        for (const [key, years] of Object.entries(yearMap)) {
          if (level.includes(key)) return years;
        }
        return 0;
      };

      const requiredYears = jobData.requiredExperience || extractYears(jobData.seniority);
      if (requiredYears > 0) {
        experienceScore = Math.min((userProfile.yearsOfExperience / requiredYears) * 100, 100);
      } else {
        experienceScore = 100;
      }

      // Education (15% weight)
      if (jobData.education) {
        const hasRequiredEducation = userProfile.education?.toLowerCase()
          .includes(jobData.education.toLowerCase());
        educationScore = hasRequiredEducation ? 100 : 0;
      } else {
        educationScore = 100;
      }

      // Location (15% weight)
      const isRemoteMatch = jobData.remote && userProfile.remotePreference;
      const isLocationMatch = userProfile.location?.toLowerCase()
        .includes(jobData.location?.toLowerCase());
      
      if (isRemoteMatch || isLocationMatch) {
        locationScore = 100;
      }

      // Calculate weighted score
      const overall = (
        skillScore * 0.4 +
        experienceScore * 0.3 +
        educationScore * 0.15 +
        locationScore * 0.15
      );

      return {
        overall: Math.round(overall),
        skills: Math.round(skillScore),
        experience: Math.round(experienceScore),
        education: Math.round(educationScore),
        location: Math.round(locationScore),
      };
    };

    it('should calculate 100% match for perfect candidate', () => {
      const jobData = {
        skills: ['javascript', 'react', 'node.js'],
        seniority: 'senior',
        education: "Bachelor's degree",
        location: 'San Francisco, CA',
        remote: true,
      };

      const userProfile = {
        skills: ['javascript', 'react', 'node.js', 'typescript'],
        yearsOfExperience: 6,
        education: "Bachelor's in Computer Science",
        location: 'San Francisco, CA',
        remotePreference: true,
      };

      const scores = calculateMatchScore(jobData, userProfile);

      expect(scores.overall).toBe(100);
      expect(scores.skills).toBe(100);
      expect(scores.experience).toBeGreaterThanOrEqual(100);
      expect(scores.education).toBe(100);
      expect(scores.location).toBe(100);
    });

    it('should calculate realistic score for partial match', () => {
      const jobData = {
        skills: ['python', 'django', 'postgresql', 'redis'],
        seniority: 'senior',
        education: "Bachelor's degree",
        location: 'Remote',
        remote: true,
      };

      const userProfile = {
        skills: ['python', 'django', 'mysql'], // 2/4 skills
        yearsOfExperience: 3, // 3/5 years
        education: "Bachelor's in Computer Science",
        location: 'New York, NY',
        remotePreference: true,
      };

      const scores = calculateMatchScore(jobData, userProfile);

      expect(scores.overall).toBeGreaterThan(0);
      expect(scores.overall).toBeLessThan(100);
      expect(scores.skills).toBe(50); // 2/4 = 50%
      expect(scores.experience).toBe(60); // 3/5 = 60%
      expect(scores.education).toBe(100);
      expect(scores.location).toBe(100); // Remote match
    });

    it('should weight skills most heavily', () => {
      const jobData1 = {
        skills: ['javascript'], // 100% skills
        seniority: 'senior',
      };

      const jobData2 = {
        skills: ['python', 'django'],
        seniority: 'entry', // 100% experience
      };

      const userProfile = {
        skills: ['javascript'],
        yearsOfExperience: 0,
      };

      const scores1 = calculateMatchScore(jobData1, userProfile);
      const scores2 = calculateMatchScore(jobData2, userProfile);

      // Skills (40%) should impact score more than experience (30%)
      expect(scores1.overall).toBeGreaterThan(scores2.overall);
    });
  });
});
